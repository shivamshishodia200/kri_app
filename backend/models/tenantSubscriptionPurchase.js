import mongoose from "mongoose";

const tenantSubscriptionPurchaseSchema = new mongoose.Schema(
  {
    // Tenant user reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Subscription package reference
    subscriptionPackageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPackage",
      required: true,
    },

    // User role
    role: {
      type: String,
      default: "Tenant",
    },

    // City
    city: {
      type: String,
      required: true,
    },

    // Payment amount
    amount: {
      type: Number,
      required: true,
      default: 0,
    },

    // Payment method
    paymentMethod: {
      type: String,
      enum: ["razorpay", "free", "admin"],
      default: "razorpay",
    },

    // Razorpay details
    paymentId: String,
    orderId: String,
    razorpaySignature: String,

    // Subscription dates
    // startDate: {
    //   type: Date,
    //   default: Date.now,
    // },

    // endDate: {
    //   type: Date,
    //   required: true,
    // },
    
      // Subscription dates
    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },


    // Subscription status
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "pending",
      index: true,
    },

    // Plan snapshot
    planSnapshot: {
      name: String,
      description: String,
      features: [String],
      durationValue: Number,
      durationType: String,
    },

    // Cancellation info
    cancelledAt: Date,
    cancellationReason: String,
    cancelledBy: String,

    // Admin notes
    adminNotes: String,
  },
  { timestamps: true }
);

// Indexes
tenantSubscriptionPurchaseSchema.index({ userId: 1, status: 1 });
tenantSubscriptionPurchaseSchema.index({ endDate: 1 });

export default mongoose.model("TenantSubscriptionPurchase", tenantSubscriptionPurchaseSchema);
