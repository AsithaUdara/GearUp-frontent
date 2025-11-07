# System Architecture - Admin Features

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     AUTOCARE SYSTEM                          │
│                   (Frontend Only - Next.js)                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   ADMIN SIDE     │         │  CUSTOMER SIDE   │
└──────────────────┘         └──────────────────┘
        │                            │
        ├── Dashboard                ├── Dashboard
        ├── Payment Approval         ├── Payment Page
        ├── Reviews Management       ├── Review Submission
        └── Feedback                 └── Service History
                │                            │
                └────────────┬───────────────┘
                             │
                    ┌────────▼────────┐
                    │  localStorage   │
                    │  (Browser DB)   │
                    └─────────────────┘
```

---

## 🔄 Data Flow Architecture

### Payment Approval Flow

```
┌─────────────┐
│  EMPLOYEE   │
│  (Submits)  │
└──────┬──────┘
       │
       │ Creates payment request
       │ (Service items + prices)
       ▼
┌──────────────────────────────┐
│  adminPaymentRequests        │
│  localStorage                │
│  Status: "pending"           │
└──────┬───────────────────────┘
       │
       │ Admin reviews
       ▼
┌──────────────────────────────┐
│  ADMIN                       │
│  /admin/payments             │
│  - Views request             │
│  - Calculates total + tax    │
│  - Approves/Rejects          │
└──────┬───────────────────────┘
       │
       │ On Approve
       ▼
┌──────────────────────────────┐
│  customerApprovedBills       │
│  localStorage                │
│  Status: "unpaid"            │
└──────┬───────────────────────┘
       │
       │ Customer views
       ▼
┌──────────────────────────────┐
│  CUSTOMER                    │
│  /customer/payment           │
│  - Views bill                │
│  - Downloads bill            │
│  - Marks as paid             │
└──────┬───────────────────────┘
       │
       │ After payment
       ▼
┌──────────────────────────────┐
│  Review Submission Enabled   │
└──────────────────────────────┘
```

---

### Review Management Flow

```
┌─────────────┐
│  CUSTOMER   │
│  (Submits)  │
└──────┬──────┘
       │
       │ After paying bill
       │ (Rating + Comment)
       ▼
┌──────────────────────────────┐
│  customerReviews             │
│  localStorage                │
│  publishedToLanding: false   │
└──────┬───────────────────────┘
       │
       │ Admin reviews
       ▼
┌──────────────────────────────┐
│  ADMIN                       │
│  /admin/reviews              │
│  - Views all reviews         │
│  - Selects quality reviews   │
│  - Publishes to landing      │
└──────┬───────────────────────┘
       │
       │ On Publish
       ▼
┌──────────────────────────────┐
│  publishedTestimonials       │
│  localStorage                │
└──────┬───────────────────────┘
       │
       │ Displayed on
       ▼
┌──────────────────────────────┐
│  LANDING PAGE                │
│  /reviews                    │
│  - Public can view           │
│  - Builds trust              │
└──────────────────────────────┘
```

---

## 📂 File Structure

```
gearup-frontent/
│
├── src/
│   ├── app/
│   │   ├── admin/                    # Admin Section
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Admin Dashboard
│   │   │   ├── payments/
│   │   │   │   └── page.tsx          # Payment Approval
│   │   │   ├── reviews/
│   │   │   │   └── page.tsx          # Reviews Management
│   │   │   └── feedback/
│   │   │       └── page.tsx          # Feedback (existing)
│   │   │
│   │   ├── customer/                 # Customer Section
│   │   │   ├── dashboard/
│   │   │   ├── payment/
│   │   │   │   ├── page.tsx          # Payment Page Layout
│   │   │   │   └── PaymentPageClient.tsx  # Payment Logic
│   │   │   └── vehicles/
│   │   │
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AdminLayout.tsx   # Admin Sidebar
│   │   │   │   └── AdminFeedbackList.tsx
│   │   │   │
│   │   │   └── customer/
│   │   │       └── dashboard/
│   │   │           ├── ApprovedBills.tsx       # NEW
│   │   │           ├── ReviewSubmissionModal.tsx  # NEW
│   │   │           ├── PaymentSummary.tsx
│   │   │           ├── PaymentMethods.tsx
│   │   │           └── AddCardModal.tsx
│   │   │
│   │   └── reviews/
│   │       └── page.tsx              # Public Reviews Page
│   │
│   └── lib/
│       ├── testimonialsData.ts       # Static testimonials
│       └── utils.ts
│
├── ADMIN_FEATURES_README.md          # Feature docs
├── IMPLEMENTATION_SUMMARY.md         # Technical docs
├── QUICK_START_GUIDE.md              # Quick reference
├── CHANGES_LOG.md                    # Changelog
└── SYSTEM_ARCHITECTURE.md            # This file
```

---

## 🗄️ Data Models

### PaymentRequest Model
```typescript
{
  id: string;                    // Unique identifier
  customerName: string;          // Customer name
  email: string;                 // Customer email
  vehicleInfo: string;           // Vehicle details
  services: [                    // Array of services
    {
      id: string;
      description: string;       // e.g., "Oil Change"
      price: number;             // e.g., 50.00
    }
  ];
  totalAmount: number;           // Sum of all services
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;           // Employee name
  submittedDate: string;         // ISO date
  approvedDate?: string;         // ISO date (optional)
}
```

### ApprovedBill Model
```typescript
{
  id: string;                    // Same as PaymentRequest ID
  customerEmail: string;
  customerName: string;
  vehicleInfo: string;
  services: ServiceItem[];       // Same as above
  totalAmount: number;           // Subtotal (before tax)
  approvedDate: string;          // ISO date
  status: 'unpaid' | 'paid';
  reviewSubmitted?: boolean;     // Optional flag
}
```

### Review Model
```typescript
{
  id: string;                    // Unique identifier
  customerName: string;
  email: string;
  vehicleService: string;        // Service(s) reviewed
  rating: number;                // 1-5
  comment: string;               // Review text
  date: string;                  // ISO date
  publishedToLanding: boolean;   // Published status
}
```

### Testimonial Model (Published Reviews)
```typescript
{
  quote: string;                 // Review comment
  name: string;                  // Customer name
  service?: string;              // Service name (optional)
}
```

---

## 🔌 Component Interactions

### Admin Payment Approval Page

```
┌─────────────────────────────────────┐
│  AdminPaymentsPage                  │
│  /admin/payments/page.tsx           │
├─────────────────────────────────────┤
│  State:                             │
│  - paymentRequests: PaymentRequest[]│
│                                     │
│  Functions:                         │
│  - approvePayment(id)               │
│  - rejectPayment(id)                │
│  - generateBill(request)            │
│                                     │
│  Effects:                           │
│  - Load from localStorage           │
│  - Save to localStorage             │
│                                     │
│  Renders:                           │
│  - Statistics cards                 │
│  - Payment requests list            │
│  - Action buttons                   │
└─────────────────────────────────────┘
         │
         │ Uses
         ▼
┌─────────────────────────────────────┐
│  AdminLayout                        │
│  Provides sidebar & navigation      │
└─────────────────────────────────────┘
```

### Admin Reviews Management Page

```
┌─────────────────────────────────────┐
│  AdminReviewsPage                   │
│  /admin/reviews/page.tsx            │
├─────────────────────────────────────┤
│  State:                             │
│  - reviews: Review[]                │
│                                     │
│  Functions:                         │
│  - publishToLanding(id)             │
│  - unpublishFromLanding(id)         │
│  - deleteReview(id)                 │
│  - renderStars(rating)              │
│                                     │
│  Effects:                           │
│  - Load from localStorage           │
│  - Save to localStorage             │
│                                     │
│  Renders:                           │
│  - Statistics cards                 │
│  - Reviews list with actions        │
│  - Publish/unpublish buttons        │
└─────────────────────────────────────┘
         │
         │ Uses
         ▼
┌─────────────────────────────────────┐
│  AdminLayout                        │
│  Provides sidebar & navigation      │
└─────────────────────────────────────┘
```

### Customer Payment Page

```
┌─────────────────────────────────────┐
│  PaymentPageClient                  │
│  /customer/payment/                 │
│  PaymentPageClient.tsx              │
├─────────────────────────────────────┤
│  State:                             │
│  - modalOpen: boolean               │
│  - reviewModalOpen: boolean         │
│  - selectedBillId: string           │
│  - selectedService: string          │
│                                     │
│  Functions:                         │
│  - handleReviewSubmitAction(id)     │
│  - handleReviewSubmitComplete()     │
│  - handleAddCardAction()            │
│                                     │
│  Renders:                           │
│  - PaymentSummary                   │
│  - ApprovedBills                    │
│  - Saved payment methods            │
│  - AddCardModal                     │
│  - ReviewSubmissionModal            │
└─────────────────────────────────────┘
         │
         │ Uses
         ▼
┌─────────────────────────────────────┐
│  ApprovedBills                      │
│  Shows approved bills               │
│  - Download bill                    │
│  - Mark as paid                     │
│  - Trigger review submission        │
└─────────────────────────────────────┘
         │
         │ Triggers
         ▼
┌─────────────────────────────────────┐
│  ReviewSubmissionModal              │
│  Review form                        │
│  - Star rating (1-5)                │
│  - Comment textarea                 │
│  - Validation                       │
│  - Submit/Cancel                    │
└─────────────────────────────────────┘
```

---

## 🎨 UI Component Hierarchy

```
App Root
│
├── Admin Section
│   └── AdminLayout
│       ├── Sidebar
│       │   ├── Logo
│       │   ├── User Info
│       │   ├── Navigation Links
│       │   │   ├── Dashboard
│       │   │   ├── Payment Approval
│       │   │   ├── Reviews Management
│       │   │   └── Feedback
│       │   └── Logout Button
│       │
│       └── Main Content Area
│           ├── Dashboard Page
│           │   ├── Statistics Cards
│           │   └── Quick Actions
│           │
│           ├── Payment Approval Page
│           │   ├── Statistics Cards
│           │   └── Payment Requests List
│           │       └── Payment Request Card
│           │           ├── Customer Info
│           │           ├── Services Table
│           │           └── Action Buttons
│           │
│           └── Reviews Management Page
│               ├── Statistics Cards
│               └── Reviews List
│                   └── Review Card
│                       ├── Customer Info
│                       ├── Rating Stars
│                       ├── Comment
│                       └── Action Buttons
│
└── Customer Section
    └── CustomerLayout
        └── Payment Page
            ├── PaymentSummary
            │   ├── Current Services
            │   ├── Payment History
            │   └── Payment Methods
            │
            ├── ApprovedBills
            │   └── Bill Card
            │       ├── Bill Info
            │       ├── Services Table
            │       └── Action Buttons
            │
            ├── Saved Payment Methods
            │
            └── Modals
                ├── AddCardModal
                └── ReviewSubmissionModal
                    ├── Star Rating
                    ├── Comment Field
                    └── Submit Button
```

---

## 💾 localStorage Schema

```javascript
// Key: adminPaymentRequests
[
  {
    id: "pr1",
    customerName: "John Doe",
    email: "john@example.com",
    vehicleInfo: "Toyota Camry 2020 - ABC123",
    services: [
      { id: "s1", description: "Oil Change", price: 50 },
      { id: "s2", description: "Tire Service", price: 40 }
    ],
    totalAmount: 90,
    status: "pending",
    submittedBy: "Mike (Technician)",
    submittedDate: "2025-10-25"
  }
]

// Key: customerApprovedBills
[
  {
    id: "pr1",
    customerEmail: "john@example.com",
    customerName: "John Doe",
    vehicleInfo: "Toyota Camry 2020 - ABC123",
    services: [...],
    totalAmount: 90,
    approvedDate: "2025-10-26",
    status: "unpaid",
    reviewSubmitted: false
  }
]

// Key: customerReviews
[
  {
    id: "r1",
    customerName: "John Doe",
    email: "john@example.com",
    vehicleService: "Oil Change, Tire Service",
    rating: 5,
    comment: "Excellent service!",
    date: "2025-10-26",
    publishedToLanding: false
  }
]

// Key: publishedTestimonials
[
  {
    quote: "Excellent service!",
    name: "John Doe",
    service: "Oil Change, Tire Service"
  }
]
```

---

## 🔐 Security Architecture (Current)

```
┌─────────────────────────────────────┐
│  CURRENT (Frontend Only)            │
├─────────────────────────────────────┤
│  ❌ No authentication               │
│  ❌ No authorization                │
│  ❌ No encryption                   │
│  ❌ No API security                 │
│  ✅ Client-side validation          │
│  ✅ Error handling                  │
│  ✅ Input sanitization (basic)      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  RECOMMENDED (Production)           │
├─────────────────────────────────────┤
│  ✅ JWT authentication              │
│  ✅ Role-based access control       │
│  ✅ HTTPS encryption                │
│  ✅ API rate limiting               │
│  ✅ CSRF protection                 │
│  ✅ XSS prevention                  │
│  ✅ SQL injection prevention        │
│  ✅ Input validation (server-side)  │
└─────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────┐
│              PRODUCTION ARCHITECTURE             │
└─────────────────────────────────────────────────┘

┌──────────────┐
│   FRONTEND   │  Next.js (Vercel/Netlify)
│   (React)    │  - Static pages
└──────┬───────┘  - Client components
       │
       │ HTTPS
       ▼
┌──────────────┐
│   API LAYER  │  Node.js/Express or Next.js API Routes
│   (REST)     │  - Authentication
└──────┬───────┘  - Authorization
       │          - Business logic
       │
       ▼
┌──────────────┐
│   DATABASE   │  PostgreSQL/MongoDB
│              │  - User data
└──────┬───────┘  - Payment records
       │          - Reviews
       │
       ▼
┌──────────────┐
│   STORAGE    │  AWS S3/Cloudinary
│              │  - Bill PDFs
└──────────────┘  - Images
```

---

## 📊 State Management

### Current Approach (useState + localStorage)

```
Component
    │
    ├── useState (local state)
    │   └── Manages UI state
    │
    └── useEffect (side effects)
        └── Syncs with localStorage
            ├── Load on mount
            └── Save on change
```

### Future Approach (With Backend)

```
Component
    │
    ├── useState (local state)
    │
    ├── useEffect (API calls)
    │   ├── Fetch data on mount
    │   └── Update on change
    │
    └── React Query / SWR
        ├── Caching
        ├── Optimistic updates
        └── Error handling
```

---

## 🔄 Lifecycle Flow

### Payment Approval Lifecycle

```
1. CREATED
   ├── Employee submits request
   └── Status: "pending"

2. UNDER REVIEW
   ├── Admin views in dashboard
   └── Status: "pending"

3. APPROVED
   ├── Admin clicks approve
   ├── Bill generated
   └── Status: "approved"

4. CUSTOMER NOTIFIED
   ├── Bill appears in customer portal
   └── Status: "unpaid"

5. PAYMENT MADE
   ├── Customer marks as paid
   └── Status: "paid"

6. REVIEW ENABLED
   ├── Review button appears
   └── Customer can submit review

7. COMPLETED
   └── Review submitted
```

### Review Lifecycle

```
1. SUBMITTED
   ├── Customer submits review
   └── publishedToLanding: false

2. UNDER REVIEW
   ├── Admin views in dashboard
   └── publishedToLanding: false

3. PUBLISHED
   ├── Admin clicks publish
   ├── Added to testimonials
   └── publishedToLanding: true

4. VISIBLE
   └── Appears on /reviews page
```

---

## 🎯 Summary

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Modular component structure
- ✅ Scalable data flow
- ✅ Easy to understand and maintain
- ✅ Ready for backend integration
- ✅ Production-ready frontend

**Status**: Fully functional frontend-only system with clear path to full-stack implementation.
