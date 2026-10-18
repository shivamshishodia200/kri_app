// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   fullName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phone: { type: String, required: true, unique: true },
//   state: String,
//   city: String,
//   street: String,
//   pinCode: String,
//   password: { type: String, required: true },
//   isEmailVerified: { type: Boolean, default: false },
//   isPhoneVerified: { type: Boolean, default: false },

// }, { timestamps: true });

// export default mongoose.model("User", userSchema);

// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   fullName: { type: String, required: true },

//   email: { 
//     type: String, 
//     required: true, 
//     unique: true 
//   },

//   phone: { 
//     type: String, 
//     required: true, 
//     unique: true 
//   },

//   state: String,
//   city: String,
//   street: String,
//   pinCode: String,

//   password: { 
//     type: String, 
//     required: true 
//   },

//   isEmailVerified: { 
//     type: Boolean, 
//     default: false 
//   },

//   isPhoneVerified: { 
//     type: Boolean, 
//     default: false 
//   },

//   // 🟩 Role added
//   role: {
//     type: String,
//     enum: ["Owner", "Tenant"],
//     default: "Tenant" // default can be changed as needed
//   }

// }, { timestamps: true });

// export default mongoose.model("User", userSchema);




import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },

  state: String,
  city: String,
  street: String,
  pinCode: String,

  // 📍 GeoJSON Point format for Google Maps
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [Longitude, Latitude]
      default: [0, 0]
    }
  },

  // 🔔 FCM TOKEN (single device support)
  fcmToken: {
    type: String,
    default: "",
  },

  password: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },

  role: {
    type: String,
    enum: ["Owner", "Tenant"],
    default: "Tenant"
  }
}, { timestamps: true });

// 🌏 Yeh index zaroori hai "Near Me" feature ke liye
userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);