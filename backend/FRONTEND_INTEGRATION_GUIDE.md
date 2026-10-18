# 🎯 Frontend Integration Guide - Subscription Property System

## 📅 Updated: 2026-02-04

---

## 📖 Overview

Is system mein user jab property add karta hai, tab usse subscription purchase karni padti hai. Property pending mein jaati hai, admin approve karta hai, aur subscription tab se start hoti hai. Jab subscription expire hoti hai, property bhi expire ho jaati hai.

---

## 🔄 FLOW 1: New Property Add + Subscription Purchase

### Step 1: Add Property
User property add karta hai. Property `pending` status mein create hoti hai.

**API Endpoint:**
```
POST /property/add
Content-Type: multipart/form-data
Authorization: Bearer <user_token>
```

**Request Body (form-data):**
```
state: "Uttar Pradesh"
city: "Noida"
locality: "Sector 62"
district: "Gautam Buddha Nagar"
pincode: "201301"
propertyType: "Residential"
specificType: "Flat"
bedrooms: "2"
bathrooms: "2"
areaSqFt: "1200"
price: "15000"
furnishingStatus: "Semi-Furnished"
parking: "Available"
availabilityStatus: "Ready to Move"
purpose: "Rent"
contactNumber: "9876543210"
photos: [files]
videos: [files]
```

**Response:**
```json
{
  "success": true,
  "property": {
    "_id": "property_id_here",
    "status": "pending",
    "customPropertyId": "S1-1",
    ...
  }
}
```

**⚠️ Important:** Property ID save karo - subscription purchase mein use hoga!

---

### Step 2: Get Subscription Packages
Available plans fetch karo.

**API Endpoint:**
```
GET /api/subscription?city=Noida
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "package_id_here",
      "name": "Basic Plan",
      "amount": 499,
      "durationValue": 1,
      "durationType": "Month",
      "features": ["Feature 1", "Feature 2"],
      "isFreeForCities": ["Noida"]
    }
  ]
}
```

---

### Step 3: Create Razorpay Order
Payment ke liye Razorpay order create karo.

**API Endpoint:**
```
POST /api/subscription-purchase/create-order
Content-Type: application/json
Authorization: Bearer <user_token>
```

**Request Body:**
```json
{
  "subscriptionPackageId": "package_id_here"
}
```

**Response (Paid Plan):**
```json
{
  "success": true,
  "isFree": false,
  "order": {
    "id": "order_xxxxxxxxxxxxx",
    "amount": 49900,
    "currency": "INR",
    "status": "created"
  },
  "package": {...}
}
```

**Response (Free Plan):**
```json
{
  "success": true,
  "isFree": true,
  "order": {
    "id": "FREE_ORD_1234567890_userid",
    "amount": 0,
    "currency": "INR",
    "status": "created"
  },
  "package": {...},
  "message": "This plan is free for you."
}
```

---

### Step 4: Complete Payment (Razorpay)
Agar `isFree: false` hai, toh Razorpay payment flow start karo.

```javascript
// Razorpay Options
const options = {
  key: "YOUR_RAZORPAY_KEY_ID",
  amount: order.amount,
  currency: order.currency,
  order_id: order.id,
  name: "Kirayedar",
  description: "Subscription Purchase",
  handler: function(response) {
    // Payment successful - Step 5 call karo
    verifyPayment(response);
  }
};

const razorpay = new Razorpay(options);
razorpay.open();
```

---

### Step 5: Verify Payment & Link Subscription to Property ⚠️ (UPDATED)

**API Endpoint:**
```
POST /api/subscription-purchase/verify-payment
Content-Type: application/json
Authorization: Bearer <user_token>
```

**Request Body (Paid Plan):**
```json
{
  "razorpay_order_id": "order_xxxxxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "razorpay_signature": "signature_hash_here",
  "subscriptionPackageId": "package_id_here",
  "propertyId": "property_id_from_step_1",
  "isFreeMode": false
}
```

**Request Body (Free Plan):**
```json
{
  "subscriptionPackageId": "package_id_here",
  "propertyId": "property_id_from_step_1",
  "isFreeMode": true
}
```

**Response:**
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

**⚠️ IMPORTANT CHANGE:**
- `propertyId` ab REQUIRED hai
- Subscription `pending_approval` status mein create hoti hai
- `startDate` aur `endDate` null hain - Admin approve karne par set honge

---

### Step 6: Wait for Admin Approval
Ab admin property approve karega. Jab approve hoga:
- Property status: `pending` → `approved`
- Subscription status: `pending_approval` → `active`
- Subscription dates set hongi

---

## 🔄 FLOW 2: Renew Expired Property

Jab user ki property expire ho jaati hai (subscription khatam hone par), user ise renew kar sakta hai.

### Step 1: Check if Property is Expired
User ke properties fetch karo aur `status: "expired"` wali properties dikhao.

---

### Step 2: Purchase New Subscription (Same as Flow 1 - Steps 2-5)
Expired property ke liye naya subscription purchase karo.

**verify-payment API mein expired property ka ID bhejo:**
```json
{
  "subscriptionPackageId": "package_id_here",
  "propertyId": "expired_property_id",
  "isFreeMode": false,
  "razorpay_order_id": "...",
  "razorpay_payment_id": "...",
  "razorpay_signature": "..."
}
```

---

### Step 3: Renew Property (No Admin Approval Needed!) 🆕

**API Endpoint:**
```
PATCH /property/properties/:propertyId/renew
Authorization: Bearer <user_token>
```

**Request:** No body required

**Response:**
```json
{
  "success": true,
  "message": "Property renewed successfully",
  "property": {
    "_id": "property_id",
    "status": "approved",
    ...
  },
  "subscription": {
    "startDate": "2026-02-04T16:35:00.000Z",
    "endDate": "2026-03-04T16:35:00.000Z",
    "status": "active"
  }
}
```

**⚠️ Note:** Renewal mein admin approval ki zarurat NAHI hai!

---

## 📡 API Reference - Quick Summary

### Property APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/property/add` | User | Add new property |
| PATCH | `/property/properties/:id/renew` | User | Renew expired property |

### Subscription APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/subscription` | - | Get all packages |
| GET | `/api/subscription?city=Noida` | - | Get packages for city |
| POST | `/api/subscription-purchase/create-order` | User | Create Razorpay order |
| POST | `/api/subscription-purchase/verify-payment` | User | Verify payment & create subscription |
| GET | `/api/subscription-purchase/my-active` | User | Get user's active subscription |
| GET | `/api/subscription-purchase/my-history` | User | Get subscription history |

---

## 🔴 Error Handling

### verify-payment Errors

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

### renew Errors

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

## 📊 Property Status Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    NEW PROPERTY                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User adds property ──────────────────► status: "pending"   │
│                                                             │
│  User purchases subscription ─────────► subscription:       │
│                                         "pending_approval"  │
│                                                             │
│  Admin approves ──────────────────────► status: "approved"  │
│                                         subscription:       │
│                                         "active"            │
│                                                             │
│  Subscription expires (cron) ─────────► status: "expired"   │
│                                         subscription:       │
│                                         "expired"           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    RENEWAL                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Property expired ────────────────────► status: "expired"   │
│                                                             │
│  User purchases new subscription ─────► subscription:       │
│                                         "pending_approval"  │
│                                                             │
│  User calls /renew API ───────────────► status: "approved"  │
│  (NO ADMIN NEEDED!)                     subscription:       │
│                                         "active"            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Frontend Code Example (React/JavaScript)

### New Property + Subscription Flow

```javascript
// Step 1: Add Property
const addProperty = async (formData) => {
  const response = await axios.post('/property/add', formData, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.property._id; // Save this!
};

// Step 2: Create Order
const createOrder = async (packageId) => {
  const response = await axios.post('/api/subscription-purchase/create-order', 
    { subscriptionPackageId: packageId },
    { headers: { 'Authorization': `Bearer ${token}` }}
  );
  return response.data;
};

// Step 3: Verify Payment
const verifyPayment = async (paymentData, packageId, propertyId, isFree) => {
  const body = {
    subscriptionPackageId: packageId,
    propertyId: propertyId,  // ⚠️ Required!
    isFreeMode: isFree
  };
  
  if (!isFree) {
    body.razorpay_order_id = paymentData.razorpay_order_id;
    body.razorpay_payment_id = paymentData.razorpay_payment_id;
    body.razorpay_signature = paymentData.razorpay_signature;
  }
  
  const response = await axios.post('/api/subscription-purchase/verify-payment',
    body,
    { headers: { 'Authorization': `Bearer ${token}` }}
  );
  return response.data;
};

// Complete Flow
const handleAddPropertyWithSubscription = async (propertyFormData, selectedPackageId) => {
  try {
    // 1. Add property
    const propertyId = await addProperty(propertyFormData);
    
    // 2. Create order
    const orderData = await createOrder(selectedPackageId);
    
    if (orderData.isFree) {
      // Free plan - direct verify
      await verifyPayment(null, selectedPackageId, propertyId, true);
      alert('Property added! Waiting for admin approval.');
    } else {
      // Paid plan - Razorpay flow
      const options = {
        key: RAZORPAY_KEY,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        order_id: orderData.order.id,
        handler: async (response) => {
          await verifyPayment(response, selectedPackageId, propertyId, false);
          alert('Payment successful! Property waiting for admin approval.');
        }
      };
      new Razorpay(options).open();
    }
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || 'Something went wrong');
  }
};
```

### Renewal Flow

```javascript
const renewExpiredProperty = async (propertyId, selectedPackageId) => {
  try {
    // 1. Create order for new subscription
    const orderData = await createOrder(selectedPackageId);
    
    const processRenewal = async (paymentResponse, isFree) => {
      // 2. Verify payment (with expired propertyId)
      await verifyPayment(paymentResponse, selectedPackageId, propertyId, isFree);
      
      // 3. Renew property (no admin approval needed!)
      const renewResponse = await axios.patch(
        `/property/properties/${propertyId}/renew`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      
      alert('Property renewed successfully!');
      return renewResponse.data;
    };
    
    if (orderData.isFree) {
      await processRenewal(null, true);
    } else {
      const options = {
        key: RAZORPAY_KEY,
        amount: orderData.order.amount,
        order_id: orderData.order.id,
        handler: (response) => processRenewal(response, false)
      };
      new Razorpay(options).open();
    }
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || 'Renewal failed');
  }
};
```

---

## ✅ Checklist for Frontend Developer

- [ ] Property add form mein photos/videos upload support
- [ ] Property add ke baad subscription package selection screen
- [ ] Razorpay integration for payment
- [ ] verify-payment API mein `propertyId` bhejein
- [ ] Property list mein `status` show karein (pending, approved, expired)
- [ ] Expired properties ke liye "Renew" button
- [ ] Renew flow: Purchase subscription → Call /renew API
- [ ] Subscription history page
- [ ] Active subscription display with remaining days

---

## 🆘 Support

Backend changes related queries ke liye backend team se contact karein.
