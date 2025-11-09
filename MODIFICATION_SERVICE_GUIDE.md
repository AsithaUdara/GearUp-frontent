# Modification Service - Backend Implementation Guide

## Service Overview

## Service Overview

- **Service Name**: `modification-request-service`
- **Port**: 8092 (assigned by supervisor)
- **Database**: PostgreSQL (port 5432)  
**Purpose**: Handle vehicle modification requests from customers

---

## 1. Database Schema (Flyway Migration)

**File**: `src/main/resources/db/migration/V1__init_modifications.sql`

```sql
CREATE TABLE IF NOT EXISTS modifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(64) NOT NULL,
    vehicle_id VARCHAR(255) NOT NULL,
    vehicle_label VARCHAR(500),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_status CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'rejected'))
);

-- Indexes
CREATE INDEX idx_modifications_user_id ON modifications(user_id);
CREATE INDEX idx_modifications_vehicle_id ON modifications(vehicle_id);
CREATE INDEX idx_modifications_status ON modifications(status);
CREATE INDEX idx_modifications_created_at ON modifications(created_at DESC);
```

---

## 2. Entity Class

**File**: `src/main/java/com/gearup/modification/entity/Modification.java`

```java
package com.gearup.modification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "modifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Modification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;
    
    @Column(name = "vehicle_id", nullable = false)
    private String vehicleId;
    
    @Column(name = "vehicle_label", length = 500)
    private String vehicleLabel;
    
    @Column(name = "subject", nullable = false, length = 500)
    private String subject;
    
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "status", nullable = false, length = 50)
    private String status = "pending";
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
```

---

## 3. Repository

**File**: `src/main/java/com/gearup/modification/repository/ModificationRepository.java`

```java
package com.gearup.modification.repository;

import com.gearup.modification.entity.Modification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModificationRepository extends JpaRepository<Modification, UUID> {
    List<Modification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Modification> findByVehicleIdOrderByCreatedAtDesc(String vehicleId);
    List<Modification> findByStatusOrderByCreatedAtDesc(String status);
}
```

---

## 4. DTOs

**File**: `src/main/java/com/gearup/modification/dto/ModificationRequest.java`

```java
package com.gearup.modification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ModificationRequest {
    
    private String userId;  // Can come from header or body
    
    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;
    
    private String vehicleLabel;  // Optional: "2025 Toyota GR Hilux — CBE-2938"
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotBlank(message = "Message is required")
    private String message;
}
```

**File**: `src/main/java/com/gearup/modification/dto/ModificationResponse.java`

```java
package com.gearup.modification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModificationResponse {
    private String id;
    private String userId;
    private String vehicleId;
    private String vehicleLabel;
    private String subject;
    private String message;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

## 5. Service Layer

**File**: `src/main/java/com/gearup/modification/service/ModificationService.java`

```java
package com.gearup.modification.service;

import com.gearup.modification.dto.ModificationRequest;
import com.gearup.modification.dto.ModificationResponse;
import com.gearup.modification.entity.Modification;
import com.gearup.modification.repository.ModificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModificationService {
    
    private final ModificationRepository repository;
    private static final Set<String> VALID_STATUSES = Set.of("pending", "approved", "in_progress", "completed", "rejected");
    
    @Transactional
    public ModificationResponse createModification(ModificationRequest request) {
        Modification modification = new Modification();
        modification.setUserId(request.getUserId());
        modification.setVehicleId(request.getVehicleId());
        modification.setVehicleLabel(request.getVehicleLabel());
        modification.setSubject(request.getSubject());
        modification.setMessage(request.getMessage());
        modification.setStatus("pending");
        
        Modification saved = repository.save(modification);
        log.info("Created modification request: {} for user: {}", saved.getId(), saved.getUserId());
        
        // TODO: Publish RabbitMQ event: modification.created
        publishEvent("modification.created", saved);
        
        return toResponse(saved);
    }
    
    public List<ModificationResponse> getByUserId(String userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public List<ModificationResponse> getByVehicleId(String vehicleId) {
        return repository.findByVehicleIdOrderByCreatedAtDesc(vehicleId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public Optional<ModificationResponse> getById(UUID id) {
        return repository.findById(id).map(this::toResponse);
    }
    
    @Transactional
    public ModificationResponse updateStatus(UUID id, String newStatus) {
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new IllegalArgumentException("Invalid status: " + newStatus + ". Must be one of: " + VALID_STATUSES);
        }
        
        Modification modification = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Modification not found: " + id));
        
        String oldStatus = modification.getStatus();
        modification.setStatus(newStatus);
        Modification updated = repository.save(modification);
        
        log.info("Updated modification {} status: {} -> {}", id, oldStatus, newStatus);
        
        // TODO: Publish RabbitMQ event: modification.status.changed
        publishEvent("modification.status.changed", updated);
        
        return toResponse(updated);
    }
    
    @Transactional
    public void deleteModification(UUID id) {
        Modification modification = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Modification not found: " + id));
        
        repository.delete(modification);
        log.info("Deleted modification: {}", id);
        
        // TODO: Publish RabbitMQ event: modification.deleted
        publishEvent("modification.deleted", modification);
    }
    
    private ModificationResponse toResponse(Modification mod) {
        return ModificationResponse.builder()
                .id(mod.getId().toString())
                .userId(mod.getUserId())
                .vehicleId(mod.getVehicleId())
                .vehicleLabel(mod.getVehicleLabel())
                .subject(mod.getSubject())
                .message(mod.getMessage())
                .status(mod.getStatus())
                .createdAt(mod.getCreatedAt())
                .updatedAt(mod.getUpdatedAt())
                .build();
    }
    
    private void publishEvent(String routingKey, Modification mod) {
        // TODO: Implement RabbitMQ event publishing
        log.debug("Event [{}]: modification={}, userId={}, status={}", 
                  routingKey, 
                  Objects.toString(mod.getId(), ""),
                  Objects.toString(mod.getUserId(), ""),
                  Objects.toString(mod.getStatus(), ""));
    }
}
```

---

## 6. Controller

**File**: `src/main/java/com/gearup/modification/controller/ModificationController.java`

```java
package com.gearup.modification.controller;

import com.gearup.modification.dto.ModificationRequest;
import com.gearup.modification.dto.ModificationResponse;
import com.gearup.modification.service.ModificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/api/modifications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ModificationController {
    
    private final ModificationService service;
    
    @PostMapping
    public ResponseEntity<?> createModification(
            @RequestHeader(value = "X-User-ID", required = false) String headerUserId,
            @Valid @RequestBody ModificationRequest request) {
        
        // Use header userId if body doesn't have it
        if (request.getUserId() == null || request.getUserId().isBlank()) {
            if (headerUserId == null || headerUserId.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "userId is required (in body or X-User-ID header)"));
            }
            request.setUserId(headerUserId);
        }
        
        try {
            ModificationResponse response = service.createModification(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating modification", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create modification: " + e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ModificationResponse>> getByUserId(@PathVariable String userId) {
        List<ModificationResponse> modifications = service.getByUserId(userId);
        return ResponseEntity.ok(modifications);
    }
    
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<ModificationResponse>> getByVehicleId(@PathVariable String vehicleId) {
        List<ModificationResponse> modifications = service.getByVehicleId(vehicleId);
        return ResponseEntity.ok(modifications);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try {
            UUID uuid = UUID.fromString(id);
            return service.getById(uuid)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid modification ID format"));
        }
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        
        try {
            UUID uuid = UUID.fromString(id);
            ModificationResponse response = service.updateStatus(uuid, status);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating modification status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update status: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteModification(@PathVariable String id) {
        try {
            UUID uuid = UUID.fromString(id);
            service.deleteModification(uuid);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting modification", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete modification: " + e.getMessage()));
        }
    }
}
```

---

## 7. Application Configuration

**File**: `src/main/resources/application.yml`

```yaml
server:
  port: 8092

spring:
  application:
    name: modification-service
  
  datasource:
    url: jdbc:postgresql://localhost:5432/gearup
    username: postgres
    password: password
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  
  flyway:
    enabled: true
    baseline-on-migrate: true

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true

management:
  endpoints:
    web:
      exposure:
        include: health,info
```

---

## 8. Main Application Class

**File**: `src/main/java/com/gearup/modification/ModificationServiceApplication.java`

```java
package com.gearup.modification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ModificationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ModificationServiceApplication.class, args);
    }
}
```

---

## 9. Docker Compose Entry

Add to your `docker-compose.yml`:

```yaml
  modification-service:
    build:
      context: ./modification-service
      dockerfile: Dockerfile
    container_name: gearup-modification-service
    ports:
      - "8092:8092"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/gearup
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=password
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://service-discovery:8761/eureka/
    depends_on:
      - postgres
      - service-discovery
    networks:
      - gearup-network
```

---

## 10. API Gateway Routes

Add to your API Gateway `application.yml`:

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: modification-service
          uri: lb://modification-service
          predicates:
            - Path=/api/modifications/**
```

---

## 11. Testing the Service

### Create Modification:
```bash
curl -X POST http://localhost:8092/api/modifications \
  -H 'Content-Type: application/json' \
  -H 'X-User-ID: Ofo0UP4OP0ca3HWeuUbe0wAeCcW2' \
  -d '{
    "vehicleId": "vehicle-uuid-here",
    "vehicleLabel": "2025 Toyota GR Hilux — CBE-2938",
    "subject": "TOYOTA HILUX ROOF MOUNTING KIT",
    "message": "I would like to install a roof mounting kit for camping gear"
  }'
```

### Get User's Modifications:
```bash
curl http://localhost:8092/api/modifications/user/Ofo0UP4OP0ca3HWeuUbe0wAeCcW2
```

### Update Status:
```bash
curl -X PATCH "http://localhost:8092/api/modifications/{id}/status?status=approved"
```

### Delete:
```bash
curl -X DELETE http://localhost:8092/api/modifications/{id}
```

---

## 12. Dependencies (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    
    <!-- Spring Cloud -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

---

## Summary

This guide provides a complete Spring Boot microservice implementation for modification requests with:

- **PostgreSQL database** with Flyway migrations
- **RESTful API** with proper CRUD operations
- **User-based filtering** via X-User-ID header
- **Status workflow**: pending → approved → in_progress → completed (or rejected)
- **Port**: 8092 (assigned by supervisor)
- **Docker compose** ready configuration
- **RabbitMQ event publishing** stubs for future integration

Pass this guide to your backend team for implementation!
