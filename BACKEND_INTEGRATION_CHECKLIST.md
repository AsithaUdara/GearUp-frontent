# Backend Integration Checklist

## Current Status (TEMPORARY)
- ✅ **Auth**: Firebase (working)
- ✅ **Images**: Local storage `/public/local_uploads/` (working)
- ⚠️ **Data**: Firestore (temporary - waiting for backend fix)

## Backend Issue
Vehicle Service (port 8090) is returning **500 Internal Server Error** when creating vehicles:
```bash
curl -X POST http://localhost:8090/api/vehicles \
  -H 'Content-Type: application/json' \
  -H 'X-User-ID: Ofo0UP4OP0ca3HWeuUbe0wAeCcW2' \
  -d '{"make":"Toyota","model":"Test","year":"2023","numberPlate":"TEST-123"}'
# Returns: 500 Internal Server Error
```

**GET requests work fine** (returns empty array `[]`)

## Once Backend Team Fixes the 500 Error

### Test Backend is Working:
```bash
# Test vehicle creation directly
curl -X POST http://localhost:8090/api/vehicles \
  -H 'Content-Type: application/json' \
  -H 'X-User-ID: YOUR_FIREBASE_UID' \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": "2023",
    "numberPlate": "ABC-1234",
    "photoURL": "http://localhost:3001/local_uploads/users/YOUR_UID/vehicles/example.jpg"
  }'

# Should return 201 with vehicle object
```

### Switch Back to Backend:

1. **Restore `src/lib/vehicles.ts`** to use backend API:
   - Replace Firestore imports with backend API imports
   - Use `apiCreateVehicle`, `listVehiclesByUser`, etc.
   - Keep `uploadViaLocalApi` for images (local storage)

2. **Verify Environment Variables**:
   ```env
   NEXT_PUBLIC_USE_GATEWAY=0  # Direct service calls
   NEXT_PUBLIC_API_BASE_VEHICLE=http://localhost:8090
   NEXT_PUBLIC_LOCAL_UPLOAD=1  # Keep images local
   ```

3. **Test End-to-End**:
   - Add vehicle → Should save to PostgreSQL
   - List vehicles → Should fetch from PostgreSQL
   - Update vehicle → Should update PostgreSQL
   - Delete vehicle → Should delete from PostgreSQL
   - Images should save to `/public/local_uploads/`

4. **Migrate Existing Firestore Vehicles** (if any exist):
   ```bash
   # Export from Firestore
   # Import to PostgreSQL via backend API
   # See: scripts/migrate-vehicles-to-backend.js (create if needed)
   ```

## Backend Requirements (for backend team)

### Vehicle Service Must Accept:
- ✅ **Header**: `X-User-ID: <firebase-uid>` (NOT Authorization Bearer)
- ✅ **Create**: `POST /api/vehicles` with body `{make, model, year, numberPlate, photoURL?}`
- ✅ **List**: `GET /api/vehicles/user/{userId}`
- ✅ **Update**: `PUT /api/vehicles/{vehicleId}`
- ✅ **Delete**: `DELETE /api/vehicles/{vehicleId}`

### Data Types:
```typescript
{
  id: string;           // UUID
  userId: string;       // Firebase UID
  make: string;
  model: string;
  year: number | string; // Backend should accept both
  numberPlate: string;  // Unique constraint
  photoURL?: string;    // Optional, absolute URL
  status?: string;      // AVAILABLE | IN_SERVICE | MAINTENANCE
  createdAt: Date;
  updatedAt: Date;
}
```

### Image URLs:
Frontend sends absolute URLs like:
```
http://localhost:3001/local_uploads/users/{userId}/vehicles/{timestamp}.jpg
```

Backend should store as-is (opaque URL field).

## Appointments & Modifications

**These should ALSO use backend once services are ready:**

Currently in Firestore:
- `appointments` collection
- `modifications` collection

Backend team needs to implement:
- Appointment Service (status: `scheduled | in_progress | completed | cancelled`)
- Modification Service (status: `pending | approved | in_progress | completed | rejected`)

Keep the **exact same status strings** as frontend uses them!

## Final Architecture Goal

```
Frontend (Next.js)
├── Firebase Auth (login/tokens)
├── Local Storage (vehicle images)
└── Backend PostgreSQL (via direct service calls):
    ├── Vehicle Service (8090)
    ├── Customer Service (8088)
    ├── Appointment Service (TBD)
    └── Modification Service (TBD)
```

## Quick Reference

### Current Files Modified (Temporary Firestore):
- ✅ `src/lib/vehicles.ts` - Uses Firestore + local images

### Files to Restore When Backend Fixed:
- `src/lib/vehicles.ts` - Switch back to backend API calls
- Keep `uploadViaLocalApi` for image uploads

### Environment:
- Gateway: `http://localhost:9090` (has 503 issues, bypassed)
- Vehicle Service: `http://localhost:8090` (direct call)
- Customer Service: `http://localhost:8088` (direct call)

---

**Note**: Once backend is fixed, ping me to restore backend integration code!
