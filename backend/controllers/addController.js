import Property from "../models/addProps.js";
import NodeGeocoder from "node-geocoder";
import User from "../models/user.js";
import Admin from "../models/adminAuthSchema.js";
import axios from "axios"; // We'll use axios to call geocoding API
import { sendPushNotification } from "../utils/sendNotification.js";
import dotenv from "dotenv";
import Counter from "../models/counter.js";
import SubscriptionPurchase from "../models/subscriptionPurchase.js";
import SubscriptionPackage from "../models/SubscriptionPackage.js";
dotenv.config();


// Configure geocoder (OpenStreetMap is free)
const geocoder = NodeGeocoder({
  provider: "openstreetmap",
});




export const addProperty = async (req, res) => {
  try {
    let userId = null,
      adminId = null,
      entity,
      isPostedByAdmin = false;

    const requesterId = req.user.id || req.user._id;

    // 1️⃣ Identify Admin or User
    const adminEntity = await Admin.findById(requesterId);

    if (adminEntity) {
      entity = adminEntity;
      adminId = entity._id;
      isPostedByAdmin = true;
    } else {
      const userEntity = await User.findById(requesterId);
      if (!userEntity) {
        return res
          .status(404)
          .json({ success: false, message: "User/Admin not found" });
      }
      entity = userEntity;
      userId = entity._id;
      isPostedByAdmin = false;
    }

    const { state, city, locality, district, pincode } = req.body;

    // 2️⃣ Auto-approval logic
    let propertyStatus = isPostedByAdmin ? "approved" : "pending";

    if (!isPostedByAdmin) {
      const cityPackage = await SubscriptionPackage.findOne({
        isActive: true,
        $or: [
          { applicableCities: { $size: 0 } },
          { applicableCities: city },
        ],
      }).sort({ amount: 1 });

      if (
        cityPackage &&
        (cityPackage.isFreeForCities?.includes(city) ||
          cityPackage.amount === 0)
      ) {
        propertyStatus = "approved";
      }
    }

    // 3️⃣ Custom Property ID generation (FIXED HERE)
    let customPropertyId;

    if (isPostedByAdmin) {
      // ✅ ADMIN — SAFE COUNTER BASED ID
      const adminCounter = await Counter.findByIdAndUpdate(
        { _id: `admin_${adminId}` },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      customPropertyId = `A-${adminId.toString().slice(-4)}-${adminCounter.seq}`;
    } else {
      // ✅ USER — EXISTING LOGIC (UNCHANGED)
      let serialId;

      if (!entity.serialId) {
        const counter = await Counter.findByIdAndUpdate(
          { _id: "userSerialId" },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );

        serialId = counter.seq;
        await User.findByIdAndUpdate(userId, { serialId });
        entity.serialId = serialId;
      } else {
        serialId = entity.serialId;
      }

      const listingCount = (entity.myListingsCount || 0) + 1;
      customPropertyId = `S${serialId}-${listingCount}`;
    }

    // 4️⃣ File handling
    const photos = req.files?.photos?.map((f) => f.path) || [];
    const videos = req.files?.videos?.map((f) => f.path) || [];

    // 5️⃣ Create property
    const propertyData = {
      ...req.body,
      userId,
      adminId,
      isPostedByAdmin,
      customPropertyId,
      status: propertyStatus,
      address: { state, city, locality, district, pincode },
      geoLocation: { type: "Point", coordinates: [0, 0] },
      photos,
      videos,
    };

    const property = await Property.create(propertyData);

    if (!isPostedByAdmin) {
      await User.findByIdAndUpdate(userId, {
        $inc: { myListingsCount: 1 },
      });
    }

    return res.status(201).json({
      success: true,
      property,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// controllers/propertyController.js
//  Track property visits

export const visitProperty = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    //  Check if user has already visited this property
    const alreadyVisited = property.visitedBy.some(
      (visit) => visit.userId.toString() === userId
    );

    //  Only push + increment enquiriesCount if first time visit
    if (userId && !alreadyVisited) {
      property.visitedBy.push({ userId });
      await User.findByIdAndUpdate(userId, { $inc: { enquiriesCount: 1 } });
    }

    //  Always increment property visitCount
    property.visitCount += 1;

    await property.save();

    res.status(200).json({
      message: "Property visit recorded successfully",
      visitCount: property.visitCount,
    });
  } catch (error) {
    console.error("Error recording property visit:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Get nearby properties
// export const getNearbyProperties = async (req, res) => {
//   try {
//     const { lng, lat } = req.query;

//     if (!lng || !lat) {
//       return res.status(400).json({ message: "lng and lat are required" });
//     }

//     const distance =  20000;

//     const properties = await Property.find({
//       geoLocation: {
//         $near: {
//           $geometry: {
//             type: "Point",
//             coordinates: [parseFloat(lng), parseFloat(lat)],
//           },
//           $maxDistance: distance, // meters
//         },
//       },
//     });

//     res.status(200).json(properties);
//   } catch (error) {
//     console.error("Nearby Properties Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const getNearbyProperties = async (req, res) => {
//   try {
//     const userId = req.user?.id; // From auth middleware
//     const { lat, lng, distance } = req.query; // distance now comes from frontend

//     //  Validate user
//     if (!userId) {
//       return res.status(401).json({ success: false, message: "Unauthorized: userId missing" });
//     }

//     //  Validate coordinates
//     if (!lat || !lng) {
//       return res.status(400).json({
//         success: false,
//         message: "Latitude and Longitude are required",
//       });
//     }

//     const latitude = parseFloat(lat);
//     const longitude = parseFloat(lng);

//     //  Dynamic distance (convert km to meters if provided)
//     // Example: if frontend sends distance=10 => means 10 km => 10000 meters
//     const distanceInMeters = distance ? parseFloat(distance) * 1000 : 20000; // Default 20km

//     //  Find properties near user's live location
//     const nearbyProperties = await Property.find({
//       geoLocation: {
//         $near: {
//           $geometry: {
//             type: "Point",
//             coordinates: [longitude, latitude],
//           },
//           $maxDistance: distanceInMeters,
//         },
//       },
//       userId: { $ne: userId }, // Exclude current user's own listings
//     });

//     //  Response
//     return res.status(200).json({
//       success: true,
//       count: nearbyProperties.length,
//       distanceUsed: distanceInMeters / 1000 + " km",
//       message: "Nearby properties fetched successfully",
//       data: nearbyProperties,
//     });
//   } catch (error) {
//     console.error("Nearby Properties Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while fetching nearby properties",
//       error: error.message,
//     });
//   }
// };



export const getNearbyProperties = async (req, res) => {
  try {
    const userId = req.user?.id; // From auth middleware
    const { lat, lng, distance, location } = req.query;

    //  Validate user
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: userId missing" });
    }

    //  Step 1: Initialize latitude & longitude
    let latitude, longitude, placeName;

    //  CASE 1: Frontend directly provides coordinates
    if (lat && lng) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lng);

      // Reverse geocode to get readable place name
      const reverseRes = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
        params: {
          q: `${latitude},${longitude}`,
          key: process.env.OPENCAGE_KEY,
          limit: 1,
        },
      });

      placeName = reverseRes.data.results[0]?.formatted || "Unknown location";
    }

    // ✅ CASE 2: Frontend sends location name (manual search)
    else if (location) {
      const geoRes = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
        params: {
          q: location,
          key: process.env.OPENCAGE_KEY,
          limit: 1,
          countrycode: "in",
        },
      });

      if (geoRes.data.results && geoRes.data.results.length > 0) {
        latitude = geoRes.data.results[0].geometry.lat;
        longitude = geoRes.data.results[0].geometry.lng;
        placeName = geoRes.data.results[0].formatted;
      } else {
        return res.status(404).json({ success: false, message: "Location not found" });
      }
    }

    // ✅ CASE 3: Use logged-in user's saved address + pinCode
    else {
      const userProfile = await User.findById(userId).select("street city state pinCode");
      if (!userProfile) return res.status(404).json({ success: false, message: "User profile not found" });

      const fullAddress = `${userProfile.street || ""}, ${userProfile.city || ""}, ${userProfile.pinCode || ""}`.trim();

      console.log("📍 Full user address for geocoding:", fullAddress);

      const geoRes = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
        params: {
          q: fullAddress,
          key: process.env.OPENCAGE_KEY,
          limit: 1,
          countrycode: "in",
        },
      });

      if (geoRes.data.results && geoRes.data.results.length > 0) {
        latitude = geoRes.data.results[0].geometry.lat;
        longitude = geoRes.data.results[0].geometry.lng;
        placeName = geoRes.data.results[0].formatted;
      } else {
        console.warn("⚠️ Could not geocode user's address, using default Delhi coordinates");
        latitude = 28.6139;
        longitude = 77.2090;
        placeName = "Default Location (Delhi)";
      }
    }

    // 🧮 Step 2: Convert km to meters (default 20 km)
    const distanceInMeters = distance ? parseFloat(distance) * 1000 : 20000;


    // 🏘️ Step 3: Find nearby properties (exclude self)
    const nearbyProperties = await Property.find({
      geoLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: distanceInMeters,
        },
      },
      userId: { $ne: userId },
    });

    const user = await User.findById(userId).select("street city state pinCode");
    const fullAddress = `${user.street || ""}, ${user.city || ""}, ${user.state || ""}, ${user.pinCode || ""}`.trim();


    // 🧾 Step 4: Return response
    return res.status(200).json({
      success: true,
      count: nearbyProperties.length,
      distanceUsed: distanceInMeters / 1000 + " km",
      usedLocation: {
        latitude,
        longitude,

      },
      userAddressUsed: fullAddress || "derived from user profile",
      message: "Nearby properties fetched successfully",
      data: nearbyProperties,
    });
  } catch (error) {
    console.error("❌ Nearby Properties Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching nearby properties",
      error: error.message,
    });
  }
};


// DELETE property by ID
// export const deleteProperty = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const property = await Property.findByIdAndDelete(id);

//     if (!property) {
//       return res.status(404).json({ message: "Property not found" });
//     }

//     //  Decrement user's myListingsCount
//     await User.findByIdAndUpdate(property.userId, { $inc: { myListingsCount: -1 } });

//     res.status(200).json({ message: "Property deleted successfully" });
//   } catch (error) {
//     console.error("Delete Property Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // ✅ Only decrement count if property belongs to a USER
    if (property.userId) {
      await User.findByIdAndUpdate(property.userId, {
        $inc: { myListingsCount: -1 },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Delete Property Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


export const userUpdateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const property = await Property.findOne({
      _id: id,
      userId,
      isPostedByAdmin: false
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or not authorized"
      });
    }

    // 📷 Files update
    if (req.files?.photos) {
      req.body.photos = req.files.photos.map(f => f.path);
    }
    if (req.files?.videos) {
      req.body.videos = req.files.videos.map(f => f.path);
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property: updatedProperty
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




export const userDeleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const property = await Property.findOne({
      _id: id,
      userId,
      isPostedByAdmin: false
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or not authorized"
      });
    }

    await Property.findByIdAndDelete(id);

    // ⬇️ Decrease listing count
    await User.findByIdAndUpdate(userId, {
      $inc: { myListingsCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: "Property deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE property by ID
// UPDATE property by ID (only specific fields)




// export const updateProperty = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const allowedFields = [
//       "state", "city", "locality", "district", "pincode", "propertyType", "specificType", 
//       "bedrooms", "bathrooms", "balconies", "floorNumber", "totalFloors", 
//       "areaSqFt", "price", "furnishingStatus", "parking", "kitchenType", 
//       "facingDirection", "availabilityStatus", "purpose", "availableFor", 
//       "description", "contactNumber", "contactPreferences", "availableFrom",
//     ];

//     const updatedData = {};

//     // 1. Loop through fields and format numbers
//     for (const key of allowedFields) {
//       if (req.body[key] !== undefined) {
//         if (["bedrooms", "bathrooms", "balconies", "floorNumber", "totalFloors", "areaSqFt", "price"].includes(key)) {
//           updatedData[key] = Number(req.body[key]);
//         } else {
//           updatedData[key] = req.body[key];
//         }
//       }
//     }

//     // 2. 📸 Media update
//     if (req.files?.photos) {
//       updatedData.photos = req.files.photos.map((f) => f.path);
//     }
//     if (req.files?.videos) {
//       updatedData.videos = req.files.videos.map((f) => f.path);
//     }

//     // 3. 📍 Nested Address Object & Geocoding Logic
//     const existingProperty = await Property.findById(id);
//     if (!existingProperty) return res.status(404).json({ message: "Property not found" });

//     // Agar inme se kuch bhi change ho raha hai
//     if (req.body.state || req.body.city || req.body.locality || req.body.district || req.body.pincode) {

//       // Address object ko merge karna zaroori hai
//       updatedData.address = {
//         state: req.body.state || existingProperty.address?.state,
//         city: req.body.city || existingProperty.address?.city,
//         locality: req.body.locality || existingProperty.address?.locality,
//         district: req.body.district || existingProperty.address?.district,
//         pincode: req.body.pincode || existingProperty.address?.pincode,
//       };

//       const newLocationStr = `${updatedData.address.locality}, ${updatedData.address.city}, ${updatedData.address.state} - ${updatedData.address.pincode}`;

//       try {
//         const geoRes = await geocoder.geocode(newLocationStr);
//         if (geoRes.length) {
//           updatedData.geoLocation = {
//             type: "Point",
//             coordinates: [geoRes[0].longitude, geoRes[0].latitude],
//           };
//           updatedData.propertyLocation = newLocationStr;
//         }
//       } catch (geoErr) {
//         console.error("Geocoding failed during update:", geoErr.message);
//       }
//     }

//     // 4. Final DB Update
//     const property = await Property.findByIdAndUpdate(id, { $set: updatedData }, {
//       new: true,
//       runValidators: true,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Property updated successfully",
//       property,
//     });

//   } catch (error) {
//     console.error("Update Property Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "state", "city", "locality", "district", "pincode",
      "propertyType", "specificType",
      "bedrooms", "bathrooms",
      "balconies",
      "floorNumber", "totalFloors",
      "areaSqFt", "price",
      "furnishingStatus", "parking", "kitchenType",
      "facingDirection", "availabilityStatus",
      "purpose", "availableFor",
      "description", "contactNumber",
      "contactPreferences", "availableFrom",
    ];

    const updatedData = {};

    // 1️⃣ Correct field parsing
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {

        // 🔢 Numbers
        if (
          ["bedrooms", "bathrooms", "floorNumber", "totalFloors", "areaSqFt", "price"]
            .includes(key)
        ) {
          updatedData[key] = Number(req.body[key]);
        }

        // ✅ Boolean (FIXED)
        else if (key === "balconies") {
          updatedData.balconies =
            req.body.balconies === true ||
            req.body.balconies === "true" ||
            req.body.balconies === 1 ||
            req.body.balconies === "1";
        }

        // 📝 बाकी सब string / enum
        else {
          updatedData[key] = req.body[key];
        }
      }
    }

    // 2️⃣ Media update
    if (req.files?.photos) {
      updatedData.photos = req.files.photos.map(f => f.path);
    }
    if (req.files?.videos) {
      updatedData.videos = req.files.videos.map(f => f.path);
    }

    // 3️⃣ Address + Geocoding
    const existingProperty = await Property.findById(id);
    if (!existingProperty) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    if (
      req.body.state ||
      req.body.city ||
      req.body.locality ||
      req.body.district ||
      req.body.pincode
    ) {
      updatedData.address = {
        state: req.body.state || existingProperty.address?.state,
        city: req.body.city || existingProperty.address?.city,
        locality: req.body.locality || existingProperty.address?.locality,
        district: req.body.district || existingProperty.address?.district,
        pincode: req.body.pincode || existingProperty.address?.pincode,
      };

      const locationStr = `${updatedData.address.locality}, ${updatedData.address.city}, ${updatedData.address.state} - ${updatedData.address.pincode}`;

      try {
        const geoRes = await geocoder.geocode(locationStr);
        if (geoRes?.length) {
          updatedData.geoLocation = {
            type: "Point",
            coordinates: [geoRes[0].longitude, geoRes[0].latitude],
          };
          updatedData.propertyLocation = locationStr;
        }
      } catch (err) {
        console.error("Geocoding failed:", err.message);
      }
    }

    // 4️⃣ Final update
    const property = await Property.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property,
    });

  } catch (error) {
    console.error("Update Property Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


export const markPropertyAsSold = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the property by ID
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Toggle the sold status
    property.isSold = !property.isSold;
    await property.save();

    return res.status(200).json({
      success: true,
      message: property.isSold
        ? "Property marked as sold successfully"
        : "Property marked as unsold successfully",
      isSold: property.isSold,
      property,
    });
  } catch (error) {
    console.error("Error toggling sold status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
//  Get all sold properties
export const getSoldProperties = async (req, res) => {
  try {
    // Fetch only properties where isSold = true
    const soldProperties = await Property.find({ isSold: true }).populate("userId", "fullName email");

    if (soldProperties.length === 0) {
      return res.status(404).json({ success: false, message: "No sold properties found" });
    }

    return res.status(200).json({
      success: true,
      count: soldProperties.length,
      soldProperties,
    });
  } catch (error) {
    console.error("Error fetching sold properties:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


//  Delete a sold property by ID
export const deleteSoldProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    if (!property.isSold) {
      return res.status(400).json({ success: false, message: "This property is not marked as sold" });
    }

    await Property.findByIdAndDelete(id);

    // Decrement user's myListingsCount
    await User.findByIdAndUpdate(property.userId, { $inc: { myListingsCount: -1 } });

    return res.status(200).json({
      success: true,
      message: "Sold property deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sold property:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

//  Get sold properties by logged-in user
export const getMySoldProperties = async (req, res) => {
  try {
    const userId = req.user.id; //  userId from verifyToken middleware

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Missing user ID" });
    }

    //  Fetch sold properties belonging to this user
    const soldProperties = await Property.find({ userId, isSold: true })
      .sort({ createdAt: -1 }) // latest first
      .populate("userId", "fullName email");

    if (soldProperties.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No sold properties found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      count: soldProperties.length,
      soldProperties,
    });
  } catch (error) {
    console.error("Error fetching user's sold properties:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getAllProperties = async (req, res) => {
  try {
    // Optional filters
    const { purpose, propertyType, isSold, minPrice, maxPrice, status } = req.query;

    let filter = {};

    if (purpose) filter.purpose = purpose;
    if (propertyType) filter.propertyType = propertyType;
    if (status) filter.status = status;
    if (isSold !== undefined) filter.isSold = isSold === "true";
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(filter)
      .populate("userId", "fullName email phone city state")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: properties.length,
      message: "All properties fetched successfully",
      data: properties,
    });

  } catch (error) {
    console.error("Get All Properties Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================================================
// ADMIN: APPROVE PROPERTY
// PATCH /api/admin/property/:id/approve
// ==================================================
export const approveProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find property
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // 2️⃣ Already approved?
    if (property.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Property already approved",
      });
    }

    // 3️⃣ If posted by USER → check and activate subscription
    if (!property.isPostedByAdmin) {
      // Find pending subscription for this property
      const subscription = await SubscriptionPurchase.findOne({
        propertyId: property._id,
        status: "pending_approval",
      }).populate("subscriptionPackageId");

      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: "User has no pending subscription for this property",
        });
      }

      // 🎯 Calculate startDate and endDate NOW (on approval)
      const pkg = subscription.subscriptionPackageId;
      const startDate = new Date();
      const endDate = new Date(startDate);

      switch (pkg.durationType) {
        case "Day":
          endDate.setDate(endDate.getDate() + pkg.durationValue);
          break;
        case "Week":
          endDate.setDate(endDate.getDate() + pkg.durationValue * 7);
          break;
        case "Month":
          endDate.setMonth(endDate.getMonth() + pkg.durationValue);
          break;
        case "Year":
          endDate.setFullYear(endDate.getFullYear() + pkg.durationValue);
          break;
        default:
          endDate.setMonth(endDate.getMonth() + 1);
      }

      // ✅ Activate subscription with dates
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      subscription.status = "active";
      await subscription.save();

      console.log(`✅ Subscription activated for property ${id}`);
      console.log(`📅 Start: ${startDate}, End: ${endDate}`);
    }

    // 4️⃣ Approve property
    property.status = "approved";
    await property.save();

    return res.status(200).json({
      success: true,
      message: "Property approved successfully",
      property,
    });

  } catch (error) {
    console.error("Approve Property Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================================================
// USER: RENEW EXPIRED PROPERTY (After new subscription purchase)
// PATCH /api/property/:id/renew
// This is called after user purchases new subscription for expired property
// No admin approval needed for renewal
// ==================================================
export const renewProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    // 1️⃣ Find property
    const property = await Property.findOne({
      _id: id,
      userId,
      status: "expired",
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Expired property not found or not owned by you",
      });
    }

    // 2️⃣ Find pending subscription for this property
    const subscription = await SubscriptionPurchase.findOne({
      propertyId: property._id,
      userId,
      status: "pending_approval",
    }).populate("subscriptionPackageId");

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: "Please purchase a subscription plan first to renew this property",
      });
    }

    // 3️⃣ Calculate startDate and endDate NOW
    const pkg = subscription.subscriptionPackageId;
    const startDate = new Date();
    const endDate = new Date(startDate);

    switch (pkg.durationType) {
      case "Day":
        endDate.setDate(endDate.getDate() + pkg.durationValue);
        break;
      case "Week":
        endDate.setDate(endDate.getDate() + pkg.durationValue * 7);
        break;
      case "Month":
        endDate.setMonth(endDate.getMonth() + pkg.durationValue);
        break;
      case "Year":
        endDate.setFullYear(endDate.getFullYear() + pkg.durationValue);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }

    // 4️⃣ Activate subscription with dates
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    subscription.status = "active";
    await subscription.save();

    // 5️⃣ Approve property (renew without admin approval)
    property.status = "approved";
    property.subscriptionPurchaseId = subscription._id;
    await property.save();

    console.log(`🔄 Property ${id} renewed without admin approval`);
    console.log(`📅 Start: ${startDate}, End: ${endDate}`);

    return res.status(200).json({
      success: true,
      message: "Property renewed successfully",
      property,
      subscription: {
        startDate,
        endDate,
        status: subscription.status,
      },
    });

  } catch (error) {
    console.error("Renew Property Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================================================
// ADMIN: REJECT PROPERTY
// PATCH /api/admin/property/:id/reject
// ==================================================
export const rejectProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Property already rejected",
      });
    }

    property.status = "rejected";
    property.rejectionReason = reason || "Rejected by admin";
    await property.save();

    return res.status(200).json({
      success: true,
      message: "Property rejected successfully",
      property,
    });

  } catch (error) {
    console.error("Reject Property Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET /api/properties/states

export const getStates = async (req, res) => {
  try {
    const states = await Property.distinct("address.state");

    res.status(200).json({
      success: true,
      data: states.sort(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET /api/properties/cities?state=Uttar Pradesh

export const getCitiesByState = async (req, res) => {
  try {
    const { state } = req.query;
    if (!state) {
      return res.status(400).json({ success: false, message: "State required" });
    }

    const cities = await Property.distinct("address.city", {
      "address.state": state,
    });

    res.status(200).json({
      success: true,
      data: cities.sort(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPincodesByCity = async (req, res) => {
  try {
    const { state, city } = req.query;

    if (!city || !state) {
      return res.status(400).json({
        success: false,
        message: "State and City required",
      });
    }

    const pincodes = await Property.distinct("address.pincode", {
      "address.state": state,
      "address.city": city,
    });

    res.status(200).json({
      success: true,
      data: pincodes.sort(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getFilteredProperties = async (req, res) => {
  try {
    const { state, city, pincode } = req.query;

    let filter = {
      status: "approved", // ✅ ONLY HERE
    };

    if (state) filter["address.state"] = state;
    if (city) filter["address.city"] = city;
    if (pincode) filter["address.pincode"] = pincode;

    const properties = await Property.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================================================
// GET MY EXPIRED PROPERTIES (Directly from SubscriptionPurchase)
// ==================================================
export const getMyExpiredProperties = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // 1️⃣ Find all expired subscriptions for this user where propertyId is NOT null
    const expiredPurchases = await SubscriptionPurchase.find({
      userId,
      propertyId: { $ne: null },
      status: "expired",
    })
      .populate("propertyId")
      .sort({ updatedAt: -1 });

    // 2️⃣ Filter: Use a Map to get only the latest expired record per property
    const propertyMap = new Map();

    for (const sub of expiredPurchases) {
      // Explicitly skip if propertyId is null or missing (defensive check)
      if (!sub.propertyId) continue;

      const propIdStr = sub.propertyId._id.toString();

      // Since items are sorted by updatedAt -1, the first one encountered is the latest
      if (!propertyMap.has(propIdStr)) {

        // Check if the property has a newer active plan already
        const currentLink = sub.propertyId.subscriptionPurchaseId?.toString();

        if (currentLink && currentLink !== sub._id.toString()) {
          // Verify if that currentLink is actually active
          const activeSub = await SubscriptionPurchase.findOne({
            _id: sub.propertyId.subscriptionPurchaseId,
            status: { $in: ["active", "pending_approval"] }
          });

          if (activeSub) continue; // Skip since property is already renewed/active
        }

        propertyMap.set(propIdStr, sub);
      }
    }

    const uniqueExpired = Array.from(propertyMap.values());

    return res.status(200).json({
      success: true,
      count: uniqueExpired.length,
      message: "Expired properties fetched successfully",
      data: uniqueExpired,
    });
  } catch (error) {
    console.error("Get My Expired Properties Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==================================================
// ADMIN: GET PENDING PROPERTIES WITHOUT SUBSCRIPTION (Strict Check)
// ==================================================
export const getPendingPropertiesWithoutSubscription = async (req, res) => {
  try {
    // 1️⃣ Get all property IDs that HAVE a subscription record
    const purchasedPropertyIds = await SubscriptionPurchase.distinct("propertyId");

    // 2️⃣ Find pending properties excluding those IDs
    const properties = await Property.find({
      status: "pending",
      _id: { $nin: purchasedPropertyIds },
      isPostedByAdmin: false
    })
      .populate("userId", "fullName email contactNumber")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: properties.length,
      message: "Pending properties without any subscription record fetched successfully",
      data: properties,
    });
  } catch (error) {
    console.error("Get Pending Properties Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching pending properties",
      error: error.message,
    });
  }
};

// ==================================================
// USER: GET MY PENDING PROPERTIES WITHOUT SUBSCRIPTION (Strict Check)
// ==================================================
export const getMyPendingPropertiesWithoutSubscription = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // 1️⃣ Get all property IDs that HAVE a subscription record for this user
    const purchasedPropertyIds = await SubscriptionPurchase.distinct("propertyId", { userId });

    // 2️⃣ Find user's pending properties excluding those IDs
    const properties = await Property.find({
      userId,
      status: "pending",
      _id: { $nin: purchasedPropertyIds }
    })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: properties.length,
      message: "Your pending properties without any subscription record fetched successfully",
      data: properties,
    });
  } catch (error) {
    console.error("Get My Pending Properties Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching your pending properties",
      error: error.message,
    });
  }
};

// ==================================================
// ADMIN: GET ALL PROPERTIES (With User Details & Filtering)
// ==================================================
export const getAdminAllProperties = async (req, res) => {
  try {
    const { status, isSold, propertyType, purpose } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (isSold !== undefined) filter.isSold = isSold === "true";
    if (propertyType) filter.propertyType = propertyType;
    if (purpose) filter.purpose = purpose;

    const properties = await Property.find(filter)
      .populate("userId", "fullName email contactNumber phone city role")
      .populate("subscriptionPurchaseId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: properties.length,
      message: "All properties fetched for admin successfully",
      data: properties,
    });
  } catch (error) {
    console.error("Admin Get All Properties Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching all properties",
      error: error.message,
    });
  }
};
