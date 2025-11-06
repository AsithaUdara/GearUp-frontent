# Cross-Service Communication Guide

## Overview

This guide explains how to implement and use cross-service communication in the GearUp microservices architecture using **RabbitMQ** (async messaging), **Eureka** (service discovery), and **API Gateway** (routing).

## Architecture

```
┌─────────────────┐
│   API Gateway   │ ← External requests (Port 8080)
│   (Port 8080)   │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
    ┌────▼─────┐       ┌────▼──────────┐
    │  Eureka  │       │   Services    │
    │  Server  │◄──────┤ (Discovery)   │
    │ (8761)   │       └───────────────┘
    └──────────┘
         │
    ┌────▼─────────────────────────────┐
    │  Registered Microservices:       │
    │  - notification-service (8081)   │
    │  - user-auth-service (8082)      │
    │  - vehicle-service (8083)        │
    │  - billing-service (8084)        │
    └──────────────────────────────────┘
                  │
         ┌────────▼─────────┐
         │    RabbitMQ      │ ← Async event messaging
         │   (Port 5672)    │
         └──────────────────┘
```

## Communication Patterns

### 1. **Asynchronous Communication (RabbitMQ)**

Best for: Event-driven workflows, background processing, decoupling services

**How it works:**
1. Service A publishes an event to RabbitMQ exchange
2. RabbitMQ routes the event to appropriate queues based on routing keys
3. Service B consumes the event from its queue
4. Processing happens asynchronously

**Example: Vehicle Booking Notification**

```java
// In vehicle-service: Publish event
@Autowired
private EventPublisher eventPublisher;

public void createBooking(BookingRequest request) {
    // Create booking logic...
    
    VehicleBookingCreatedEvent event = new VehicleBookingCreatedEvent(
        UUID.randomUUID().toString(),
        userId,
        LocalDateTime.now(),
        bookingId,
        vehicleId,
        vehicleName,
        customerName,
        startDate,
        endDate,
        totalAmount
    );
    
    // Publish to RabbitMQ
    eventPublisher.publishVehicleBookingCreated(event);
}

// In notification-service: Consume event
@RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
public void handleVehicleBookingCreatedEvent(VehicleBookingCreatedEvent event) {
    // Create notification for user
    notificationService.createNotification(event);
}
```

### 2. **Synchronous Communication (Feign + Eureka)**

Best for: Real-time data queries, immediate responses needed, transactional operations

**How it works:**
1. Service A needs data from Service B
2. Service A uses Feign client to make REST call
3. Eureka resolves service name to actual instance(s)
4. Load balancing happens automatically
5. Response is returned synchronously

**Example: Get User Details**

```java
// 1. Define Feign Client
@FeignClient(
    name = "user-auth-service",  // Service name in Eureka
    fallback = UserServiceClientFallback.class
)
public interface UserServiceClient {
    @GetMapping("/api/users/{userId}")
    UserDetailsResponse getUserDetails(@PathVariable("userId") String userId);
}

// 2. Use in your service
@Service
public class NotificationEnrichmentService {
    
    @Autowired
    private UserServiceClient userServiceClient;
    
    public EnrichedNotification enrichWithUserData(Notification notification) {
        // Synchronous call to user-auth-service
        UserDetailsResponse user = userServiceClient.getUserDetails(notification.getUserId());
        
        return new EnrichedNotification(notification, user);
    }
}
```

### 3. **API Gateway Routing**

Best for: External client access, unified entry point, cross-cutting concerns

**How it works:**
1. Client sends request to API Gateway (port 8080)
2. Gateway routes based on path patterns
3. Service discovery via Eureka
4. Response returned to client

**Example Configuration:**

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: notification-route
          uri: lb://notification-service  # Load-balanced via Eureka
          predicates:
            - Path=/api/notifications/**
          filters:
            - StripPrefix=1
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
```

## Setup Instructions

### 1. Start Infrastructure Services

```bash
# Start RabbitMQ, Redis, PostgreSQL via Docker Compose
cd deployment/docker
docker-compose up -d postgres rabbitmq redis

# Verify services
docker ps
```

### 2. Start Eureka Server

```bash
# From project root
./mvnw clean install -pl service-discovery -am
./mvnw spring-boot:run -pl service-discovery

# Access Eureka Dashboard: http://localhost:8761
# Username: admin
# Password: password
```

### 3. Start API Gateway

```bash
./mvnw clean install -pl api-gateway -am
./mvnw spring-boot:run -pl api-gateway

# Gateway accessible at: http://localhost:8080
```

### 4. Start Microservices

```bash
# Start notification-service
cd services/notification-service
./mvnw spring-boot:run

# Start other services similarly
# Each service will auto-register with Eureka
```

### 5. Verify Setup

**Check Eureka Dashboard:**
```
http://localhost:8761
```
You should see all services registered.

**Check RabbitMQ Management:**
```
http://localhost:15672
Username: guest
Password: guest
```

**Test Cross-Service Communication:**
```bash
# Via API Gateway
curl http://localhost:8080/api/notifications/cross-service-test/health

# Direct service call
curl http://localhost:8081/api/cross-service-test/user/test-user-123
```

## Configuration Files

### Notification Service (`application.properties`)

```properties
# Service Registration
spring.application.name=notification-service
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true

# Feign Client Settings
feign.client.config.default.connectTimeout=5000
feign.client.config.default.readTimeout=5000
feign.circuitbreaker.enabled=true

# RabbitMQ
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
```

### API Gateway (`application.yml`)

```yaml
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true  # Auto-create routes from Eureka
      routes:
        - id: notification-service
          uri: lb://notification-service
          predicates:
            - Path=/api/notifications/**

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

## Testing Cross-Service Communication

### 1. Test RabbitMQ Event Flow

```bash
# Simulate a vehicle booking event
curl -X POST http://localhost:8081/api/events/simulate/vehicle-booking-created?userId=user123

# Check notifications were created
curl http://localhost:8081/api/notifications/user/user123
```

### 2. Test Feign Client Communication

```bash
# Test cross-service REST call
curl http://localhost:8081/api/cross-service-test/user/test-user-123

# Expected response:
{
  "success": true,
  "message": "Successfully fetched user details from user-auth-service",
  "userDetails": {
    "userId": "test-user-123",
    "email": "test@example.com",
    "displayName": "Test User"
  },
  "communicationMethod": "Feign Client + Eureka Discovery"
}
```

### 3. Test via API Gateway

```bash
# Route through API Gateway
curl http://localhost:8080/api/notifications/cross-service-test/health

# With authentication (if Firebase is configured)
curl -H "Authorization: Bearer <firebase-token>" \
     http://localhost:8080/api/notifications/user/user123
```

## RabbitMQ Exchange and Queue Setup

### Exchange Configuration

```java
@Bean
public TopicExchange notificationExchange() {
    return new TopicExchange(NOTIFICATION_EXCHANGE);
}
```

### Queue Bindings

| Service | Queue Name | Routing Key Pattern | Purpose |
|---------|-----------|---------------------|---------|
| notification-service | notification.queue | `*.created`, `*.updated` | Receive all entity creation/update events |
| billing-service | billing.queue | `invoice.*` | Invoice-related events |
| vehicle-service | vehicle.queue | `booking.*`, `maintenance.*` | Vehicle operations |

### Publishing Events

```java
// In any service
@Autowired
private EventPublisher eventPublisher;

// Publish event
VehicleBookingCreatedEvent event = new VehicleBookingCreatedEvent(...);
eventPublisher.publishVehicleBookingCreated(event);
```

### Consuming Events

```java
@Component
public class EventListener {
    
    @RabbitListener(queues = "notification.queue")
    public void handleEvent(BaseNotificationEvent event) {
        // Process event
    }
}
```

## Error Handling and Resilience

### Circuit Breaker Pattern

Feign clients automatically use circuit breakers to prevent cascading failures:

```java
@Component
public class UserServiceClientFallback implements UserServiceClient {
    
    @Override
    public UserDetailsResponse getUserDetails(String userId) {
        // Return cached or default data when service is down
        return new UserDetailsResponse(userId, "unavailable@example.com", "Unknown");
    }
}
```

### Retry Configuration

```properties
# Feign retry configuration
feign.client.config.default.retryer.period=1000
feign.client.config.default.retryer.maxPeriod=5000
feign.client.config.default.retryer.maxAttempts=3
```

### Dead Letter Queue (RabbitMQ)

```java
@Bean
public Queue notificationDeadLetterQueue() {
    return QueueBuilder.durable("notification.dlq")
            .withArgument("x-message-ttl", 86400000) // 24 hours
            .build();
}
```

## Monitoring and Debugging

### Eureka Dashboard
- **URL:** http://localhost:8761
- Shows all registered services, health status, instances

### RabbitMQ Management
- **URL:** http://localhost:15672
- Monitor queues, exchanges, message rates
- View message details and bindings

### Service Health Endpoints

```bash
# Notification Service
curl http://localhost:8081/actuator/health

# API Gateway
curl http://localhost:8080/actuator/health

# Eureka Server
curl http://localhost:8761/actuator/health
```

### Debug Logs

```properties
# Enable debug logging
logging.level.com.gearup=DEBUG
logging.level.org.springframework.cloud.openfeign=DEBUG
logging.level.org.springframework.amqp=DEBUG
```

## Best Practices

### 1. **When to Use Async vs Sync**

**Use RabbitMQ (Async):**
- ✅ Event notifications (booking created, invoice generated)
- ✅ Background processing (email sending, report generation)
- ✅ Fire-and-forget operations
- ✅ Services should remain decoupled

**Use Feign (Sync):**
- ✅ Immediate data needed (user details, inventory check)
- ✅ Transactional operations requiring confirmation
- ✅ Direct request-response pattern
- ✅ Timeout is acceptable

### 2. **Service Naming Convention**

```
{domain}-service
Examples:
- notification-service
- user-auth-service
- vehicle-service
- billing-service
```

### 3. **Event Naming Convention**

```
{Entity}{Action}Event
Examples:
- VehicleBookingCreatedEvent
- InvoiceCreatedEvent
- TaskAssignedEvent
```

### 4. **Routing Key Pattern**

```
{entity}.{action}
Examples:
- vehicle.booking.created
- invoice.paid
- task.assigned
```

## Troubleshooting

### Service Not Registering with Eureka

**Check:**
1. Eureka server is running
2. `spring.application.name` is set
3. `eureka.client.register-with-eureka=true`
4. Network connectivity to Eureka server

**Fix:**
```bash
# Verify Eureka URL
curl http://localhost:8761/eureka/apps
```

### Feign Client Fails

**Symptoms:** 
- `FeignException: Service not found`
- Connection timeout

**Check:**
1. Target service is registered in Eureka
2. Service name matches exactly
3. Fallback is implemented

**Debug:**
```properties
feign.client.config.default.loggerLevel=FULL
logging.level.com.gearup.notificationservice.client=DEBUG
```

### RabbitMQ Messages Not Consumed

**Check:**
1. RabbitMQ is running
2. Exchange and queue exist
3. Binding is correct
4. Message format matches consumer

**Debug:**
```bash
# List queues
docker exec rabbitmq rabbitmqctl list_queues

# Check bindings
docker exec rabbitmq rabbitmqctl list_bindings
```

## Example: Complete Flow

### Scenario: User books a vehicle

1. **User makes request via API Gateway:**
   ```
   POST http://localhost:8080/api/vehicles/bookings
   ```

2. **API Gateway routes to vehicle-service:**
   ```
   Gateway → Eureka (resolve vehicle-service) → vehicle-service:8083
   ```

3. **vehicle-service creates booking and publishes event:**
   ```java
   // Create booking in database
   Booking booking = bookingRepository.save(newBooking);
   
   // Publish event to RabbitMQ
   VehicleBookingCreatedEvent event = new VehicleBookingCreatedEvent(...);
   eventPublisher.publishVehicleBookingCreated(event);
   ```

4. **RabbitMQ routes event to notification-service:**
   ```
   vehicle-service → RabbitMQ (notification.exchange) 
                  → notification.queue 
                  → notification-service
   ```

5. **notification-service consumes event:**
   ```java
   @RabbitListener(queues = "notification.queue")
   public void handleBookingCreated(VehicleBookingCreatedEvent event) {
       // Fetch user details via Feign (synchronous)
       UserDetailsResponse user = userServiceClient.getUserDetails(event.getUserId());
       
       // Create notification
       Notification notification = createNotification(event, user);
       notificationRepository.save(notification);
   }
   ```

6. **User receives notification:**
   ```
   WebSocket → Frontend OR
   Poll endpoint: GET /api/notifications/user/{userId}
   ```

## Production Considerations

### High Availability

1. **Multiple instances of each service**
2. **Load balancing via Eureka**
3. **RabbitMQ clustering**
4. **Redis Sentinel/Cluster**

### Security

1. **Service-to-service authentication (JWT)**
2. **API Gateway authentication (Firebase)**
3. **RabbitMQ user permissions**
4. **Network policies in Kubernetes**

### Monitoring

1. **Distributed tracing (Zipkin/Jaeger)**
2. **Metrics (Prometheus + Grafana)**
3. **Centralized logging (ELK Stack)**
4. **Health checks and alerts**

---

## Quick Reference

### Port Mapping

| Service | Port | Purpose |
|---------|------|---------|
| Eureka Server | 8761 | Service Discovery |
| API Gateway | 8080 | External Entry Point |
| notification-service | 8081 | Notifications |
| user-auth-service | 8082 | Authentication |
| RabbitMQ | 5672 | AMQP Protocol |
| RabbitMQ Management | 15672 | Web UI |
| Redis | 6379 | Cache/Session |
| PostgreSQL | 5432 | Database |

### Environment Variables

```bash
# Eureka
EUREKA_SERVER_URL=http://eureka-server:8761/eureka/

# RabbitMQ
SPRING_RABBITMQ_HOST=rabbitmq
SPRING_RABBITMQ_PORT=5672
SPRING_RABBITMQ_USERNAME=guest
SPRING_RABBITMQ_PASSWORD=guest

# Redis
SPRING_REDIS_HOST=redis
SPRING_REDIS_PORT=6379
```

### Useful Commands

```bash
# Build all services
./mvnw clean install

# Run specific service
./mvnw spring-boot:run -pl services/notification-service

# Check Eureka registered services
curl http://localhost:8761/eureka/apps | jq

# RabbitMQ queue stats
curl -u guest:guest http://localhost:15672/api/queues

# Test event simulator
curl -X POST http://localhost:8081/api/events/simulate/all?userId=test-user
```

---

**For more information, see:**
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Spring Cloud Netflix Eureka](https://cloud.spring.io/spring-cloud-netflix/reference/html/)
- [Spring Cloud OpenFeign](https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/)
- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)
