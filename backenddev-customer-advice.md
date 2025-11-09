# Backend Developer Guide: Customer and Vehicle Services

This document is a ready-to-implement blueprint for bringing up two backend microservices that match the current frontend: Vehicle Service and Customer Service. It follows the cross-service communication stack described in `CROSS_SERVICE_COMMUNICATION.md` (Spring Cloud Gateway, Eureka, RabbitMQ, PostgreSQL).

---

## TL;DR

- Bring up infrastructure: PostgreSQL, RabbitMQ, Eureka, API Gateway.
- Implement two services:
  - vehicle-service (CRUD + status + events)
  - customer-service (profiles + KYC + events)
- Use RabbitMQ topics for events; expose REST APIs via the Gateway.
- Persist to PostgreSQL using Flyway migrations.
- Authenticate requests at the Gateway with Firebase ID tokens; pass `X-User-ID` downstream.

---

## Alignment with current frontend (Next.js)

The current frontend uses Firebase directly:

- Auth: Firebase Authentication (ID token via `user.getIdToken()`).
- Firestore in use by UI:
  - `users/{uid}`: profile (displayName, phone, photoURL, idNumber, address, birthday)
  - `users/{uid}/vehicles/{vehicleId}`: vehicles (make, model, year, numberPlate, photoURL, createdAt)
  - `modifications/{id}`: modification requests (userId, vehicleId, vehicleLabel, subject, message, status, createdAt)
  - `appointments/{id}`: appointments (userId, serviceName, appointmentDate, timeSlot, status, appointmentAt)

Backend implications:

- Phase 1: keep frontend with Firestore; stand up Vehicle/Customer services for admin/analytics. Optionally mirror Firestore changes to PostgreSQL via Cloud Functions that publish RabbitMQ events.
- Phase 2: migrate frontend writes to API Gateway; services persist to PostgreSQL and write-through to Firestore until reads are migrated.
- Phase 3: migrate reads to services; later add appointments/modifications services (mirror existing status strings exactly: `pending | approved | in_progress | completed | rejected`).

Auth headers expected by services:
- Gateway validates Firebase token and injects `X-User-ID: <firebaseUid>` for downstream services.

Data shape parity to keep:
- Vehicle: `{ make, model, year (string or number), numberPlate, photoURL?, userId }`.
- Appointment: `{ userId, serviceName, appointmentDate (YYYY-MM-DD), timeSlot, status, appointmentAt }`.
- Modification: `{ userId, vehicleId, vehicleLabel?, subject, message, status }`.

Dev-only images:
- With `NEXT_PUBLIC_LOCAL_UPLOAD=1`, the frontend writes images to `public/local_uploads/...` and stores absolute `photoURL`. Treat `photoURL` as an opaque URL.

## Service Responsibilities

### Vehicle Service
- Owns: vehicle inventory for each user (customer)
- Endpoints (exposed via Gateway):
  - GET /api/vehicles/user/{userId}
  - GET /api/vehicles/{vehicleId}
  - POST /api/vehicles (body = vehicle; header X-User-ID)
  - PUT /api/vehicles/{vehicleId}
  - DELETE /api/vehicles/{vehicleId}
  - PATCH /api/vehicles/{vehicleId}/status?status=AVAILABLE|IN_SERVICE|MAINTENANCE
- Events (RabbitMQ):
  - vehicle.created
  - vehicle.updated
  - vehicle.status.changed
- DB: PostgreSQL tables `vehicles` (+ indexes)
 
Frontend mapping today:

- Frontend reads/writes `users/{uid}/vehicles` in Firestore with `make, model, year (string), numberPlate, photoURL, createdAt`.
- For migration, accept `year` as string or number and normalize to integer; keep `photoURL` optional.

### Customer Service
- Owns: customer identity profile (mirror of key Firebase fields + extended KYC)
- Endpoints (exposed via Gateway):
  - GET /api/customers/{firebaseUid}
  - POST /api/customers (register)
  - PUT /api/customers/{firebaseUid}
  - PATCH /api/customers/{firebaseUid}/kyc?status=NOT_STARTED|PENDING|VERIFIED|REJECTED
- Events (RabbitMQ):
  - customer.registered
  - customer.updated
  - customer.kyc.changed
- DB: PostgreSQL tables `customers`, `verification_documents` (optional, for future)
 
Frontend mapping today:

- Frontend updates `users/{uid}` doc and Firebase Auth profile. Customer Service should mirror these fields; during migration, either write-through to Firestore or reconcile via a scheduled job/Function.

---

## Infrastructure

### Docker Compose (infra only)

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_USER: postgres
      POSTGRES_DB: gearup
    ports: ["5432:5432"]
    volumes:
      - pgdata:/var/lib/postgresql/data

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest

  eureka:
    image: eurekaserver:latest # or run locally with Spring Boot
    ports: ["8761:8761"]

  gateway:
    image: apigateway:latest # or run locally with Spring Boot
    ports: ["8080:8080"]

volumes:
  pgdata:
```

### Eureka & Gateway

- Eureka URL: http://localhost:8761
- Gateway: http://localhost:8080

`application.yml` for Gateway routes:
```yaml
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
      routes:
        - id: vehicle-service
          uri: lb://vehicle-service
          predicates:
            - Path=/api/vehicles/**
        - id: customer-service
          uri: lb://customer-service
          predicates:
            - Path=/api/customers/**

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

---

## Authentication at the Gateway

- Validate Firebase ID tokens at the Gateway; on success, forward:
  - `Authorization: Bearer <id-token>` (optional)
  - `X-User-ID: <firebaseUid>` (required for downstream services)

Pseudo-filter for Firebase token validation (Spring Cloud Gateway):
```java
@Component
public class FirebaseAuthFilter implements GlobalFilter, Ordered {
  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    List<String> auth = exchange.getRequest().getHeaders().getOrEmpty(HttpHeaders.AUTHORIZATION);
    if (auth.isEmpty() || !auth.get(0).startsWith("Bearer ")) {
      return chain.filter(exchange); // allow public endpoints
    }
    String token = auth.get(0).substring(7);
    return Mono.fromCallable(() -> FirebaseAuth.getInstance().verifyIdToken(token))
      .subscribeOn(Schedulers.boundedElastic())
      .flatMap(decoded -> {
        String uid = decoded.getUid();
        ServerHttpRequest mutated = exchange.getRequest().mutate()
          .header("X-User-ID", uid)
          .build();
        return chain.filter(exchange.mutate().request(mutated).build());
      });
  }
  @Override public int getOrder() { return -1; }
}
```

---

## Database Schemas (Flyway)

Create a DB per service or a shared DB with separate schemas (simpler for local: one DB `gearup`).

### Vehicle Service Migration: `V1__init.sql`
```sql
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  number_plate TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_user ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
```

### Customer Service Migration: `V1__init.sql`
```sql
CREATE TABLE IF NOT EXISTS customers (
  firebase_uid VARCHAR(64) PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  phone TEXT,
  photo_url TEXT,
  id_number TEXT,
  address TEXT,
  birthday TEXT,
  kyc_status VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID PRIMARY KEY,
  firebase_uid VARCHAR(64) NOT NULL REFERENCES customers(firebase_uid),
  doc_type TEXT NOT NULL,
  doc_url TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
```

---

## Spring Boot Configuration

Shared patterns for both services:

`application.properties`
```properties
spring.application.name=vehicle-service # or customer-service
server.port=8083 # 8082 for customer-service

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true

# PostgreSQL (adjust DB name per service if preferred)
spring.datasource.url=jdbc:postgresql://localhost:5432/gearup
spring.datasource.username=postgres
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration

# RabbitMQ
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
```

---

## Vehicle Service Contracts

### Entity JSON
```json
{
  "id": "UUID",
  "userId": "firebaseUid",
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "numberPlate": "ABC-1234",
  "photoURL": "https://...",
  "status": "AVAILABLE|IN_SERVICE|MAINTENANCE",
  "createdAt": "2025-11-06T00:00:00",
  "updatedAt": "2025-11-06T00:00:00"
}
```

### REST Endpoints
- GET `/api/vehicles/user/{userId}` → 200 [Vehicle[]]
- GET `/api/vehicles/{vehicleId}` → 200 [Vehicle] | 404
- POST `/api/vehicles` (headers: `X-User-ID`) → 201 [Vehicle]
- PUT `/api/vehicles/{vehicleId}` → 200 [Vehicle]
- DELETE `/api/vehicles/{vehicleId}` → 204
- PATCH `/api/vehicles/{vehicleId}/status?status=IN_SERVICE` → 200 [Vehicle]

### Events
- `vehicle.created`
```json
{
  "eventId": "uuid",
  "vehicleId": "uuid",
  "userId": "uid",
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "numberPlate": "ABC-1234",
  "photoURL": "https://...",
  "timestamp": "2025-11-06T00:00:00"
}
```
- `vehicle.updated` (same shape, fewer fields optional)
- `vehicle.status.changed`
```json
{
  "eventId": "uuid",
  "vehicleId": "uuid",
  "userId": "uid",
  "oldStatus": "AVAILABLE",
  "newStatus": "IN_SERVICE",
  "timestamp": "2025-11-06T00:00:00"
}
```

---

## Customer Service Contracts

### Entity JSON
```json
{
  "firebaseUid": "uid",
  "email": "user@example.com",
  "displayName": "User",
  "phone": "+1 555-1234",
  "photoURL": "https://...",
  "idNumber": "NIC123",
  "address": "Street, City",
  "birthday": "YYYY-MM-DD",
  "kycStatus": "NOT_STARTED|PENDING|VERIFIED|REJECTED",
  "createdAt": "2025-11-06T00:00:00",
  "updatedAt": "2025-11-06T00:00:00"
}
```

### REST Endpoints
- GET `/api/customers/{firebaseUid}` → 200 [Customer] | 404
- POST `/api/customers` → 201 [Customer]
- PUT `/api/customers/{firebaseUid}` → 200 [Customer]
- PATCH `/api/customers/{firebaseUid}/kyc?status=VERIFIED` → 200 [Customer]

### Events
- `customer.registered`
```json
{
  "eventId": "uuid",
  "customerId": "uid",
  "email": "user@example.com",
  "displayName": "User",
  "timestamp": "2025-11-06T00:00:00"
}
```
- `customer.updated` (adds phone/photoURL)
- `customer.kyc.changed` (oldStatus/newStatus)

---

## RabbitMQ Config (shared patterns)

Topic exchange & queues:
```java
@Bean
public TopicExchange vehicleExchange() { return new TopicExchange("vehicle.exchange"); }
@Bean
public Queue vehicleQueue() { return new Queue("vehicle.queue", true); }
@Bean
public Binding vehicleBinding() {
  return BindingBuilder.bind(vehicleQueue()).to(vehicleExchange()).with("vehicle.*");
}
```

Notification service should bind to the same exchange (routing keys `vehicle.*`, `customer.*`) to fan-out events to notifications.

---

## Health, Resilience & Observability

- Actuator health endpoints on each service (`/actuator/health`).
- Feign clients should have circuit breakers if you add sync cross-calls later.
- Retry for transient RabbitMQ publish errors if needed.
- Add request/trace IDs in logs.

---

## Testing Recipes

- After starting infra + services + gateway:

```bash
# Create customer
curl -X POST http://localhost:8080/api/customers \
  -H 'Content-Type: application/json' \
  -d '{
    "firebaseUid": "uid123",
    "email": "user@example.com",
    "displayName": "User"
  }'

# Create vehicle (pass X-User-ID forwarded by Gateway in real usage)
curl -X POST http://localhost:8080/api/vehicles \
  -H 'Content-Type: application/json' \
  -H 'X-User-ID: uid123' \
  -d '{
    "make": "Toyota",
    "model": "Prius",
    "year": 2020,
    "numberPlate": "ABC-1234",
    "photoURL": "http://localhost:3000/local_uploads/users/uid123/vehicles/example.jpg"
  }'

# List vehicles by user
curl http://localhost:8080/api/vehicles/user/uid123 | jq

# Update status
curl -X PATCH "http://localhost:8080/api/vehicles/{vehicleId}/status?status=IN_SERVICE"
```

---

## Implementation Tips

- Use Lombok + MapStruct to keep DTOs clean.
- Use Flyway for migrations (`resources/db/migration/V1__init.sql`).
- Enforce unique `number_plate` to avoid duplicates.
- Gateway should validate Firebase ID token and inject `X-User-ID`. Microservices trust Gateway.
- Return consistent error JSON:
```json
{ "timestamp": "...", "status": 400, "error": "Bad Request", "message": "...", "path": "/api/..." }
```

---
 
## Migration plan (Frontend → Backend)

1) Phase 1 – Bridge only (no UI changes):
  - Keep Firestore as-is for the customer UI.
  - Deploy Vehicle & Customer services; configure RabbitMQ exchanges.
  - Add a small bridge (Cloud Function / worker) to publish RabbitMQ events when Firestore docs change (vehicles & users).

2) Phase 2 – Dual-write from backend:
  - Switch frontend write paths to call your services.
  - Services persist to PostgreSQL and write-through to Firestore until frontend reads are updated.

3) Phase 3 – Full migration:
  - Update frontend reads to call the API Gateway for vehicles/customers.
  - Remove Firestore reads for those resources; keep for appointments/modifications until they migrate.

4) Phase 4 – Migrate appointments and modifications:
  - Stand up appointments-service and modifications-service.
  - Mirror the exact status strings used by the frontend.
  - Expose endpoints and publish events; then switch the frontend.

Success criteria:

- After Phase 1: Admin analytics possible without any UI changes.
- After Phase 3: Frontend no longer depends on Firestore for vehicles/customers.
- After Phase 4: All user data comes via services; Firestore optional or removed.

## Deliverables Checklist

- [ ] vehicle-service Spring Boot app with routes above
- [ ] customer-service Spring Boot app with routes above
- [ ] Flyway migrations applied successfully
- [ ] Rabbcan u refer updateb-customer-services.md and study what i did in backend as you requested in backenddev-customer-advice.md ?itMQ exchange/queues/bindings created by config
- [ ] Eureka client enabled; services show on Eureka dashboard
- [ ] Gateway routes working at http://localhost:8080
- [ ] Firebase auth filter at Gateway injects `X-User-ID`
- [ ] End-to-end curl tests pass

---

This file is self-contained so another AI agent can pick it up and scaffold both services quickly. If you want, I can also produce skeleton projects (pom.xml + main classes + basic controllers) in a separate repo to accelerate bootstrapping.