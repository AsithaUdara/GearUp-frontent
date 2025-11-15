# Auth Service Integration Guide

## 🔐 Authentication Integration TODO

This document outlines the steps needed to integrate the Auth Service with the Payment & Review system.

---

## 📋 **Current State**

### **Temporary Implementation:**
The system currently uses **hardcoded email addresses** in components for development:
- Customer Bills: `'john@example.com'`
- Review Submission: Uses bill's customer email from API response

### **What Needs to Change:**
When the Auth Service is ready, replace hardcoded emails with real user authentication.

---



### **1. ApprovedBills Component**
**File:** `src/app/components/customer/dashboard/ApprovedBills.tsx`

**Current Code (Line ~28):**
```typescript
// TODO: Replace with actual user email from Auth Service
const userEmail = 'john@example.com'; // Temporary hardcoded for development
```

**Replace With:**
```typescript
import { useAuth } from '@/context/AuthContext'; // or your auth hook

const { user } = useAuth();
const userEmail = user?.email;

if (!userEmail) {
  setError('User not authenticated');
  return;
}
```

---

### **2. PaymentPageClient Component**
**File:** `src/app/customer/payment/PaymentPageClient.tsx`

**Current Code (Line ~24):**
```typescript
// TODO: Replace with actual user email from Auth Service
const userEmail = 'john@example.com'; // Temporary hardcoded for development
```

**Replace With:**
```typescript
import { useAuth } from '@/context/AuthContext';

const { user } = useAuth();
const userEmail = user?.email;

if (!userEmail) {
  console.error('User not authenticated');
  return;
}
```

---

### **3. Review Submission**
**File:** `src/app/customer/payment/PaymentPageClient.tsx`

**Current Code (Line ~60):**
Uses `bill.customerEmail` and `bill.customerName` from API response.

**Status:** ✅ **Already correct!** 
- Gets email/name from the bill data
- No changes needed when auth is integrated

---

## 🎯 **Implementation Steps**

### **Step 1: Set Up Auth Context** (If not already done)
Create or use existing `AuthContext` that provides:
```typescript
interface AuthContextType {
  user: {
    email: string;
    name: string;
    role: 'ADMIN' | 'CUSTOMER' | 'EMPLOYEE';
  } | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}
```

### **Step 2: Protect Routes**
Wrap customer payment routes with authentication:
```typescript
// In layout or page component
const { isAuthenticated, user } = useAuth();

if (!isAuthenticated || user?.role !== 'CUSTOMER') {
  redirect('/login');
}
```

### **Step 3: Update API Calls**
Search for all instances of hardcoded `'john@example.com'` and replace with `useAuth()` hook.

**Files to Update:**
- ✅ `ApprovedBills.tsx` - Already marked with TODO
- ✅ `PaymentPageClient.tsx` - Already marked with TODO
- ✅ Review submission - Uses bill data (no changes needed)

### **Step 4: Test Authentication Flow**
1. User logs in → Auth service returns JWT token
2. Token stored in httpOnly cookie or secure storage
3. All API calls include authentication header
4. Backend validates token and returns user-specific data
5. Frontend displays bills/reviews only for authenticated user

---

## 🔒 **Security Considerations**

### **Current (Development):**
- ❌ No authentication
- ❌ Hardcoded email for testing
- ❌ Anyone can access any user's data

### **Production (After Auth Integration):**
- ✅ JWT token authentication
- ✅ User-specific data filtered by authenticated email
- ✅ Role-based access control (CUSTOMER, ADMIN, EMPLOYEE)
- ✅ Protected routes with auth guards

---

## 📝 **Testing After Integration**

### **Test Checklist:**
- [ ] User can only see their own bills
- [ ] User can only submit reviews for their own bills
- [ ] Logout clears user session
- [ ] Expired tokens redirect to login
- [ ] API returns 401 for unauthenticated requests
- [ ] API returns 403 for unauthorized access (wrong role)

---

## 🚀 **Migration Path**

### **Current Development Setup:**
```
Frontend (Hardcoded email: 'john@example.com')
    ↓
API (No auth validation)
    ↓
Database (Returns data for 'john@example.com')
```

### **Production Setup (After Auth):**
```
Frontend (useAuth hook → user.email)
    ↓ JWT Token
API (Validates token → extracts user email)
    ↓ Authenticated
Database (Returns data for authenticated user only)
```

---

## 📌 **Quick Search Commands**

Find all hardcoded emails in payment/review components:
```bash
# PowerShell
Select-String -Path "src/app/**/*.tsx" -Pattern "john@example.com"
```

Find all TODO comments for auth integration:
```bash
# PowerShell
Select-String -Path "src/**/*.{ts,tsx}" -Pattern "TODO.*Auth"
```

---

## ✅ **Completion Checklist**

- [ ] Auth Context/Hook implemented
- [ ] `ApprovedBills.tsx` updated to use `useAuth()`
- [ ] `PaymentPageClient.tsx` updated to use `useAuth()`
- [ ] Customer routes protected with auth guards
- [ ] Admin routes protected with role check
- [ ] API endpoints updated to validate JWT tokens
- [ ] Backend extracts user email from validated token
- [ ] End-to-end testing with real auth flow
- [ ] Remove all hardcoded 'john@example.com' references
- [ ] Update CLEANUP_SUMMARY.md

---

## 📚 **Related Files**

- `src/context/AuthContext.tsx` - Auth context (may need updates)
- `src/lib/api/config.ts` - API configuration (add auth headers)
- `src/app/customer/layout.tsx` - Add auth protection
- `src/app/admin/layout.tsx` - Add role-based protection

---

**Created:** November 7, 2025  
**Status:** 🟡 Waiting for Auth Service Integration  
**Priority:** HIGH (Required for production)
