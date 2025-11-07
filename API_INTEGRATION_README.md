# 🚀 GearUp Frontend API Integration

## 📁 Project Structure

```
src/lib/api/
├── config.ts           # API configuration (direct vs gateway)
├── paymentService.ts   # Payment request APIs
├── billService.ts      # Customer bill APIs
├── reviewService.ts    # Review APIs
└── index.ts           # Central exports

src/types/
└── payment.ts         # TypeScript interfaces

src/lib/
└── mockAuth.ts        # Mock authentication (temporary)
```

---

## 🔧 Configuration

### Switch Between Direct Access & API Gateway

Edit `src/lib/api/config.ts`:

```typescript
// Development: Direct service access
const USE_API_GATEWAY = false;

// Production: API Gateway routing
const USE_API_GATEWAY = true;
```

**Current Mode**: Direct Access ✅  
**Base URL**: http://localhost:8083

---

## 📡 Available APIs

### Payment Service APIs

```typescript
import { getAllPaymentRequests, approvePaymentRequest, getPaymentStats } from '@/lib/api';

// Get all payment requests
const requests = await getAllPaymentRequests();

// Approve a request
const approved = await approvePaymentRequest(requestId);

// Get statistics
const stats = await getPaymentStats();
```

### Bill Service APIs

```typescript
import { getCustomerBills, markBillAsPaid, canSubmitReview } from '@/lib/api';

// Get customer's bills
const bills = await getCustomerBills('customer@email.com');

// Mark bill as paid
const paidBill = await markBillAsPaid(billId);

// Check if can submit review
const canReview = canSubmitReview(bill); // returns boolean
```

### Review Service APIs

```typescript
import { submitReview, publishReview, getPublishedReviews } from '@/lib/api';

// Customer submits review
const review = await submitReview({
  billId: 'bill-123',
  rating: 5,
  reviewText: 'Excellent service!'
});

// Admin publishes review
await publishReview(reviewId);

// Get published reviews for landing page
const reviews = await getPublishedReviews();
```

---

## 👤 Mock Authentication

### Usage Example

```typescript
import { MOCK_USERS, setMockUser, getMockUserEmail, isAdmin } from '@/lib/mockAuth';

// Switch to customer user
setMockUser('customer1'); // Emily Brown

// Get current user email
const email = getMockUserEmail(); // emily.brown@email.com

// Check role
if (isAdmin()) {
  // Show admin features
}
```

### Available Mock Users

| Key | Email | Name | Role |
|-----|-------|------|------|
| `admin` | admin@gearup.com | Admin User | ADMIN |
| `customer1` | emily.brown@email.com | Emily Brown | CUSTOMER |
| `customer2` | jane.smith@email.com | Jane Smith | CUSTOMER |
| `employee` | john.mechanic@gearup.com | John Mechanic | EMPLOYEE |

---

## 🎨 TypeScript Types

All types are available in `@/types/payment`:

```typescript
import type { 
  PaymentRequest,
  CustomerBill, 
  CustomerReview,
  PaymentStatus,
  ReviewSubmissionDTO 
} from '@/types/payment';
```

---

## 🔄 Migration Path to API Gateway

When auth service is ready:

**Step 1**: Update `config.ts`
```typescript
const USE_API_GATEWAY = true;
```

**Step 2**: Add authentication headers
```typescript
// In each service file, update fetch calls:
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}` // Add this
}
```

**Step 3**: Configure API Gateway routes
```yaml
# api-gateway/application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: payment-service
          uri: http://localhost:8083
          predicates:
            - Path=/api/payments/**, /api/reviews/**
```

**That's it!** No other frontend changes needed. ✅

---

## 🧪 Testing

### Test with Postman First

1. Test backend APIs directly: http://localhost:8083/api/...
2. Verify mock data is loaded
3. Check response structure matches TypeScript types

### Then Test in Frontend

```typescript
// Example: Test in React component
useEffect(() => {
  const fetchData = async () => {
    try {
      const requests = await getAllPaymentRequests();
      console.log('Payment requests:', requests);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  fetchData();
}, []);
```

---

## ✅ What's Complete

- ✅ API configuration layer
- ✅ All service functions implemented
- ✅ TypeScript types defined
- ✅ Mock authentication setup
- ✅ Error handling
- ✅ Helper functions (formatting, validation)
- ✅ Future-proof architecture (easy gateway migration)

## 🔜 Next Steps

1. **Update Admin Payment Page** - Connect to real API
2. **Update Customer Bills Page** - Fetch from API
3. **Create Review Form** - Submit reviews
4. **Admin Review Management** - Manage reviews
5. **Landing Page Integration** - Show published reviews

---

## 📚 Documentation

- [pgAdmin Setup Guide](../../gearup-backend/GearUp-backend/docs/PGADMIN_PAYMENT_SERVICE.md)
- Payment Service: http://localhost:8083
- pgAdmin: http://localhost:5050

---

**Ready to connect your UI components!** 🎉
