import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    isPostedByAdmin: { type: Boolean, default: false },
    customPropertyId: { type: String, unique: true, required: true },

    address: {
      state: { type: String, required: true },
      city: { type: String, required: true },
      locality: { type: String, required: true },
      district: { type: String },
      pincode: { type: String, required: false, match: /^[0-9]{6}$/ },
    },

    propertyLocation: { type: String }, // Google formatted address

    geoLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    propertyType: { type: String, enum: ["Residential", "Commercial"], required: true },
    specificType: {
      type: String,
      //   enum: ["Apartment", "Villa", "Plot", "Single", "Duplex", "Room", "Flat", "PG", "Office", "Shop", "Warehouse"], 
      enum: ["Apartment", "Villa", "Plot", "Singlex", "Duplex", "Room", "Flat", "PG", "Office", "Shop", "Warehouse"],
      required: true
    },
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    balconies: { type: Boolean, default: false },
    floorNumber: { type: Number },
    totalFloors: { type: Number },
    groundFloor: {
    type: Boolean,
    default: false
    },

    basement: {
    type: Boolean,
    default: false
    },
    areaSqFt: { type: Number, required: true },
    price: { type: Number, required: true },
    furnishingStatus: { type: String, enum: ["Furnished", "Semi-Furnished", "Unfurnished"], required: true },
    parking: { type: String, enum: ["Available", "Not Available"], required: true },
    kitchenType: { type: String, enum: ["Modular", "Simple"] },
    facingDirection: { type: String, enum: ["North", "South", "East", "West"] },
    availabilityStatus: { type: String, enum: ["Ready to Move", "Under Construction"], required: true },
    purpose: { type: String, enum: ["Sell", "Rent", "Paying Guest"], required: true },
    availableFor: { type: String, enum: ["Boys", "Girls", "Family", "Students", "Bachelor", "Any"] },
    description: { type: String },

    photos: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    contactNumber: { type: String, required: true },
    contactPreferences: {
      phone: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
      chat: { type: Boolean, default: false },
    },

    visitCount: { type: Number, default: 0 },
    visitedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        visitedAt: { type: Date, default: Date.now }
      }
    ],
    status: { type: String, enum: ["pending", "approved", "rejected", "expired"], default: "pending" },
    isSold: { type: Boolean, default: false },
    rejectionReason: { type: String },

    // 🔗 Linked Subscription Purchase
    subscriptionPurchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subscriptionPurchase",
      default: null
    }
  },
  { timestamps: true }
);

propertySchema.index({ geoLocation: "2dsphere" });
propertySchema.index({ propertyLocation: "text" });

const Property = mongoose.model("Property", propertySchema);
export default Property;