import mongoose from "mongoose";

const subscriptionPurchaseSchema = new mongoose.Schema(
  {
    // 👤 User who purchased the subscription
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🏠 Property linked to this subscription
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },

    // 📦 Purchased Subscription Package (Plan)
    subscriptionPackageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPackage",
      required: true,
    },

    // 👥 Role at time of purchase
    role: {
      type: String,
      enum: ["Owner", "Tenant"],
      required: true,
    },

    // 🏙️ City at time of purchase
    city: {
      type: String,
      required: true,
    },

    // 💰 Amount paid (snapshot)
    amount: {
      type: Number,
      required: true,
    },

    // 💳 Payment details
    paymentMethod: {
      type: String,
      enum: ["razorpay", "upi", "cash", "free"],
      default: "razorpay",
    },

    paymentId: {
      type: String,
      default: null,
    },

    orderId: {
      type: String,
      default: null,
    },

    // ⏳ Subscription period (set when admin approves)
    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    // 🔄 Subscription status
    // pending_approval: Payment done, waiting for admin to approve property
    // active: Admin approved, subscription running
    // expired: Subscription ended
    // cancelled: Cancelled by admin/user
    status: {
      type: String,
      enum: ["pending_approval", "active", "expired", "cancelled"],
      default: "pending_approval",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "subscriptionPurchase",
  subscriptionPurchaseSchema
);
