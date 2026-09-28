# Kirayedar24 — Comprehensive Technical, QA & Security Audit Report

**Audit Date:** September 28, 2026  
**Auditor:** Senior React Native, Backend, Payment & QA Engineer  
**Repository:** `shivamshishodia200/kri_app` (`/Users/rajjeet/Documents/Craft-media-Apps/kir24`)  
**Application:** Kirayedar24 (React Native CLI 0.74.5 / Android & iOS)

---

## 1. Project Identification & Technical Environment

| Component | Identified Technology & Stack | Repository Location | Notes / Base URL |
| :--- | :--- | :--- | :--- |
| **1. Mobile App** | React Native CLI 0.74.5, React 18.2.0, TypeScript 5.4.5, React Navigation 6 | `/Users/rajjeet/Documents/Craft-media-Apps/kir24` | Android tested on `Pixel_9a` (API 35/17), iOS folder present |
| **2. Backend / API** | **Simulated / In-Memory Only** (`AuthBackendService`) | `src/services/authBackendService.ts` | **No external REST/GraphQL server** exists in repository. Runs inside React Native JS thread |
| **3. Database** | **In-Memory JavaScript Maps / Arrays** (`users`, `properties`, `bookings`) | `src/mock/propertiesData.ts`, `src/context/*` | **No PostgreSQL, MongoDB, Prisma, or TypeORM** migrations exist |
| **4. Admin Panel** | **MISSING** | N/A | No web dashboard, admin routes, or moderation panels found |
| **5. Payment Gateway**| **MISSING** | N/A | **No Razorpay SDK** (`react-native-razorpay`) or webhook verification endpoints found |

---

## 2. Executive Summary

A comprehensive, code-level and test-backed audit was performed across the Kirayedar24 repository against all client specifications.

### High-Level Architectural State:
- **Standalone Frontend Client:** The repository contains a well-structured React Native UI application with polished design tokens, SVG icons, and mock state management.
- **Missing Infrastructure:** There is currently **no standalone backend server**, **no persistent database**, and **no admin moderation panel**.
- **Critical Security & Monetization Hole (Unprotected Landlord Contacts):** Landlord contact phone numbers are packaged in plaintext within the client application code and passed directly to the `PropertyDetailScreen`. Any tenant can view/dial the landlord without paying or triggering any contact-unlock paywall.
- **Mock Payment Toggles:** Subscription and package upgrades operate via simulated local callbacks with zero server-side order creation or signature verification.
- **Navigation Layout Mismatch:** The client sketch specifies bottom tabs as `[Home, Search, Saved, Profile]`, whereas the app currently implements `[Home, Shortlisted, Chat, Profile]`.

```
========================================================================================
AUDIT STATUS SUMMARY:
• WORKING (End-to-End Verified):        8 items
• PARTIAL (Frontend UI Only / Mocked): 12 items
• BROKEN / CRITICAL (Security/Logic):   4 items
• MISSING (Not implemented):           14 items
• NEEDS CLIENT DECISION:                4 items
========================================================================================
```

---

## 3. Requirement Traceability Matrix

| Requirement | App UI | API / DB | Admin Panel | Test Evidence | Status | File Paths |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A1. Sign in with mobile number** | Implemented (`LoginScreen.tsx`) | Simulated in `authBackendService.ts` | N/A | Tested via automated unit tests & live emulator | **PARTIAL** (Simulated backend) | [`LoginScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/auth/LoginScreen.tsx), [`authBackendService.ts`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/services/authBackendService.ts) |
| **A2. Register as Owner or Tenant** | Implemented role selector | Simulated in `authBackendService.ts` | N/A | Verified via unit test & UI execution | **PARTIAL** | [`SignupScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/auth/SignupScreen.tsx) |
| **A3. Collect Name, Mobile, WhatsApp, Address** | Collects Name, Email, Mobile, Password; **WhatsApp & Address missing** | Schema missing WhatsApp & Address | N/A | Code inspection of `SignupScreen.tsx` & `types/user.ts` | **PARTIAL / MISMATCH** | [`SignupScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/auth/SignupScreen.tsx), [`user.ts`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/types/user.ts) |
| **A4. OTP verification & Account Activation** | Implemented 6-digit screen | 10-min TTL in-memory pending map | N/A | 12/12 unit tests passed (`npm run test:consent`) | **PARTIAL** (In-memory) | [`OtpVerificationScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/auth/OtpVerificationScreen.tsx), [`test_consent_flow.ts`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/tests/test_consent_flow.ts) |
| **A5. Terms & Privacy Legal Consent** | Mandatory unchecked checkbox + full policy screens | Version match in a client-side in-memory simulation; no remote or durable record | N/A | Consent gate and simulated version checks | **PARTIAL** (No production backend storage) | [`TermsAndConditionsScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/auth/TermsAndConditionsScreen.tsx), [`legalPolicies.ts`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/data/legalPolicies.ts) |
| **A6. Role-Based Routing & Permissions** | Switches Home & Profile views | No server-side auth middleware | N/A | Tested on Android Emulator | **PARTIAL** | [`AppNavigator.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/navigation/AppNavigator.tsx), [`MainTabNavigator.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/navigation/MainTabNavigator.tsx) |
| **B1. Home shows Recent & Featured properties** | Implemented with Carousels & horizontal lists | Static mock `INITIAL_PROPERTIES` | N/A | Verified visually on emulator | **PARTIAL** | [`BuyerHomeScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/buyer/BuyerHomeScreen.tsx) |
| **B2. Bottom Navigation Tabs** | Home, Shortlisted, Chat, Profile | N/A | N/A | Visual inspection | **MISMATCH** (Client requested Home, Search, Saved, Profile) | [`MainTabNavigator.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/navigation/MainTabNavigator.tsx) |
| **B3. Cascading State → City → Area** | City selector exists; **No State or Area cascade** | Only `location.city` and `location.locality` | N/A | Code inspection | **BROKEN / INCOMPLETE** | [`PropertyContext.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/context/PropertyContext.tsx) |
| **B4. Residential & Commercial Subtypes** | Subtype chips in filter | Client-side filter | N/A | Tested in `FilterModal.tsx` | **PARTIAL** (Missing Room, PG, Commercial Space) | [`FilterModal.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/components/property/FilterModal.tsx) |
| **B5. Saved / Shortlisted Properties** | Implemented heart toggle | In-memory `shortlistedIds` (lost on app reload) | N/A | Tested on Android | **PARTIAL** (No AsyncStorage / Server sync) | [`ShortlistedScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/buyer/ShortlistedScreen.tsx) |
| **C1. Protected Owner Contact Data** | Exposed directly in `property.owner.phone` | Full phone returned in all property payloads | N/A | Verified in `PropertyDetailScreen.tsx` | **BROKEN / SECURITY LEAK** | [`PropertyDetailScreen.tsx#L71-86`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/buyer/PropertyDetailScreen.tsx#L71-86) |
| **C2. Tenant Contact Unlock Paywall** | No unlock modal / paywall triggered | No unlock transaction endpoint | N/A | Code inspection | **MISSING** | [`PropertyDetailScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/buyer/PropertyDetailScreen.tsx) |
| **C3. Razorpay Server-side Verification** | No Razorpay integration | No Razorpay order or webhook APIs | N/A | Grep search confirmed 0 references | **MISSING** | Entire codebase |
| **D1. Owner Property Form Fields** | 5-step form (Specs, Location, Price, Photos) | In-memory `addProperty` | N/A | Tested on Android | **PARTIAL** (See field mismatch section) | [`AddEditPropertyScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/owner/AddEditPropertyScreen.tsx) |
| **D2. Property Media Upload & Ordering** | Pick sample photos only | Hardcoded image URLs | N/A | Code inspection | **PARTIAL / MOCK ONLY** | [`AddEditPropertyScreen.tsx#L38-43`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/owner/AddEditPropertyScreen.tsx#L38-43) |
| **E1. Owner My Properties & Statuses** | Filter tabs for Active, Under Review, Draft | In-memory array | N/A | Tested on Android | **PARTIAL** (Missing Rejected, Expired, Pending Payment) | [`MyPropertiesScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/owner/MyPropertiesScreen.tsx) |
| **E2. Ownership Enforcement & Editing** | Direct status switch dropdown | No server check | N/A | Code inspection | **BROKEN** (Client can mark own listing published) | [`MyPropertiesScreen.tsx#L49-53`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/owner/MyPropertiesScreen.tsx#L49-53) |
| **F1. Owner Listing Packages & Razorpay** | Package UI in `SubscriptionScreen.tsx` | No order creation or signature check | N/A | Code inspection | **PARTIAL (UI) / MISSING (Gateway)** | [`SubscriptionScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/services/SubscriptionScreen.tsx) |
| **G1. Admin Panel & Moderation** | None | None | None | Grep search confirmed 0 admin files | **MISSING** | N/A |
| **H1. In-App Notifications** | Notification list & badge | In-memory array | None | Tested on Android | **PARTIAL** | [`NotificationListScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/communication/NotificationListScreen.tsx) |
| **H2. Push Notifications (FCM / APNs)** | None | None | None | No Firebase messaging packages installed | **MISSING** | [`package.json`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/package.json) |

### Consent Storage Dependency

`AuthBackendService` is a client-side in-memory simulation. Its `acceptedAt` value is neither an authoritative server timestamp nor durable storage. Production signup therefore needs a backend contract such as `POST /v1/auth/signup/initiate` with this payload:

```json
{
   "name": "User Name",
   "email": "user@example.com",
   "phone": "9876543210",
   "password": "...",
   "role": "buyer",
   "consent": {
      "termsAccepted": true,
      "termsVersion": "2.4.0",
      "privacyAccepted": true,
      "privacyVersion": "2.4.0",
      "marketingOptIn": false
   }
}
```

The backend must validate the active policy versions, record a server/database-generated acceptance timestamp against the pending registration, and transfer that same record to the account only after OTP verification. OTP resend must retain it. The client must not send an acceptance timestamp or treat local storage as the legal record. No such remote endpoint or durable database exists in this repository yet.

---

## 4. End-to-End Flow Audit Details

### Flow 1: Tenant Registration → Search → Property Details → Contact Unlock
1. **Registration:** Tenant registers with name, email, phone, password and accepts terms. (*Passes client validation*).
2. **Search:** Tenant searches by keyword, BHK, budget, and furnishing. (*Works in-memory*). State → City → Area cascading is missing.
3. **Property Details:** Clicking a card opens [`PropertyDetailScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/buyer/PropertyDetailScreen.tsx) with high-resolution photo carousel, pricing, specs, and landlord card.
4. **Contact Unlock Paywall:** **FAILURE**. Tapping "Call Owner" directly initiates phone dialer without requiring payment or checking if contact unlock package was purchased.

### Flow 2: Owner Registration → Add Property → Package → Admin Approval → Publish
1. **Registration:** Owner registers and gets routed to [`OwnerHomeScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/owner/OwnerHomeScreen.tsx).
2. **Add Property:** 5-step form allows entering title, description, address, price, bedrooms, bathrooms, and selecting stock photos.
3. **Package Payment:** Owner can open [`SubscriptionScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/services/SubscriptionScreen.tsx), but clicking "Choose Plan" instantly activates the subscription locally without Razorpay checkout.
4. **Admin Approval:** Owner can manually change property status from "Under Review" to "Active / Published" directly from [`MyPropertiesScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/owner/MyPropertiesScreen.tsx).

### Flow 3: Owner Edit / Delete / Expiry
1. **Edit/Delete:** Works within local memory session.
2. **Expiry:** No expiry calculation exists (neither client timer nor backend cron).

---

## 5. Critical Bugs & Security Vulnerabilities

### 🔴 Bug 1 (Critical Severity): Direct Landlord PII / Contact Number Exposure
 **Files:** [`src/mock/propertiesData.ts`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/mock/propertiesData.ts), [`src/services/propertyService.ts`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/services/propertyService.ts), [`src/screens/buyer/PropertyDetailScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/buyer/PropertyDetailScreen.tsx)
 **Current Client Mitigation:** Fixture phone values are removed from the app bundle, property reads redact phone/WhatsApp/email, and Home, Details, ChatList and ChatDetail fail closed unless the entitlement service approves access.
 **Remaining Root Cause:** There is no property API or server-side unlock verification. This client mitigation is not a substitute for backend PII filtering and authorization.
 **Fix Required:** Backend must strip/mask `owner.phone`, `owner.whatsapp`, and `owner.email` in public property endpoints unless the requesting tenant has an active, verified unlock record in the database.
  2. Tap on any property card from Home or Search.
  3. Notice the landlord's direct phone number is present in `property.owner.phone` and clicking "Call Owner" connects directly.

### Home, Listing and Contact Access Dependency

Both home screens currently use bundled sample data through the mock `propertyService`; `getUserProperties` is a client-side fixture adapter, not a live property API. The Owner home now labels these rows as demo data and only treats a listing as published when its record identifies `approvalSource: "backend"`. A production integration must supply `GET /v1/owners/{ownerId}/properties` with server-authoritative listing status and subscription expiry.

Buyer contact unlock and Owner listing subscriptions are separate products. Contact unlock currently opens a ₹49 pending-payment notice; there is no verified contact-unlock entitlement endpoint or payment callback. The mock `checkContactEntitlement` therefore denies all access. Production needs `POST /v1/properties/{propertyId}/contact-entitlement` (or an equivalent authenticated lookup), returning contact fields only after server-side payment/entitlement validation. Call, WhatsApp and property-linked chat must use that response; a local `userHasPackage` flag is not authorization. Owner listing plans remain separate and need server-issued `expiresAt`, listing limits and payment verification. No payment success or live owner-property loading is claimed by this client build.

Saved-property changes currently use an optimistic mock adapter and roll back on request failure; production still needs authenticated persistent favorite endpoints. Utility bill and rent payment screens also remain payment-gateway demos.
- **Root Cause:** The property response payload is unmasked and no server-side unlock verification exists.
- **Fix Required:** Backend must strip/mask `owner.phone`, `owner.whatsapp`, and `owner.email` in public property endpoints unless the requesting tenant has an active, verified unlock record in the database.

### 🔴 Bug 2 (Critical Severity): Client-Side Admin Bypass & Direct Status Mutation
- **File:** [`src/screens/owner/MyPropertiesScreen.tsx#L49-53`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/owner/MyPropertiesScreen.tsx#L49-53)
- **Reproduction Steps:**
  1. Log in as an Owner and create a property.
  2. The property starts as `under_review`.
  3. The owner can tap the status pill to change it to `published` immediately.
- **Root Cause:** Property mutations occur entirely in client-side React state with no server authorization.

### 🔴 Bug 3 (High Severity): Missing Razorpay Gateway & Webhook Idempotency
- **File:** [`src/screens/services/SubscriptionScreen.tsx`](file:///Users/rajjeet/Documents/Craft-media-Apps/kir24/src/screens/services/SubscriptionScreen.tsx)
- **Reproduction Steps:**
  1. Open Subscription Screen as an owner.
  2. Select any premium plan.
  3. The plan is activated instantly via local state without Razorpay checkout.
- **Root Cause:** Razorpay SDK and server-side payment verification pipeline are completely missing.

---

## 6. UI vs Backend Field Mismatch Table

| Field Category | Client Requirement Specification | Current UI Implementation | Current Model (`types/property.ts`) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Registration** | WhatsApp Number, Full Address | Name, Email, Phone, Password | `User` interface | **Missing in Form & Schema** |
| **Location** | State → City → Area cascade | City, Locality, Address, Pincode | `location: { city, locality, address, pincode }` | **State is missing** |
| **Subtypes** | Home, Room, Flat, PG, Office, Shop, Space | Apartment, Villa, House, Studio, Office, Shop | `PropertyType` union | **Missing Room, PG, Flat, Space** |
| **Kitchen Type** | Simple / Modular | None | Not present | **Missing** |
| **Tenant Preferences** | Family, Students, Girls, Boys, Servants | None | Not present | **Missing** |
| **Food Preference** | Veg / Any | None | Not present | **Missing** |
| **Contact Channels** | WhatsApp, Phone, Email toggles | None | Not present | **Missing** |
| **Rent Details** | Negotiable (Yes/No), Inclusive utilities | Fixed price, deposit | `price`, `maintenancePrice`, `securityDeposit` | **Missing utility & negotiable flags** |
| **Available Date** | Available-from Date Picker | None | Not present | **Missing** |

---

## 7. Client Decisions Needed (Ambiguities)

1. **Tenant Contact Unlock Scope:**
   - *Option A:* One-time payment unlocks contact for **ONE specific property** permanently for that tenant.
   - *Option B:* One-time package unlocks **N property contacts** (e.g., 5 contacts pack).
   - *Option C:* Time-based subscription (e.g., ₹499 for 30 days unlimited contact viewing).
2. **Owner Listing Sequence:**
   - *Sequence 1:* Create Listing → Pay Package Fee via Razorpay → Admin Review → Published.
   - *Sequence 2:* Create Listing → Admin Review & Approval → Pay Package Fee → Published.
3. **Bottom Navigation Tab Bar Selection:**
   - *Client Sketch:* `[Home, Search, Saved, Profile]`
   - *Current Code:* `[Home, Shortlisted, Chat, Profile]` (Search accessed via top bar, Chat in tabs).
4. **Commercial Subtypes Classification:**
   - Clarify whether "Space" refers to Bare-shell Office, Coworking desk, or Industrial Land.

---

## 8. Prioritized Implementation Roadmap

1. **Phase 1: Secure Backend API & Database Setup**
   - Node.js/Express + PostgreSQL with Prisma ORM.
   - Auth with OTP SMS gateway, RBAC middleware, and token management.
2. **Phase 2: Contact Masking & Paywall Integration**
   - Public property endpoints return masked contact data.
   - Contact unlock payment flow with Razorpay server-side signature verification.
3. **Phase 3: Owner Listing Workflow & Razorpay Packages**
   - Server-calculated package expiry and listing lifecycle (`draft` → `pending_payment` → `under_review` → `published`).
4. **Phase 4: Admin Moderation Web Portal**
   - Next.js / React web portal for property approval, user management, and package price configuration.
5. **Phase 5: Mobile App UI Field & Navigation Alignment**
   - State-City-Area cascading picker, missing property fields, and bottom navigation sync.
6. **Phase 6: Real Push Notifications (FCM / APNs)**
   - Event-driven push notifications for listing approvals, inquiries, and payment confirmations.

---

## 9. Verification & Test Evidence

```bash
# 1. TypeScript Static Typecheck
$ npm run typecheck
> tsc --noEmit
Result: PASSED (0 errors)

# 2. Automated Consent & Auth Flow Unit Tests
$ npm run test:consent
Result: 12 PASSED, 0 FAILED
- Policy Service & Version Check: PASSED
- Signup Validation & Outdated Policy Rejection: PASSED
- Valid Signup & Pending Registration: PASSED
- OTP Resend Flow & Version Preservation: PASSED
- OTP Verification & Account Activation: PASSED
- Existing User Login: PASSED

# 3. Android Emulator Build & Execution
$ ./android/gradlew -p android installDebug
Result: BUILD SUCCESSFUL (Installed on Pixel_9a AVD)
App UI verified live on Android emulator.
```
