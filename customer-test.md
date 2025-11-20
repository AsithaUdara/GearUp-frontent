# Customer Features - Test Cases

## Test Case Summary Table

| Test ID | Feature | Type | Test Case Description | Expected Result | Status |
|---------|---------|------|----------------------|-----------------|--------|
| TC01 | Customer Dashboard | Integration | View dashboard overview with vehicles, appointments, and modification status displayed correctly with real-time updates | Dashboard loads successfully, all sections display correct data from backend/Firestore, hero banner renders without borders, real-time updates work | Pass |
| TC02 | My Vehicles Management | Integration | Perform CRUD operations (Create, Read, Update, Delete) on vehicles through backend service | All vehicle operations succeed with 200 status, data persists in PostgreSQL, UI updates reflect backend state, images load correctly | Pass |
| TC03 | Settings/Profile | Integration | Update user profile with tri-layer sync (Backend + Firebase Auth + Firestore) and verify real-time prefill | Profile updates sync across all three layers, form prefills instantly from Firestore, changes persist after reload, real-time updates work | Pass |
| TC04 | Request Modification | Integration | Submit modification request, admin reviews/approves/rejects, customer sees live status updates on dashboard | Request submits to Firestore successfully, admin can manage status, customer dashboard shows real-time status changes, history displays all requests | Pass |
| TC05 | Backend Integration | System | Verify API Gateway routing with automatic fallback to direct services when gateway unavailable | Proxy routes to gateway (9090) first, falls back to direct services (8088/8090) on failure, headers forwarded correctly, graceful error handling | Pass |

---

## Detailed Test Cases

---

## Test Case 1: Customer Dashboard - View Overview

### Test ID
TC01

### Feature
Customer Dashboard

### Type
Integration

### Objective
Verify that the Customer Dashboard correctly displays user vehicles, upcoming appointments, and modification request status.

### Preconditions
- User is logged in with Firebase Authentication
- User has at least one vehicle registered
- User has at least one upcoming appointment
- Backend services (Vehicle Service, Customer Service, Gateway) are running
- `.env.local` configured with `NEXT_PUBLIC_GATEWAY_BASE=http://localhost:9090`

### Test Steps
1. Navigate to `http://localhost:3000` and log in with valid credentials
2. Upon successful login, verify redirect to `/customer/dashboard`
3. Observe the hero banner section (should display full-bleed image with gradient overlay)
4. Check "My Vehicles" section displays vehicles grid with correct data:
   - Vehicle make, model, year
   - Number plate
   - Vehicle photo (if uploaded)
   - "View All" link to `/customer/vehicles`
5. Verify "Upcoming Appointments" section shows:
   - Service type, date, time
   - Status badge (Pending/Confirmed/Completed)
   - Real-time updates from Firestore
6. Check "Modification Requests" section displays:
   - Current modification status (if any exists)
   - Two distinct status paths:
     - **Approval path**: Pending → Under Review → Approved → In Progress → Completed
     - **Rejection path**: Pending → Under Review → Rejected
   - Status badges with appropriate colors

### Expected Results
- ✅ Dashboard loads without errors
- ✅ Hero banner displays with object-cover (no black borders)
- ✅ Vehicles data fetched from backend via `/api/proxy/vehicles/user/{uid}`
- ✅ Appointments display in real-time from Firestore `appointments` collection
- ✅ Modification status shows correct state and updates live
- ✅ All sections responsive and styled consistently

### Test Data
```javascript
// Sample Firebase user
uid: "testUser123"
email: "test@gearup.com"

// Expected API calls (check browser DevTools Network tab)
GET /api/proxy/vehicles/user/testUser123
GET /api/proxy/customers/testUser123

// Firestore queries (check console logs)
collection: "appointments" where userId == "testUser123"
collection: "modifications" where userId == "testUser123"
```

### Pass/Fail Criteria
- **Pass**: All data displays correctly, no console errors, real-time updates work
- **Fail**: Missing data, 500 errors, stale data, layout issues

---

## Test Case 2: My Vehicles - CRUD Operations

### Test ID
TC02

### Feature
My Vehicles Management

### Type
Integration

### Objective
Verify complete vehicle management: list, add, edit, and delete vehicles through the backend service.

### Preconditions
- User logged in
- Backend Vehicle Service running on port 8090 (or via Gateway 9090)
- `NEXT_PUBLIC_USE_DEV_PROXY=1` enabled in `.env.local`

### Test Steps

#### 2.1 List Vehicles
1. Navigate to `/customer/vehicles`
2. Verify hero banner displays correctly
3. Confirm vehicle cards show:
   - Make, model, year, number plate
   - Vehicle photo (Cloudinary or local upload)
   - "Edit" and "Delete" buttons

#### 2.2 Add New Vehicle
1. Click "Add Vehicle" button
2. Fill in form:
   - Make: "Toyota"
   - Model: "Camry"
   - Year: "2023"
   - Number Plate: "ABC-1234"
   - Photo: Upload or provide URL
3. Submit form
4. Verify success message appears
5. Check new vehicle appears in list
6. Confirm backend call: `POST /api/proxy/vehicles` with payload

#### 2.3 Edit Vehicle
1. Click "Edit" on an existing vehicle
2. Modify fields (e.g., change year to "2024")
3. Submit changes
4. Verify updated data displays immediately
5. Confirm backend call: `PUT /api/proxy/vehicles/{vehicleId}`

#### 2.4 Delete Vehicle
1. Click "Delete" on a vehicle
2. Confirm deletion in modal
3. Verify vehicle removed from list
4. Confirm backend call: `DELETE /api/proxy/vehicles/{vehicleId}`

### Expected Results
- ✅ All CRUD operations succeed with 200 status codes
- ✅ Data persists in PostgreSQL via Vehicle Service
- ✅ Local cache prefills for fast perceived performance
- ✅ Backend refresh ensures data consistency
- ✅ Image URLs handled correctly (Cloudinary or local paths)
- ✅ No orphaned data after delete

### Test Data
```javascript
// Add vehicle payload
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "numberPlate": "ABC-1234",
  "photoURL": "https://res.cloudinary.com/..."
}

// Expected response
{
  "id": "vehicle-uuid-123",
  "userId": "testUser123",
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "numberPlate": "ABC-1234",
  "photoURL": "https://res.cloudinary.com/...",
  "status": "ACTIVE",
  "createdAt": "2025-11-07T10:00:00Z",
  "updatedAt": "2025-11-07T10:00:00Z"
}
```

### Pass/Fail Criteria
- **Pass**: All operations complete successfully, data persists, UI updates reflect backend state
- **Fail**: 500 errors, data loss, stale cache, failed deletions

---

## Test Case 3: Settings - Profile Management with Tri-Layer Sync

### Test ID
TC03

### Feature
Settings/Profile Management

### Type
Integration

### Objective
Verify that profile updates sync across Backend (Customer Service), Firebase Auth, and Firestore mirror with real-time prefill.

### Preconditions
- User logged in
- Customer Service running on port 8088
- Firebase Authentication configured
- Firestore `users/{uid}` collection exists

### Test Steps

#### 3.1 Profile Load (Real-time Prefill)
1. Navigate to `/customer/settings`
2. Verify form fields prefilled instantly from Firestore mirror:
   - Display Name
   - Phone
   - Address
   - Birthday
   - ID Number
3. Confirm no loading spinner delay (data from `onSnapshot`)

#### 3.2 Update Profile
1. Modify fields:
   - Display Name: "John Doe Updated"
   - Phone: "+1234567890"
   - Address: "123 Main St"
2. Click "Save Changes"
3. Observe tri-layer sync sequence:
   - **Layer 1**: Update backend via `PUT /api/proxy/customers/{uid}`
   - **Layer 2**: Sync Firebase Auth `updateProfile` (displayName, photoURL)
   - **Layer 3**: Mirror to Firestore `users/{uid}` collection
4. Verify success banner appears
5. Reload page and confirm changes persisted

#### 3.3 Real-time Updates (Test Concurrency)
1. Open Settings in two browser tabs with same user
2. Update profile in Tab 1
3. Verify Tab 2 reflects changes immediately (via Firestore `onSnapshot`)

### Expected Results
- ✅ Form prefills instantly from Firestore mirror (no backend delay)
- ✅ Updates propagate to all three layers successfully
- ✅ Firebase Auth displayName syncs (visible in header/dashboard)
- ✅ Firestore mirror updates trigger real-time UI refresh
- ✅ Backend (PostgreSQL) is the ultimate source of truth
- ✅ Hero banner displays without black borders

### Test Data
```javascript
// Update payload
{
  "displayName": "John Doe Updated",
  "phone": "+1234567890",
  "address": "123 Main St",
  "birthday": "1990-01-15",
  "idNumber": "ID123456"
}

// Backend response
{
  "firebaseUid": "testUser123",
  "email": "test@gearup.com",
  "displayName": "John Doe Updated",
  "phone": "+1234567890",
  "address": "123 Main St",
  "birthday": "1990-01-15",
  "idNumber": "ID123456",
  "kycStatus": "VERIFIED",
  "updatedAt": "2025-11-07T10:05:00Z"
}

// Firestore mirror path
users/testUser123 → { displayName, phone, address, ... }

// Firebase Auth
currentUser.displayName === "John Doe Updated"
```

### Pass/Fail Criteria
- **Pass**: All three layers sync, real-time updates work, no data loss
- **Fail**: Sync fails on any layer, stale data in Firestore, Auth name not updated

---

## Test Case 4: Request Modification - End-to-End Workflow

### Test ID
TC04

### Feature
Request Modification Workflow

### Type
Integration

### Objective
Verify the complete modification request lifecycle from customer submission to admin approval/rejection with real-time status tracking.

### Preconditions
- User logged in
- Firestore `modifications` collection accessible
- Admin user has access to `/admin/modifications`
- Real-time listeners configured (`onSnapshot`)

### Test Steps

#### 4.1 Customer Submits Modification Request
1. Navigate to `/customer/modification`
2. Verify hero banner displays correctly
3. Fill modification request form:
   - Vehicle: Select from dropdown (fetches user's vehicles)
   - Service Type: "Engine Upgrade"
   - Description: "Turbo kit installation"
   - Preferred Date: Select future date
4. Click "Submit Request"
5. Verify:
   - Success banner appears
   - Request ID generated
   - Status shows "Pending"
6. Check "My Modification History" section displays new request

#### 4.2 Admin Reviews Request
1. Admin logs in and navigates to `/admin/modifications`
2. Verify new request appears in admin list
3. Admin filters by "Pending" status
4. Admin opens request details modal
5. Admin actions:
   - **Scenario A - Approve**: Click "Approve" → Status: "Under Review" → "Approved"
   - **Scenario B - Reject**: Click "Reject" → Enter reason → Status: "Rejected"
   - **Scenario C - Progress**: After approval, mark "In Progress" → "Completed"

#### 4.3 Real-time Status Updates (Customer Dashboard)
1. Keep customer dashboard open in separate tab
2. Admin performs actions from 4.2
3. Verify customer dashboard "Modification Requests" section updates **in real-time** without refresh:
   - Status badge changes color
   - Status text updates
   - Rejection reason appears (if rejected)

#### 4.4 View Modification History
1. Customer navigates to `/customer/modification`
2. Scroll to "My Modification History"
3. Verify all past requests display with:
   - Vehicle details
   - Service type, description
   - Submitted date
   - Current status (color-coded badge)
   - Rejection reason (if applicable)

### Expected Results
- ✅ Modification request writes to Firestore `modifications/{requestId}`
- ✅ Admin can view and update status from admin panel
- ✅ Status updates propagate to customer dashboard in real-time
- ✅ Two distinct status paths work correctly:
  - **Approval path**: Pending → Under Review → Approved → In Progress → Completed
  - **Rejection path**: Pending → Under Review → Rejected (terminal state)
- ✅ History displays all requests chronologically
- ✅ Hero banners use object-cover on modification page

### Test Data
```javascript
// Firestore document: modifications/{requestId}
{
  "id": "mod-123",
  "userId": "testUser123",
  "vehicleId": "vehicle-uuid-123",
  "serviceType": "Engine Upgrade",
  "description": "Turbo kit installation",
  "preferredDate": "2025-11-15",
  "status": "Pending",
  "submittedAt": "2025-11-07T10:10:00Z",
  "updatedAt": "2025-11-07T10:10:00Z",
  "rejectionReason": null
}

// After admin approval
{
  ...
  "status": "Approved",
  "approvedBy": "admin@gearup.com",
  "approvedAt": "2025-11-07T10:15:00Z"
}

// After admin rejection
{
  ...
  "status": "Rejected",
  "rejectedBy": "admin@gearup.com",
  "rejectionReason": "Vehicle not eligible for this modification",
  "rejectedAt": "2025-11-07T10:15:00Z"
}
```

### Pass/Fail Criteria
- **Pass**: Full workflow completes, real-time updates work, status paths correct, history accurate
- **Fail**: Status stuck, no real-time updates, missing rejection reason, data inconsistency

---

## Test Case 5: Backend Integration - Gateway & Fallback Mechanism

### Test ID
TC05

### Feature
Backend Integration (API Gateway & Services)

### Type
System Integration

### Objective
Verify that the frontend correctly routes API calls through the Gateway (port 9090) and automatically falls back to direct services (8088/8090) when gateway routes are unavailable.

### Preconditions
- Gateway running on port 9090
- Vehicle Service on port 8090
- Customer Service on port 8088
- `.env.local` configured:
  ```
  NEXT_PUBLIC_GATEWAY_BASE=http://localhost:9090
  NEXT_PUBLIC_API_BASE_VEHICLE=http://localhost:8090
  NEXT_PUBLIC_API_BASE_CUSTOMER=http://localhost:8088
  NEXT_PUBLIC_USE_DEV_PROXY=1
  NEXT_PUBLIC_USE_GATEWAY=1
  ```

### Test Steps

#### 5.1 Gateway Primary Path (When Routes Configured)
1. Start all services (Gateway + Vehicle + Customer)
2. Configure gateway routes in backend (if not done):
   ```yaml
   spring.cloud.gateway.routes:
     - id: vehicle-service
       uri: lb://VEHICLE-SERVICE
       predicates:
         - Path=/api/vehicles/**
     - id: customer-service
       uri: lb://CUSTOMER-SERVICE
       predicates:
         - Path=/api/customers/**
   ```
3. Open browser DevTools → Network tab
4. Navigate to `/customer/vehicles`
5. Verify API call logs:
   ```
   [vehicles-proxy] GET http://localhost:9090/api/vehicles/user/testUser123
   [vehicles-proxy] response status: 200
   ```
6. Confirm vehicles display correctly

#### 5.2 Automatic Fallback (When Gateway Routes Missing)
1. Stop gateway or ensure routes return 404:
   ```bash
   docker stop gearup-api-gateway
   ```
2. Reload `/customer/vehicles`
3. Verify fallback in Next.js server console:
   ```
   [vehicles-proxy] GET http://localhost:9090/api/vehicles/user/testUser123
   [vehicles-proxy] primary failed, retrying direct service: http://localhost:8090/api/vehicles/user/testUser123
   [vehicles-proxy] response status: 200
   ```
4. Confirm vehicles still display (fetched from direct service)

#### 5.3 Proxy Header Forwarding
1. Gateway running with routes configured
2. Login as user with Firebase token
3. Navigate to `/customer/settings`
4. Open browser DevTools → Network → Select proxy request → Headers tab
5. Verify headers forwarded:
   - `Authorization: Bearer <Firebase-ID-Token>`
   - `X-User-ID: testUser123` (if direct mode)
   - `Content-Type: application/json`
   - `Accept: application/json`

#### 5.4 Query String Preservation
1. Construct URL with query params:
   ```
   /customer/vehicles?filter=active&sort=year
   ```
2. Check proxy forwards query string intact:
   ```
   [vehicles-proxy] GET http://localhost:9090/api/vehicles/user/testUser123?filter=active&sort=year
   ```

#### 5.5 Error Handling (Both Gateway + Service Down)
1. Stop both gateway and vehicle service:
   ```bash
   docker stop gearup-api-gateway gearup-vehicle-service
   ```
2. Navigate to `/customer/vehicles`
3. Verify error response:
   ```json
   {
     "error": "Backend service unavailable",
     "details": "fetch failed"
   }
   ```
4. Confirm graceful error message displays in UI (not crash)

### Expected Results
- ✅ Proxy routes to gateway (9090) by default when `NEXT_PUBLIC_USE_GATEWAY=1`
- ✅ Automatic fallback to direct service (8090/8088) on network error
- ✅ Headers (Authorization, X-User-ID, Content-Type) forwarded correctly
- ✅ Query strings preserved in proxied requests
- ✅ Response bodies (JSON/binary) passed through without corruption
- ✅ Graceful error handling when all backends down
- ✅ Console logs show clear proxy attempt → fallback → success/failure sequence

### Test Data
```javascript
// Environment variables
NEXT_PUBLIC_GATEWAY_BASE=http://localhost:9090
NEXT_PUBLIC_API_BASE_VEHICLE=http://localhost:8090
NEXT_PUBLIC_API_BASE_CUSTOMER=http://localhost:8088
NEXT_PUBLIC_USE_DEV_PROXY=1  // Use Next.js proxy (default)
NEXT_PUBLIC_USE_GATEWAY=1    // Try gateway first (default)

// Proxy route files
src/app/api/proxy/vehicles/[[...path]]/route.ts
src/app/api/proxy/customers/[[...path]]/route.ts

// Expected console logs (successful gateway path)
[vehicles-proxy] GET http://localhost:9090/api/vehicles/user/testUser123
[vehicles-proxy] response status: 200

// Expected console logs (fallback path)
[vehicles-proxy] GET http://localhost:9090/api/vehicles/user/testUser123
[vehicles-proxy] primary failed, retrying direct service: http://localhost:8090/api/vehicles/user/testUser123
[vehicles-proxy] response status: 200

// Error scenario (all down)
[vehicles-proxy] fetch error for http://localhost:9090/api/vehicles/user/testUser123: TypeError: fetch failed
[vehicles-proxy] fallback fetch error for http://localhost:8090/api/vehicles/user/testUser123: TypeError: fetch failed
Response: 500 {"error":"Backend service unavailable","details":"TypeError: fetch failed"}
```

### Pass/Fail Criteria
- **Pass**: Gateway primary path works, fallback activates on failure, headers/query preserved, graceful errors
- **Fail**: No fallback attempt, missing headers, query params dropped, hard crash on error

---

## Summary of Implementation

### Features Delivered
1. **Customer Dashboard**: Vehicles overview, appointments, modification status with real-time updates
2. **My Vehicles**: Full CRUD via backend (PostgreSQL), local cache + refresh, image handling
3. **Settings**: Tri-layer sync (Backend + Firebase Auth + Firestore), real-time prefill
4. **Request Modification**: Customer submission, admin review workflow, live status tracking, history view
5. **Backend Integration**: Gateway routing with automatic fallback, header forwarding, query preservation

### Technical Highlights
- Next.js 15 App Router with React 19
- Firebase Authentication + Firestore real-time listeners
- Smart proxy layer (`/api/proxy/*`) with fallback logic
- Cloudinary image integration
- Tailwind CSS 4 for consistent, responsive UI
- Object-cover hero banners (no black borders)
- Environment-driven configuration for gateway/services

### Test Execution Notes
- Run all tests with backend services healthy
- Check browser DevTools Network tab for API calls
- Monitor Next.js server console for proxy logs
- Verify Firestore real-time updates in Firebase Console
- Test both gateway and fallback paths by toggling services

---

## Test Environment Setup

### Required Services
```bash
# Start backend via Docker Compose
docker compose up -d

# Verify services
docker ps | grep -E 'gateway|vehicle|customer'

# Expected output
gearup-api-gateway       Up (healthy)  0.0.0.0:9090->8080/tcp
gearup-vehicle-service   Up (healthy)  (internal 8090)
gearup-customer-service  Up (healthy)  (internal 8088)
```

### Frontend Setup
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Access app
http://localhost:3000
```

### Environment Variables (.env.local)
```env
NEXT_PUBLIC_GATEWAY_BASE=http://localhost:9090
NEXT_PUBLIC_API_BASE_VEHICLE=http://localhost:8090
NEXT_PUBLIC_API_BASE_CUSTOMER=http://localhost:8088
NEXT_PUBLIC_USE_DEV_PROXY=1
NEXT_PUBLIC_USE_GATEWAY=1
NEXT_PUBLIC_FIREBASE_API_KEY=<your-key>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project>
# ... other Firebase vars
```

---

## Appendix: Known Issues & Limitations

### Current State
- ✅ Gateway configured (port 9090) but routes may return 404 if not configured in backend
- ✅ Fallback mechanism handles missing gateway routes transparently
- ✅ Services on internal ports (8088, 8090) accessible via Docker network

### Future Enhancements
- Add stricter Firestore rules (admin-only modification status updates via custom claims)
- Implement service history timeline on dashboard (wire to backend data)
- Add push notifications for modification status changes
- Optimize image uploads (direct Cloudinary widget integration)

---

**Document Version**: 1.0  
**Last Updated**: November 7, 2025  
**Author**: Customer Features Development Team
