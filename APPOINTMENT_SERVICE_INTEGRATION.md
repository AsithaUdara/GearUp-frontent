# Appointment Service Frontend Integration

This document explains how to connect and test the GearUp appointment service with the frontend.

## Backend Endpoints Used

The frontend now connects to these appointment service endpoints:

- **Health Check**: `GET /actuator/health`
- **Get Services**: `GET /api/services`
- **Get Time Slots**: `GET /api/timeslots?date=YYYY-MM-DD&serviceId=ID`
- **Create Booking**: `POST /api/bookings`
- **Get User Bookings**: `GET /api/bookings?userId=USER_ID`

## Setup Instructions

### 1. Environment Configuration

Ensure your `.env.local` file contains:

```bash
NEXT_PUBLIC_APPOINTMENT_SERVICE_URL=http://localhost:8084
```

### 2. Start the Appointment Service Backend

```bash
# Navigate to appointment service directory
cd GearUp-backend/services/appointment-service

# Start the service (make sure PostgreSQL is running)
./mvnw spring-boot:run
```

The service should start on port `8084`.

### 3. Start the Frontend

```bash
# Navigate to frontend directory
cd GearUp-frontent

# Install dependencies (if not done already)
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Testing the Connection

### Manual Testing

1. Open the browser console on the appointment booking page
2. Look for the backend status indicator in the bottom-right corner
3. Check for any error messages in the console

### Programmatic Testing

Use the test script to verify connectivity:

```javascript
// In browser console
import { testBackendConnection } from '@/services/testConnection';
testBackendConnection();
```

### Expected Behavior

✅ **When Backend is Running:**
- Green status indicator showing "Service Online"
- Services load dynamically from the backend
- Time slots are fetched based on selected date
- Appointment booking works end-to-end

❌ **When Backend is Down:**
- Red status indicator showing "Service Offline"
- Error page with "Service Temporarily Unavailable"
- Option to retry connection

## Troubleshooting

### Common Issues

1. **"Service Temporarily Unavailable"**
   - Check if appointment service is running on port 8084
   - Verify PostgreSQL database is accessible
   - Check network connectivity

2. **CORS Errors**
   - Ensure the appointment service has CORS configured for `http://localhost:3000`
   - Check if `@CrossOrigin(origins = "*")` is present in controllers

3. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials in application.properties
   - Ensure database schema is created (Flyway migrations)

### Health Check URLs

- **Appointment Service Health**: http://localhost:8084/actuator/health
- **Services Endpoint**: http://localhost:8084/api/services
- **Time Slots Endpoint**: http://localhost:8084/api/timeslots?date=2025-11-07

### Logs to Check

**Backend Logs:**
```bash
# Check appointment service logs
./mvnw spring-boot:run

# Look for:
# - "Started AppointmentServiceApplication"
# - Database connection messages
# - Any error stack traces
```

**Frontend Logs:**
```javascript
// Browser console logs
// Look for:
// - "Backend health check failed"
// - "Error fetching services"
// - Network errors in Network tab
```

## API Data Formats

### Service Response Format
```json
[
  {
    "id": 1,
    "name": "Oil Change",
    "description": "Complete oil change service",
    "duration": 30,
    "price": 15000.0,
    "active": true
  }
]
```

### Time Slot Response Format
```json
[
  {
    "id": 1,
    "startTime": "09:00",
    "endTime": "10:00",
    "available": true,
    "date": "2025-11-07"
  }
]
```

### Booking Request Format
```json
{
  "userId": "firebase-user-id",
  "serviceId": 1,
  "date": "2025-11-07",
  "timeSlotId": 1,
  "customerName": "John Doe",
  "phone": "0771234567",
  "email": "john@example.com",
  "vehicleModel": "Toyota Corolla",
  "vehicleYear": "2020",
  "specialRequests": "Please use synthetic oil"
}
```

## Features Implemented

- ✅ Real-time backend health monitoring
- ✅ Dynamic service loading from backend
- ✅ Date-based time slot filtering
- ✅ End-to-end appointment booking
- ✅ Error handling and user feedback
- ✅ Loading states and animations
- ✅ Responsive design
- ✅ Form validation

## Next Steps

To enhance the integration further:

1. **Authentication Integration**: Add JWT token passing to backend
2. **Real-time Updates**: Implement WebSocket for live availability updates
3. **Caching**: Add service and time slot caching for better performance
4. **Offline Support**: Handle offline scenarios gracefully
5. **Retry Logic**: Add automatic retry for failed requests