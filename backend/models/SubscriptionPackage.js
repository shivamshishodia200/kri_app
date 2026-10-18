import mongoose from "mongoose";

const subscriptionPackageSchema = new mongoose.Schema(
  {
    // 📦 Package Name
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    // 💰 Amount in INR
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ⏳ Duration Value
    durationValue: {
      type: Number,
      required: true,
      min: 1,
    },

    // ⏱ Duration Type
    durationType: {
      type: String,
      enum: ["Day", "Week", "Month", "Year"],
      default: "Month",
    },

    // 📝 Description
    description: {
      type: String,
      trim: true,
    },

    // 🎯 Applicable User Type
    applicableFor: {
      type: String,
      enum: ["Owner", "Tenant", "Both"],
      default: "Both",
    },

    // 🏙️ City-wise availability
    applicableCities: {
      type: [String], // ["Noida", "Delhi"]
      default: [],
      index: true,
    },

    // 🔓 FEATURES (ARRAY OF STRINGS ✅)
    features: {
      type: [String],
      default: [], 
      // example:
      // ["Max Property Listings", "Priority Support", "Featured Listing"]
    },

 // 🟢 Cities where this package is FREE
    isFreeForCities: {
      type: [String], // ["Noida"]
      default: [],
      index: true,
    },
    // ✅ Enable / Disable package
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "SubscriptionPackage",
  subscriptionPackageSchema
);
