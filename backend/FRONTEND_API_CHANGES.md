# 🔄 Frontend API Changes - Quick Reference

## 📅 Date: 2026-02-04

---

## ⚠️ IMPORTANT: Sirf 2 API Changes Hain!

| # | API | Change Type | Kya Karna Hai |
|---|-----|-------------|---------------|
| 1 | `POST /verify-payment` | **Modified** | Request body mein `propertyId` add karo |
| 2 | `PATCH /properties/:id/renew` | **New** | Renewal feature ke liye naya API |
| 3 | `GET /admin/pending-without-subscription` | **New** | Admin ke liye pending properties without subscription fetch karne ke liye |
| 4 | `GET /my-pending-without-subscription` | **New** | User apni un properties ko dekh sakta hai jin par subscription nahi liya gaya hai |

---

## 4️⃣ User: My Pending Properties Without Subscription (NEW)

### 🆕 Naya API - User apni un properties ki list dekh sakta hai jo "pending" status mein hain aur jinpar abhi tak subscription nahi liya gaya hai.

**Endpoint:**
```
GET /property/my-pending-without-subscription
```
**Headers:**
```
Authorization: Bearer USER_TOKEN
```

---

### cURL:
```bash
curl --location 'http://localhost:4045/property/my-pending-without-subscription' \
--header 'Authorization: Bearer YOUR_USER_TOKEN'
```

---

### Response:
```json
{
    "success": true,
    "count": 1,
    "message": "Your pending properties without subscription fetched successfully",
    "data": [
        {
            "_id": "67a9986b866579fc29352613",
            "customPropertyId": "S3-1",
            "status": "pending",
            "subscriptionPurchaseId": null,
            "address": {
                "state": "Uttar Pradesh",
                "city": "Noida",
                "locality": "Sector 62"
            }
            // ... other properties data
        }
    ]
}
```

---

## 3️⃣ Admin: Pending Properties Without Subscription (NEW)

### 🆕 Naya API - Admin ke liye un properties ko dekhne ke liye jinhe user ne add toh kiya hai par payment abhi tak nahi ki hai (Future Payment Case).

**Endpoint:**
```
GET /property/admin/pending-without-subscription
```
**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
```

---

### cURL:
```bash
curl --location 'http://localhost:4045/property/admin/pending-without-subscription' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN'
```

---

### Response:
```json
{
    "success": true,
    "count": 1,
    "message": "Pending properties without subscription fetched successfully",
    "data": [
        {
            "_id": "67a9986b866579fc29352613",
            "userId": {
                "_id": "67a747963da1facd50451cf4",
                "fullName": "John Doe",
                "email": "john@example.com",
                "contactNumber": "9876543210"
            },
            "customPropertyId": "S3-1",
            "status": "pending",
            "subscriptionPurchaseId": null,
            "address": {
                "state": "Uttar Pradesh",
                "city": "Noida",
                "locality": "Sector 62"
            }
            // ... other fields
        }
    ]
}
```

---

## 1️⃣ verify-payment API (MODIFIED)

### ⚠️ Change: `propertyId` ab REQUIRED hai

**Endpoint:**
```
POST /api/subscription-purchase/verify-payment
```

---

### cURL - Paid Plan:
```bash
curl --location 'http://localhost:4045/api/subscription-purchase/verify-payment' \
--header 'Authorization: Bearer YOUR_USER_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
    "razorpay_order_id": "order_xxxxxxxxxxxxx",
    "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
    "razorpay_signature": "signature_hash_here",
    "subscriptionPackageId": "YOUR_PACKAGE_ID",
    "propertyId": "YOUR_PROPERTY_ID",
    "isFreeMode": false
}'
```

---

### cURL - Free Plan:
```bash
curl --location 'http://localhost:4045/api/subscription-purchase/verify-payment' \
--header 'Authorization: Bearer YOUR_USER_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
    "subscriptionPackageId": "YOUR_PACKAGE_ID",
    "propertyId": "YOUR_PROPERTY_ID",
    "isFreeMode": true
}'
```

---

### Response:
```json
{
    "success": true,
    "message": "Subscription created. Waiting for admin approval.",
    "data": {
        "_id": "subscription_id",
        "userId": "user_id",
        "propertyId": "property_id",
        "subscriptionPackageId": "package_id",
        "status": "pending_approval",
        "startDate": null,
        "endDate": null,
        "amount": 499
    }
}
```

---

### Error Responses:
```json
// Property ID missing
{
    "success": false,
    "message": "Property ID is required"
}

// Property not found
{
    "success": false,
    "message": "Property not found or does not belong to you"
}

// Property already has subscription
{
    "success": false,
    "message": "This property already has an active or pending subscription"
}
```

---
---

## 2️⃣ renew API (NEW)

### 🆕 Naya API - Expired Property Renew Karne Ke Liye

**Endpoint:**
```
PATCH /property/properties/:propertyId/renew
```

---

### cURL:
```bash
curl --location --request PATCH 'http://localhost:4045/property/properties/YOUR_PROPERTY_ID/renew' \
--header 'Authorization: Bearer YOUR_USER_TOKEN'
```

---

### Response:
```json
{
    "success": true,
    "message": "Property renewed successfully",
    "property": {
        "_id": "property_id",
        "status": "approved",
        "customPropertyId": "S1-1"
    },
    "subscription": {
        "startDate": "2026-02-04T16:35:00.000Z",
        "endDate": "2026-03-04T16:35:00.000Z",
        "status": "active"
    }
}
```

---

### Error Responses:
```json
// Property not expired
{
    "success": false,
    "message": "Expired property not found or not owned by you"
}

// No subscription purchased
{
    "success": false,
    "message": "Please purchase a subscription plan first to renew this property"
}
```

---
---

## 📋 Complete Renewal Flow (Step by Step)

Jab user ki property expire ho jaaye aur use renew karna ho:

### Step 1: Get Subscription Packages
```bash
curl --location 'http://localhost:4045/api/subscription?city=Noida'
```

---

### Step 2: Create Razorpay Order
```bash
curl --location 'http://localhost:4045/api/subscription-purchase/create-order' \
--header 'Authorization: Bearer YOUR_USER_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
    "subscriptionPackageId": "PACKAGE_ID_FROM_STEP_1"
}'
```

---

### Step 3: User Pays via Razorpay
(Frontend handles Razorpay payment flow)

---

### Step 4: Verify Payment
```bash
curl --location 'http://localhost:4045/api/subscription-purchase/verify-payment' \
--header 'Authorization: Bearer YOUR_USER_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
    "razorpay_order_id": "ORDER_ID_FROM_RAZORPAY",
    "razorpay_payment_id": "PAYMENT_ID_FROM_RAZORPAY",
    "razorpay_signature": "SIGNATURE_FROM_RAZORPAY",
    "subscriptionPackageId": "PACKAGE_ID",
    "propertyId": "EXPIRED_PROPERTY_ID",
    "isFreeMode": false
}'
```

---

### Step 5: Renew Property ⭐
```bash
curl --location --request PATCH 'http://localhost:4045/property/properties/EXPIRED_PROPERTY_ID/renew' \
--header 'Authorization: Bearer YOUR_USER_TOKEN'
```

---

### Step 6: ✅ DONE!
- Property status: `approved`
- Subscription status: `active`
- No admin approval needed for renewal!

---
---

## 🔄 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                 NEW PROPERTY FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. POST /property/add         → Property created (pending)    │
│  2. GET /api/subscription      → Get packages                  │
│  3. POST /create-order         → Razorpay order                │
│  4. Razorpay Payment           → User pays                     │
│  5. POST /verify-payment       → Subscription created          │
│     ⚠️ (propertyId required)     (pending_approval)            │
│  6. Admin approves             → Property approved             │
│                                  Subscription active           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 RENEWAL FLOW                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. GET /api/subscription      → Get packages                  │
│  2. POST /create-order         → Razorpay order                │
│  3. Razorpay Payment           → User pays                     │
│  4. POST /verify-payment       → Subscription created          │
│     (propertyId = expired)       (pending_approval)            │
│  5. PATCH /renew 🆕            → Property approved             │
│     (NO ADMIN NEEDED!)           Subscription active           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] verify-payment API mein `propertyId` add karo (REQUIRED)
- [ ] Expired properties ke liye "Renew" button add karo
- [ ] Renew button pe: subscription purchase → renew API call
- [ ] Property status handle karo: pending, approved, expired

---

## 🆘 Questions?

Backend team se contact karo agar koi doubt ho!
