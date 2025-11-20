# API Gateway Migration Complete ✅

## Summary
All frontend API endpoints have been successfully migrated to use the API Gateway on **port 9090** with the **/api/v1/** prefix.

---

## Admin Credentials

### Admin User Details
- **Email**: `admin@gearup.com`
- **Password**: `StrOng!Admin123`
- **Firebase UID**: `u2sgkfVpdTd9hkrUp5sb3ttiHOt2`
- **Role**: `ADMIN`

### How to Login as Admin
1. Navigate to `http://localhost:3000/admin`
2. Enter the credentials above
3. You should now have access to:
   - Admin Dashboard
   - Appointment Management
   - Analytics (KPI Cards, Top Services)
   - User Management
   - Payment Requests
   - Reviews Management

---

## Changes Made

### 1. API Gateway Configuration (`src/lib/api/config.ts`)
**Before:**
```typescript
const USE_API_GATEWAY = false;
const API_GATEWAY_URL = 'http://localhost:9090';
const DIRECT_SERVICE_URLS = {
  payment: 'http://localhost:8083',
  auth: 'http://localhost:8082',
  ...
};
```

**After:**
```typescript
const USE_API_GATEWAY = true;  // ✅ Enabled
const API_GATEWAY_URL = 'http://localhost:9090';
const DIRECT_SERVICE_URLS = {
  payment: 'http://localhost:9090/api/v1',    // ✅ Updated
  auth: 'http://localhost:9090/api/v1',       // ✅ Updated
  automobile: 'http://localhost:9090/api/v1', // ✅ Updated
  notification: 'http://localhost:9090/api/v1', // ✅ Updated
};
```

### 2. Appointment Service (`src/app/services/appointmentService.ts` & `src/services/appointmentService.ts`)
**Before:**
```typescript
const API_BASE_URL = 'http://localhost:8084/api';
```

**After:**
```typescript
const API_BASE_URL = 'http://localhost:9090/api/v1';
```

**Endpoints Updated:**
- ✅ `/timeslots` → `http://localhost:9090/api/v1/timeslots`
- ✅ `/bookings` → `http://localhost:9090/api/v1/bookings`
- ✅ `/services` → `http://localhost:9090/api/v1/services`
- ✅ `/employees` → `http://localhost:9090/api/v1/employees`

### 3. Analytics Components
**KpiCards.tsx:**
```typescript
// Before: 'http://localhost:8087/api/analytics/metrics'
// After:
fetch('http://localhost:9090/api/v1/analytics/metrics')
```

**TopServices.tsx:**
```typescript
// Before: 'http://localhost:8087/api/analytics/services/top?limit=5'
// After:
fetch('http://localhost:9090/api/v1/analytics/services/top?limit=5')
```

### 4. Modification Service (`src/services/modificationService.ts`)
**Before:**
```typescript
const API_BASE_URL = 'http://localhost:8089';
```

**After:**
```typescript
const API_BASE_URL = 'http://localhost:9090/api/v1';
```

### 5. Payment Service (`src/lib/api/paymentService.ts`)
All paths updated from `/api/payments/*` to `/payments/*` (since `/api/v1` is in base URL):
- ✅ `/payments/admin/requests`
- ✅ `/payments/admin/requests/{id}`
- ✅ `/payments/admin/requests/{id}/approve`
- ✅ `/payments/admin/requests/{id}/reject`
- ✅ `/payments/admin/stats`

### 6. Bill Service (`src/lib/api/billService.ts`)
All paths updated from `/api/payments/customer/*` to `/payments/customer/*`:
- ✅ `/payments/customer/bills`
- ✅ `/payments/customer/bills/{id}`
- ✅ `/payments/customer/bills/{id}/mark-paid`

### 7. Review Service (`src/lib/api/reviewService.ts`)
All paths updated from `/api/reviews/*` to `/reviews/*`:
- ✅ `/reviews/customer`
- ✅ `/reviews/admin`
- ✅ `/reviews/admin/{id}/publish`
- ✅ `/reviews/admin/{id}/unpublish`
- ✅ `/reviews/admin/stats`
- ✅ `/reviews/public`

---

## API Endpoint Format

### New Standard Format
```
http://localhost:9090/api/v1/{service-path}
```

### Examples
- **Bookings**: `http://localhost:9090/api/v1/bookings`
- **Time Slots**: `http://localhost:9090/api/v1/timeslots?date=2025-11-20`
- **Services**: `http://localhost:9090/api/v1/services`
- **Payments**: `http://localhost:9090/api/v1/payments/admin/requests`
- **Reviews**: `http://localhost:9090/api/v1/reviews/customer`
- **Analytics**: `http://localhost:9090/api/v1/analytics/metrics`

---

## Testing Checklist

### 1. Admin Login
- [ ] Navigate to `http://localhost:3000/admin`
- [ ] Login with `admin@gearup.com` / `StrOng!Admin123`
- [ ] Verify successful authentication
- [ ] Check admin role permissions

### 2. Admin Dashboard Features
- [ ] **Analytics Dashboard**
  - [ ] View KPI cards (Total Appointments, New Customers)
  - [ ] View Top Services chart
  - [ ] Verify data loads from database via API Gateway
  
- [ ] **Appointment Management** (`/admin/available-slots`)
  - [ ] View calendar with time slots
  - [ ] Create new time slots
  - [ ] View bookings
  - [ ] Assign employees to bookings
  
- [ ] **User Management**
  - [ ] List all users
  - [ ] Filter by role (ADMIN, CUSTOMER, EMPLOYEE)
  - [ ] View user details

### 3. Customer Features (Test with Regular Customer Account)
- [ ] **Book Appointment**
  - [ ] Select service
  - [ ] Choose date and time
  - [ ] Submit booking
  - [ ] Verify booking appears in database
  
- [ ] **Payment Page** (`/customer/payment`)
  - [ ] View approved bills
  - [ ] View past payments
  - [ ] Submit review (after payment)

### 4. API Gateway Verification
Use curl or Postman to test endpoints directly:

```powershell
# Get all bookings (with admin token)
curl -X GET "http://localhost:9090/api/v1/bookings" -H "Authorization: Bearer YOUR_TOKEN"

# Get services
curl -X GET "http://localhost:9090/api/v1/services"

# Get analytics metrics
curl -X GET "http://localhost:9090/api/v1/analytics/metrics"
```

---

## Database Verification

### Check Admin User in PostgreSQL
```sql
-- Connect to user-auth-service database
SELECT u.id, u.email, u.firebase_uid, r.name as role 
FROM users u 
LEFT JOIN user_roles ur ON u.id = ur.user_id 
LEFT JOIN roles r ON ur.role_id = r.id 
WHERE u.email = 'admin@gearup.com';
```

**Expected Result:**
```
 id |      email       |         firebase_uid          | role
----+------------------+-------------------------------+-------
  1 | admin@gearup.com | u2sgkfVpdTd9hkrUp5sb3ttiHOt2 | ADMIN
```

### Check Bookings
```sql
-- Connect to appointment-service database
SELECT id, customer_name, service_id, time_slot_id, status, created_at 
FROM bookings 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Troubleshooting

### Issue: "Failed to load bills. Please try again."
**Cause**: API Gateway not routing to payment service correctly

**Solution**:
1. Check API Gateway is running on port 9090
2. Verify payment service is healthy
3. Check gateway routing configuration for `/api/v1/payments/*`
4. Verify customer email in bill query matches database

### Issue: Analytics not loading
**Cause**: Analytics service or API Gateway routing issue

**Solution**:
1. Check analytics service is running on port 8087
2. Verify API Gateway routes `/api/v1/analytics/*` to analytics service
3. Check browser console for specific error
4. Verify database has booking data

### Issue: Admin login fails
**Cause**: Firebase authentication issue or database mismatch

**Solution**:
1. Verify admin user exists in Firebase with UID `u2sgkfVpdTd9hkrUp5sb3ttiHOt2`
2. Check PostgreSQL has matching user record
3. Verify password is correct: `StrOng!Admin123`
4. Check auth service logs for authentication errors

### Issue: CORS errors
**Cause**: API Gateway or service CORS configuration

**Solution**:
1. Verify API Gateway has CORS enabled for `http://localhost:3000`
2. Check each microservice has `@CrossOrigin(origins = "*")` annotation
3. Clear browser cache and hard reload (Ctrl+Shift+R)

---

## Environment Variables

Make sure these are set in `.env.local` (frontend):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:9090
NEXT_PUBLIC_APPOINTMENT_SERVICE_URL=http://localhost:9090/api/v1
NEXT_PUBLIC_MODIFICATION_SERVICE_URL=http://localhost:9090/api/v1
NEXT_PUBLIC_GATEWAY_BASE=http://localhost:9090
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
```

Make sure these are set in `.env` (backend):
```env
# API Gateway
SERVER_PORT=9090

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Firebase
FIREBASE_PROJECT_ID=gear-up-46adc
FIREBASE_CREDENTIALS_PATH=path/to/serviceAccountKey.json
```

---

## Next Steps

1. **Test all admin features** with the provided credentials
2. **Create test customer accounts** to verify customer flow
3. **Monitor API Gateway logs** for any routing issues
4. **Check database** to verify data is being saved correctly
5. **Test payment flow** end-to-end (booking → bill → payment → review)

---

## Files Modified

### Configuration
- ✅ `src/lib/api/config.ts`

### Services
- ✅ `src/app/services/appointmentService.ts`
- ✅ `src/services/appointmentService.ts`
- ✅ `src/services/modificationService.ts`
- ✅ `src/lib/api/paymentService.ts`
- ✅ `src/lib/api/billService.ts`
- ✅ `src/lib/api/reviewService.ts`

### Components
- ✅ `src/app/components/admin/analytics/KpiCards.tsx`
- ✅ `src/app/components/admin/analytics/TopServices.tsx`

---

## Success Criteria ✅

- [x] All API calls go through port 9090
- [x] All endpoints use `/api/v1/` prefix
- [x] API Gateway mode enabled in config
- [x] Admin credentials documented
- [x] Payment service integrated with gateway
- [x] Analytics service integrated with gateway
- [x] Appointment service integrated with gateway
- [x] Review and bill services integrated with gateway

---

**Migration completed on:** November 20, 2025
**API Gateway URL:** `http://localhost:9090`
**API Version:** `v1`
**Status:** ✅ READY FOR TESTING
