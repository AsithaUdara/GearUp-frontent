# Frontend Integration – Customer & Vehicle Services

This note tells the frontend exactly how to call the new backend services locally and in a gateway setup, what headers to send, payload shapes, and quick tests. Paste this into your frontend docs as needed.

---

## TL;DR

- Two services are available now:
  - Vehicle Service (port 8083)
  - Customer Service (port 8084)
- Prefer calling them via the API Gateway when it’s enabled (port 8080). The Gateway validates the Firebase ID token and injects `X-User-ID` for downstream services.
- During local dev without the Gateway you can call services directly on 8083/8084; pass `X-User-ID` yourself for vehicle creation.

---

## Base URLs

- Direct to services (local dev without gateway):
  - Vehicle: `http://localhost:8083`
  - Customer: `http://localhost:8084`
- Via API Gateway (recommended when running gateway):
  - Gateway: `http://localhost:8080`

Configure the frontend with one of:

- `NEXT_PUBLIC_API_BASE=http://localhost:8080` (through gateway), or
- `NEXT_PUBLIC_API_BASE_VEHICLE=http://localhost:8083` and `NEXT_PUBLIC_API_BASE_CUSTOMER=http://localhost:8084` (direct to services)

CORS is already set to allow `http://localhost:3000` at the Gateway level.

---

## Authentication

- Frontend gets a Firebase ID token: `const idToken = await user.getIdToken()`.
- When calling through the Gateway:
  - Send `Authorization: Bearer <idToken>`.
  - The Gateway verifies the token and forwards `X-User-ID: <firebaseUid>` to services automatically.
- When calling services directly (no Gateway), auth is not enforced by services, but for Vehicle creates you should pass `X-User-ID` yourself as a header (fallback logic is implemented but header is preferred).

---

## Customer Service (8084)

Base URL:
- Direct: `http://localhost:8084/api/customers`
- Gateway: `http://localhost:8080/api/customers`

Endpoints:
- GET `/{firebaseUid}` → 200 [Customer] | 404
- POST `/` (register) → 201 [Customer]
- PUT `/{firebaseUid}` → 200 [Customer]
- PATCH `/{firebaseUid}/kyc?status=NOT_STARTED|PENDING|VERIFIED|REJECTED` → 200 [Customer]

Customer JSON shape:
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
  "createdAt": "2025-11-06T00:00:00Z",
  "updatedAt": "2025-11-06T00:00:00Z"
}
```

Quick tests:
```bash
# Create customer (Gateway)
curl -X POST http://localhost:8080/api/customers \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ID_TOKEN" \
  -d '{
    "firebaseUid": "uid123",
    "email": "user@example.com",
    "displayName": "User"
  }'

# Get customer (Direct)
curl http://localhost:8084/api/customers/uid123

# Update KYC (Gateway)
curl -X PATCH "http://localhost:8080/api/customers/uid123/kyc?status=VERIFIED" \
  -H "Authorization: Bearer $ID_TOKEN"
```

---

## Vehicle Service (8083)

Base URL:
- Direct: `http://localhost:8083/api/vehicles`
- Gateway: `http://localhost:8080/api/vehicles`

Endpoints:
- GET `/user/{userId}` → 200 [Vehicle[]]
- GET `/{vehicleId}` → 200 [Vehicle] | 404
- POST `/` (create) → 201 [Vehicle]
- PUT `/{vehicleId}` → 200 [Vehicle]
- DELETE `/{vehicleId}` → 204
- PATCH `/{vehicleId}/status?status=AVAILABLE|IN_SERVICE|MAINTENANCE` → 200 [Vehicle]

Vehicle JSON shape:
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
  "createdAt": "2025-11-06T00:00:00Z",
  "updatedAt": "2025-11-06T00:00:00Z"
}
```

Create vehicle (two ways):
```bash
# Through Gateway (recommended) – X-User-ID is injected automatically
curl -X POST http://localhost:8080/api/vehicles \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ID_TOKEN" \
  -d '{
    "make": "Toyota",
    "model": "Prius",
    "year": 2020,
    "numberPlate": "ABC-1234",
    "photoURL": "http://localhost:3000/local_uploads/users/uid123/vehicles/example.jpg"
  }'

# Direct to service (without gateway) – pass X-User-ID manually
curl -X POST http://localhost:8083/api/vehicles \
  -H 'Content-Type: application/json' \
  -H 'X-User-ID: uid123' \
  -d '{
    "make": "Toyota",
    "model": "Prius",
    "year": 2020,
    "numberPlate": "ABC-1234",
    "photoURL": "http://localhost:3000/local_uploads/users/uid123/vehicles/example.jpg"
  }'
```

Notes:
- `year` accepts string or number; backend normalizes to integer.
- `numberPlate` is unique per DB constraint.
- `photoURL` is treated as an opaque URL (with `NEXT_PUBLIC_LOCAL_UPLOAD=1`, frontend can serve from `public/local_uploads/...`).

---

## Error Responses

Services return standard Spring error JSON like:
```json
{ "timestamp": "...", "status": 400, "error": "Bad Request", "message": "...", "path": "/api/..." }
```

Common cases:
- 400: validation / bad input (missing fields, invalid status)
- 401: invalid Firebase token (Gateway)
- 404: resource not found

---

## Events (FYI)

- Vehicle: publishes `vehicle.created`, `vehicle.updated`, `vehicle.status.changed` to `vehicle.exchange`.
- Customer: publishes `customer.registered`, `customer.updated`, `customer.kyc.changed` to `customer.exchange`.

Frontend doesn’t need to subscribe directly; the Notification service can listen and push notifications.

---

## How the Frontend Connects to the Backend

- **Via API Gateway (recommended):**
  - Frontend sends `Authorization: Bearer <Firebase ID token>`.
  - Gateway validates token and injects `X-User-ID` into requests for downstream services.
  - Routes:
    - `/api/customers/**` → Customer Service
    - `/api/vehicles/**` → Vehicle Service
  - Benefit: central auth, CORS, rate limiters, and a single base URL.

- **Direct to Services (local dev fallback):**
  - Call `http://localhost:8083` (vehicles) and `http://localhost:8084` (customers).
  - No token verification by services; pass `X-User-ID` manually for vehicle creation.
  - Useful if Gateway/Eureka aren’t running.

---

## Local Dev Checklist

1) Start infra + services (from backend repo):
   - Docker Compose brings up Postgres, RabbitMQ, and both services.
2) Option A – run Gateway too (preferred):
   - Base URL: `http://localhost:8080`
   - Frontend sends `Authorization: Bearer <idToken>`
3) Option B – call services directly:
   - Vehicle: `http://localhost:8083`
   - Customer: `http://localhost:8084`
   - Send `X-User-ID` for vehicle POST when not using Gateway.
4) Frontend env:
   - `NEXT_PUBLIC_API_BASE=http://localhost:8080` (if using Gateway) OR per-service bases if calling directly.

---

## Field Mapping vs Frontend (Firestore)

- Customer mirrors: `displayName, phone, photoURL, idNumber, address, birthday` + `email` and `kycStatus`.
- Vehicle mirrors: `make, model, year, numberPlate, photoURL, userId`.
- Migration can be incremental: keep Firestore for reads initially; write through services and/or write-through to Firestore if needed.

---

## Health

- Vehicle health: `http://localhost:8083/actuator/health` → `{ "status": "UP" }`
- Customer health: `http://localhost:8084/actuator/health` → `{ "status": "UP" }`

