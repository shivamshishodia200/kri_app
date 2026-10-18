# 📝 Subscription-Based Property Approval System - Changes Documentation

## 📅 Date: 2026-02-04

---

## 🎯 Requirement Summary

1. User property add karta hai → Property `pending` mein jaati hai
2. User subscription purchase karta hai (with propertyId) → Subscription `pending_approval` mein rehti hai
3. Admin property approve karta hai →
   - Subscription ka `startDate` ab se start
   - `endDate` plan ke according calculate
   - Subscription status `active`
   - Property status `approved`
4. Subscription expire hone par → Property bhi `expired` ho jaaye
5. User expired property renew karna chahe → Naya plan purchase kare, admin approval nahi chahiye

---

## 📁 Files Changed (Total: 6 Files)

### 1️⃣ `models/subscriptionPurchase.js`
**Type:** Modified

**Changes:**
- ✅ Added `propertyId` field - Subscription ko specific property se link karta hai
- ✅ `startDate` default changed from `Date.now` to `null` - Admin approval par set hoga
- ✅ `endDate` default changed to `null` (required removed) - Admin approval par set hoga
- ✅ Added `pending_approval` status - Payment complete but waiting for admin approval
- ✅ Status enum updated: `["pending_approval", "active", "expired", "cancelled"]`

---

### 2️⃣ `models/addProps.js`
**Type:** Modified

**Changes:**
- ✅ Added `expired` to status enum: `["pending", "approved", "rejected", "expired"]`
- ✅ Added `subscriptionPurchaseId` field - Property ko subscription se link karta hai

---

### 3️⃣ `controllers/subscriptionPurchaseController.js`
**Type:** Modified

**Function Updated:** `verifyPayment`

**Changes:**
- ✅ `propertyId` required parameter add kiya
- ✅ Property ownership validation added
- ✅ Check if property already has active/pending subscription
- ✅ Subscription create with `status: "pending_approval"`
- ✅ `startDate` and `endDate` set to `null` initially
- ✅ Property ko subscription se link karta hai

---

### 4️⃣ `controllers/addController.js`
**Type:** Modified

**Functions Updated/Added:**

#### `approveProperty` (Updated)
- ✅ Finds pending subscription for the property
- ✅ Calculates `startDate` (now) and `endDate` (based on plan duration)
- ✅ Activates subscription with proper dates
- ✅ Approves property

#### `renewProperty` (New)
- ✅ User expired property ko renew kar sakta hai
- ✅ Requires new subscription purchase for the property
- ✅ No admin approval needed for renewal
- ✅ Automatically activates subscription and approves property

---

### 5️⃣ `cron/subscriptionExpireCron.js`
**Type:** New File Created

**Functions:**

#### `startSubscriptionExpireCron()`
- ✅ Runs daily at midnight (00:00)
- ✅ Expires owner subscriptions with `endDate < now`
- ✅ Expires linked properties when subscription expires
- ✅ Also handles tenant subscription expiry

#### `manualExpireAllSubscriptions(req, res)`
- ✅ Admin API to manually trigger expiry check
- ✅ Returns count of expired subscriptions and properties

---

### 6️⃣ `routes/addRoute.js`
**Type:** Modified

**New Routes Added:**

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| PATCH | `/properties/:id/renew` | User Token | Renew expired property (no admin approval) |
| POST | `/admin/expire-subscriptions` | Admin Token | Manually trigger subscription expiry check |

---

### 7️⃣ `server.js`
**Type:** Modified

**Changes:**
- ✅ Added import for `startSubscriptionExpireCron`
- ✅ Added `startSubscriptionExpireCron()` call after tenant cron

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FIRST TIME PROPERTY                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. User adds property                                              │
│     └─→ Property status: "pending"                                  │
│                                                                     │
│  2. User purchases subscription (with propertyId)                   │
│     └─→ Subscription status: "pending_approval"                     │
│     └─→ startDate: null, endDate: null                              │
│     └─→ Property linked: subscriptionPurchaseId                     │
│                                                                     │
│  3. Admin approves property                                         │
│     └─→ Subscription: startDate=NOW, endDate=NOW+duration           │
│     └─→ Subscription status: "active"                               │
│     └─→ Property status: "approved"                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      SUBSCRIPTION EXPIRY                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  4. Cron runs daily at midnight                                     │
│     └─→ Finds subscriptions where endDate < now                     │
│     └─→ Subscription status: "expired"                              │
│     └─→ Property status: "expired"                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       PROPERTY RENEWAL                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  5. User wants to renew expired property                            │
│     └─→ User purchases NEW subscription (with propertyId)          │
│     └─→ Subscription status: "pending_approval"                     │
│                                                                     │
│  6. User calls /properties/:id/renew                                │
│     └─→ NO ADMIN APPROVAL NEEDED                                    │
│     └─→ Subscription: startDate=NOW, endDate=NOW+duration           │
│     └─→ Subscription status: "active"                               │
│     └─→ Property status: "approved"                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

### Subscription Purchase (Updated)
```
POST /api/subscription-purchase/verify-payment
Body: {
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  subscriptionPackageId,
  propertyId,          // 🆕 REQUIRED
  isFreeMode
}
```

### Admin Approve Property
```
PATCH /property/properties/:id/approve
Headers: Admin Token
```

### User Renew Property
```
PATCH /property/properties/:id/renew
Headers: User Token
Response: {
  success: true,
  message: "Property renewed successfully",
  property: {...},
  subscription: {
    startDate: "2026-02-04T...",
    endDate: "2026-03-04T...",
    status: "active"
  }
}
```

> **Note:** Subscriptions automatically expire via cron job at midnight daily. No manual intervention needed.

---

## ⚠️ Important Notes

1. **Admin posted properties** - Direct approved hote hain, subscription ki zarurat nahi
2. **Free cities** - Agar package city ke liye free hai, property auto-approved on add
3. **Cron timing** - Daily midnight (00:00) pe run hota hai
4. **Renewal** - Renewal ke liye admin approval nahi chahiye, sirf new subscription purchase karni hai

---

## 🧪 Testing Checklist

- [ ] User property add kare → pending status
- [ ] User subscription purchase kare → pending_approval status
- [ ] Admin approve kare → subscription active, property approved, dates set
- [ ] Wait for expiry (or manual trigger) → subscription expired, property expired
- [ ] User new subscription purchase kare → pending_approval
- [ ] User renew API call kare → property approved without admin
