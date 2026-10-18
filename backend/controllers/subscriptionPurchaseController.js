import Razorpay from "razorpay";
import crypto from "crypto";
import SubscriptionPackage from "../models/SubscriptionPackage.js"; // Ensure path matches
import SubscriptionPurchase from "../models/subscriptionPurchase.js"; // Ensure path matches

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * =================================================
 * 1️⃣ CREATE RAZORPAY ORDER
 * =================================================
 */
export const createOrder = async (req, res) => {
  try {
    const { subscriptionPackageId } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // ✅ Only Owner can purchase subscriptions
    if (req.user.role !== "Owner") {
      return res.status(403).json({
        success: false,
        message: "Only property owners can purchase subscriptions",
        userRole: req.user.role
      });
    }

    const userRole = req.user.role;
    const userCity = req.user.city || "Unknown";

    console.log("Creating order for user:", req.user.id, "Package:", subscriptionPackageId);

    // 1️⃣ Get package
    const pkg = await SubscriptionPackage.findById(subscriptionPackageId);
    if (!pkg || !pkg.isActive) {
      return res.status(404).json({
        success: false,
        message: "Subscription package not available",
      });
    }

    // 2️⃣ Role validation - Owners can buy any package
    // Tenants can only buy packages marked for them or "Both"
    if (userRole === "Tenant" && pkg.applicableFor === "Owner") {
      return res.status(403).json({
        success: false,
        message: "This package is only for property owners",
        packageRole: pkg.applicableFor,
        userRole: userRole
      });
    }

    // 3️⃣ CHECK PRICE Logic (Handling Free Cities)
    let amountToCharge = pkg.amount;

    // Agar user ki city "Free Cities" list mein hai, to amount 0 kar do
    if (pkg.isFreeForCities && pkg.isFreeForCities.includes(userCity)) {
        amountToCharge = 0;
    }

    // 4️⃣ Handle FREE Plan (Frontend compatible response)
    if (amountToCharge === 0) {
        const freeOrderId = `FREE_ORD_${Date.now()}_${req.user.id}`;
        return res.status(200).json({
            success: true,
            isFree: true,
            order: {
              id: freeOrderId,
              amount: 0,
              currency: "INR",
              status: "created"
            },
            package: pkg,
            message: "This plan is free for you."
        });
    }

    // 5️⃣ Create Razorpay order (Only if amount > 0)
    const options = {
      amount: amountToCharge * 100, // INR → paise
      currency: "INR",
      receipt: `sub_${Date.now()}_${req.user.id.slice(-8)}`, // Max 40 chars
      notes: {
        subscriptionPackageId: subscriptionPackageId.toString(),
        userId: req.user.id
      }
    };

    const order = await razorpay.orders.create(options);

    console.log("Razorpay order created:", order.id);

    res.status(200).json({
      success: true,
      isFree: false,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status
      },
      package: pkg,
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Unable to create order",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * =================================================
 * 2️⃣ VERIFY PAYMENT & ACTIVATE SUBSCRIPTION
 * POST /api/subscription-purchase/verify-payment
 * =================================================
 */
/**
 * =================================================
 * 2️⃣ VERIFY PAYMENT & ACTIVATE SUBSCRIPTION
 * =================================================
 */
// export const verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       subscriptionPackageId,
//       isFreeMode // Frontend se bhejna agar plan free tha (Step 1 se)
//     } = req.body;

//     // 1️⃣ Get package
//     const pkg = await SubscriptionPackage.findById(subscriptionPackageId);
//     if (!pkg) {
//       return res.status(404).json({
//         success: false,
//         message: "Subscription package not found",
//       });
//     }

//     // 🛑 DUPLICATE CHECK: Kya ye Order ID pehle hi use ho chuka hai?
//     // Agar Razorpay payment hai to check karo
//     if (razorpay_order_id) {
//         const existingPurchase = await SubscriptionPurchase.findOne({ orderId: razorpay_order_id });
//         if (existingPurchase) {
//             return res.status(200).json({
//                 success: true,
//                 message: "Subscription already activated.",
//                 data: existingPurchase
//             });
//         }
//     }

//     // 🔐 2️⃣ Verify Razorpay signature (Only if NOT Free Mode)
//     if (!isFreeMode) {
//         const generatedSignature = crypto
//           .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//           .update(razorpay_order_id + "|" + razorpay_payment_id)
//           .digest("hex");

//         if (generatedSignature !== razorpay_signature) {
//           return res.status(400).json({
//             success: false,
//             message: "Payment verification failed",
//           });
//         }
//     }

//     // 3️⃣ Calculate subscription expiry
//     const startDate = new Date();
//     const endDate = new Date(startDate);

//     switch (pkg.durationType) {
//       case "Day":
//         endDate.setDate(endDate.getDate() + pkg.durationValue);
//         break;
//       case "Week":
//         endDate.setDate(endDate.getDate() + pkg.durationValue * 7);
//         break;
//       case "Month":
//         endDate.setMonth(endDate.getMonth() + pkg.durationValue);
//         break;
//       case "Year":
//         endDate.setFullYear(endDate.getFullYear() + pkg.durationValue);
//         break;
//       default:
//         endDate.setMonth(endDate.getMonth() + 1); // Fallback
//     }

//     // 4️⃣ Expire old active subscriptions
//     await SubscriptionPurchase.updateMany(
//       { userId: req.user.id, status: "active" },
//       { status: "expired" }
//     );

//     // 5️⃣ Create subscription purchase
//     // Agar free hai to paymentId dummy daal do
//     const purchase = await SubscriptionPurchase.create({
//       userId: req.user.id,
//       subscriptionPackageId: pkg._id,
//       role: req.user.role,
//       city: req.user.city || "Unknown",
//       amount: isFreeMode ? 0 : pkg.amount,
//       paymentMethod: isFreeMode ? "free" : "razorpay",
//       paymentId: razorpay_payment_id || `FREE_${Date.now()}`,
//       orderId: razorpay_order_id || `FREE_ORD_${Date.now()}`,
//       startDate,
//       endDate,
//       status: "active",
//     });

//     res.status(201).json({
//       success: true,
//       message: "Subscription activated successfully",
//       data: purchase,
//     });
//   } catch (error) {
//     console.error("Verify payment error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while verifying payment",
//     });
//   }
// };

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      subscriptionPackageId,
      propertyId, // 🆕 Property ID required
      isFreeMode,
    } = req.body;

    // Check authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // ✅ Only Owner can purchase subscriptions
    if (req.user.role !== "Owner") {
      return res.status(403).json({
        success: false,
        message: "Only property owners can purchase subscriptions",
        userRole: req.user.role
      });
    }

    // ✅ Validate propertyId
    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "Property ID is required",
      });
    }

    // Check if property exists and belongs to user
    const Property = (await import("../models/addProps.js")).default;
    const property = await Property.findOne({ 
      _id: propertyId, 
      userId: req.user.id 
    });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found or does not belong to you",
      });
    }

    // Check if property already has an active/pending subscription
    const existingSubscription = await SubscriptionPurchase.findOne({
      propertyId,
      status: { $in: ["pending_approval", "active"] }
    });
    
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: "This property already has an active or pending subscription",
      });
    }

    // ✅ Normalize Free Mode (IMPORTANT)
    const freeMode = isFreeMode === true || isFreeMode === "true";

    // 1️⃣ Fetch Package
    const pkg = await SubscriptionPackage.findById(subscriptionPackageId);
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: "Subscription package not found",
      });
    }

    // Re-calculate expected amount and free status
    let expectedAmount = pkg.amount;
    if (pkg.isFreeForCities && pkg.isFreeForCities.includes(req.user.city)) {
      expectedAmount = 0;
    }
    const isActuallyFree = expectedAmount === 0;

    if (freeMode !== isActuallyFree) {
      return res.status(400).json({
        success: false,
        message: "Mismatch in free mode status",
      });
    }

    // 2️⃣ Duplicate Order Check (Only for Paid)
    if (!freeMode && razorpay_order_id) {
      const alreadyUsed = await SubscriptionPurchase.findOne({
        orderId: razorpay_order_id,
      });

      if (alreadyUsed) {
        return res.status(200).json({
          success: true,
          message: "Subscription already created",
          data: alreadyUsed,
        });
      }
    }

    // Additional duplicate check for free mode (recent purchases)
    if (freeMode) {
      const recentFree = await SubscriptionPurchase.findOne({
        userId: req.user.id,
        propertyId,
        subscriptionPackageId: pkg._id,
        paymentMethod: "free",
        status: { $in: ["pending_approval", "active"] },
        createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
      });
      if (recentFree) {
        return res.status(200).json({
          success: true,
          message: "Subscription already created",
          data: recentFree,
        });
      }
    }

    // 3️⃣ Razorpay Signature Verification (ONLY PAID)
    if (!freeMode) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Missing Razorpay payment details",
        });
      }

      // Manual signature verification
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Payment verification failed",
        });
      }
    }

    // 4️⃣ Expire any existing subscriptions for this property
    await SubscriptionPurchase.updateMany(
      { propertyId, status: { $in: ["pending_approval", "active"] } },
      { status: "expired" }
    );

    // 5️⃣ Create Subscription Entry with pending_approval status
    // startDate and endDate will be set when admin approves
    const purchase = await SubscriptionPurchase.create({
      userId: req.user.id,
      propertyId, // 🆕 Link to property
      subscriptionPackageId: pkg._id,
      role: req.user.role,
      city: req.user.city || "Unknown",
      amount: freeMode ? 0 : pkg.amount,
      paymentMethod: freeMode ? "free" : "razorpay",
      paymentId: freeMode
        ? `FREE_PAY_${Date.now()}`
        : razorpay_payment_id,
      orderId: freeMode
        ? `FREE_ORD_${Date.now()}`
        : razorpay_order_id,
      startDate: null, // Will be set on admin approval
      endDate: null, // Will be set on admin approval
      status: "pending_approval", // 🆕 Pending admin approval
    });

    // 6️⃣ Link subscription to property
    await Property.findByIdAndUpdate(propertyId, {
      subscriptionPurchaseId: purchase._id
    });

    // 7️⃣ Success Response
    return res.status(201).json({
      success: true,
      message: "Subscription created. Waiting for admin approval.",
      data: purchase,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying payment",
    });
  }
};

/**
 * =================================================
 * 3️⃣ ADMIN: GET ALL USER PURCHASED SUBSCRIPTIONS
 * GET /api/subscription-purchase/all
 * =================================================
 */
export const getAllPurchasedSubscriptions = async (req, res) => {
  try {
    const purchases = await SubscriptionPurchase.find()
      .populate("userId", "fullName email phone city role")
      .populate("subscriptionPackageId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases,
    });
  } catch (error) {
    console.error("Get all subscriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * =================================================
 * 4️⃣ ADMIN: CHECK USER ACTIVE SUBSCRIPTION
 * GET /api/subscription-purchase/check-user/:userId
 * =================================================
 */
export const checkUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;

    const activeSubscription = await SubscriptionPurchase.findOne({
      userId,
      status: "active",
      endDate: { $gte: new Date() },
    }).populate("subscriptionPackageId");

    if (!activeSubscription) {
      return res.status(200).json({
        success: true,
        hasSubscription: false,
        message: "User has no active subscription",
      });
    }

    return res.status(200).json({
      success: true,
      hasSubscription: true,
      data: {
        subscriptionId: activeSubscription._id,
        planName: activeSubscription.subscriptionPackageId?.name,
        amount: activeSubscription.amount,
        startDate: activeSubscription.startDate,
        endDate: activeSubscription.endDate,
        status: activeSubscription.status,
      },
    });

  } catch (error) {
    console.error("Check user subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking subscription",
    });
  }
};

/**
 * =================================================
 * 5️⃣ USER: GET MY ACTIVE SUBSCRIPTION
 * GET /api/subscription-purchase/my-active
 * =================================================
 */
export const getMyActiveSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const activeSubscription = await SubscriptionPurchase.findOne({
      userId,
      status: "active",
      endDate: { $gte: new Date() },
    }).populate("subscriptionPackageId");

    if (!activeSubscription) {
      return res.status(200).json({
        success: true,
        hasSubscription: false,
        message: "You have no active subscription",
      });
    }

    return res.status(200).json({
      success: true,
      hasSubscription: true,
      data: {
        subscriptionId: activeSubscription._id,
        planName: activeSubscription.subscriptionPackageId?.name,
        planDescription: activeSubscription.subscriptionPackageId?.description,
        amount: activeSubscription.amount,
        paymentMethod: activeSubscription.paymentMethod,
        startDate: activeSubscription.startDate,
        endDate: activeSubscription.endDate,
        status: activeSubscription.status,
        daysRemaining: Math.ceil((new Date(activeSubscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)),
      },
    });
  } catch (error) {
    console.error("Get my active subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subscription",
    });
  }
};

/**
 * =================================================
 * 6️⃣ USER: GET MY SUBSCRIPTION HISTORY
 * GET /api/subscription-purchase/my-history
 * =================================================
 */
export const getMySubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = await SubscriptionPurchase.find({ userId })
      .populate("subscriptionPackageId", "name description amount durationValue durationType")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions.map(sub => ({
        subscriptionId: sub._id,
        planName: sub.subscriptionPackageId?.name,
        planDescription: sub.subscriptionPackageId?.description,
        amount: sub.amount,
        paymentMethod: sub.paymentMethod,
        paymentId: sub.paymentId,
        startDate: sub.startDate,
        endDate: sub.endDate,
        status: sub.status,
        purchasedAt: sub.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get my subscription history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching history",
    });
  }
};



// import Razorpay from "razorpay";
// import crypto from "crypto";
// import SubscriptionPackage from "../models/SubscriptionPackage.js"; // Ensure path matches
// import SubscriptionPurchase from "../models/subscriptionPurchase.js"; // Ensure path matches

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// /**
//  * =================================================
//  * 1️⃣ CREATE RAZORPAY ORDER
//  * =================================================
//  */
// export const createOrder = async (req, res) => {
//   try {
//     const { subscriptionPackageId } = req.body;
//     const userRole = req.user.role;
//     const userCity = req.user.city; // User ki city bhi chahiye

//     // 1️⃣ Get package
//     const pkg = await SubscriptionPackage.findById(subscriptionPackageId);
//     if (!pkg || !pkg.isActive) {
//       return res.status(404).json({
//         success: false,
//         message: "Subscription package not available",
//       });
//     }

//     // 2️⃣ Role validation
//     if (pkg.applicableFor !== "Both" && pkg.applicableFor !== userRole) {
//       return res.status(403).json({
//         success: false,
//         message: "This package is not applicable for your role",
//       });
//     }

//     // 3️⃣ CHECK PRICE Logic (Handling Free Cities)
//     let amountToCharge = pkg.amount;

//     // Agar user ki city "Free Cities" list mein hai, to amount 0 kar do
//     if (pkg.isFreeForCities && pkg.isFreeForCities.includes(userCity)) {
//         amountToCharge = 0;
//     }

//     // 4️⃣ Handle FREE Plan (No Razorpay Order Needed)
//     if (amountToCharge === 0) {
//         return res.status(200).json({
//             success: true,
//             isFree: true, // Frontend ko batao ki ye free hai
//             package: pkg,
//             message: "This plan is free for you. Call verify-payment endpoint directly."
//         });
//     }

//     // 5️⃣ Create Razorpay order (Only if amount > 0)
//     const options = {
//       amount: amountToCharge * 100, // INR → paise
//       currency: "INR",
//       receipt: `sub_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);

//     res.status(200).json({
//       success: true,
//       isFree: false,
//       order,
//       package: pkg,
//     });
//   } catch (error) {
//     console.error("Create order error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Unable to create order",
//     });
//   }
// };


// export const verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       subscriptionPackageId,
//       isFreeMode,
//     } = req.body;

//     // ✅ Normalize Free Mode (IMPORTANT)
//     const freeMode = isFreeMode === true || isFreeMode === "true";

//     // 1️⃣ Fetch Package
//     const pkg = await SubscriptionPackage.findById(subscriptionPackageId);
//     if (!pkg) {
//       return res.status(404).json({
//         success: false,
//         message: "Subscription package not found",
//       });
//     }

//     // 2️⃣ Duplicate Order Check (Only for Paid)
//     if (!freeMode && razorpay_order_id) {
//       const alreadyUsed = await SubscriptionPurchase.findOne({
//         orderId: razorpay_order_id,
//       });

//       if (alreadyUsed) {
//         return res.status(200).json({
//           success: true,
//           message: "Subscription already activated",
//           data: alreadyUsed,
//         });
//       }
//     }

//     // 3️⃣ Razorpay Signature Verification (ONLY PAID)
//     if (!freeMode) {
//       if (
//         !razorpay_order_id ||
//         !razorpay_payment_id ||
//         !razorpay_signature
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Missing Razorpay payment details",
//         });
//       }

//       const generatedSignature = crypto
//         .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//         .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//         .digest("hex");

//       if (generatedSignature !== razorpay_signature) {
//         return res.status(400).json({
//           success: false,
//           message: "Payment verification failed",
//         });
//       }
//     }

//     // 4️⃣ Calculate Subscription Dates
//     const startDate = new Date();
//     const endDate = new Date(startDate);

//     switch (pkg.durationType) {
//       case "Day":
//         endDate.setDate(endDate.getDate() + pkg.durationValue);
//         break;
//       case "Week":
//         endDate.setDate(endDate.getDate() + pkg.durationValue * 7);
//         break;
//       case "Month":
//         endDate.setMonth(endDate.getMonth() + pkg.durationValue);
//         break;
//       case "Year":
//         endDate.setFullYear(endDate.getFullYear() + pkg.durationValue);
//         break;
//       default:
//         endDate.setMonth(endDate.getMonth() + 1);
//     }

//     // 5️⃣ Expire Existing Active Subscriptions
//     await SubscriptionPurchase.updateMany(
//       { userId: req.user.id, status: "active" },
//       { status: "expired" }
//     );

//     // 6️⃣ Create Subscription Entry
//     const purchase = await SubscriptionPurchase.create({
//       userId: req.user.id,
//       subscriptionPackageId: pkg._id,
//       role: req.user.role,
//       city: req.user.city || "Unknown",
//       amount: freeMode ? 0 : pkg.amount,
//       paymentMethod: freeMode ? "free" : "razorpay",
//       paymentId: freeMode
//         ? `FREE_PAY_${Date.now()}`
//         : razorpay_payment_id,
//       orderId: freeMode
//         ? `FREE_ORD_${Date.now()}`
//         : razorpay_order_id,
//       startDate,
//       endDate,
//       status: "active",
//     });

//     // 7️⃣ Success Response
//     return res.status(201).json({
//       success: true,
//       message: "Subscription activated successfully",
//       data: purchase,
//     });
//   } catch (error) {
//     console.error("Verify payment error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while verifying payment",
//     });
//   }
// };

// /**
//  * =================================================
//  * 3️⃣ ADMIN: GET ALL USER PURCHASED SUBSCRIPTIONS
//  * GET /api/subscription-purchase/all
//  * =================================================
//  */
// export const getAllPurchasedSubscriptions = async (req, res) => {
//   try {
//     const purchases = await SubscriptionPurchase.find()
//       .populate("userId", "fullName email phone city role")
//       .populate("subscriptionPackageId")
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: purchases.length,
//       data: purchases,
//     });
//   } catch (error) {
//     console.error("Get all subscriptions error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// /**
//  * =================================================
//  * 4️⃣ ADMIN: CHECK USER ACTIVE SUBSCRIPTION
//  * GET /api/subscription-purchase/check-user/:userId
//  * =================================================
//  */
// export const checkUserSubscription = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const activeSubscription = await SubscriptionPurchase.findOne({
//       userId,
//       status: "active",
//       endDate: { $gte: new Date() },
//     }).populate("subscriptionPackageId");

//     if (!activeSubscription) {
//       return res.status(200).json({
//         success: true,
//         hasSubscription: false,
//         message: "User has no active subscription",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       hasSubscription: true,
//       data: {
//         subscriptionId: activeSubscription._id,
//         planName: activeSubscription.subscriptionPackageId?.name,
//         amount: activeSubscription.amount,
//         startDate: activeSubscription.startDate,
//         endDate: activeSubscription.endDate,
//         status: activeSubscription.status,
//       },
//     });

//   } catch (error) {
//     console.error("Check user subscription error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while checking subscription",
//     });
//   }
// };



// import Razorpay from "razorpay";
// import crypto from "crypto";
// import SubscriptionPackage from "../models/SubscriptionPackage.js"; // Ensure path matches
// import SubscriptionPurchase from "../models/subscriptionPurchase.js"; // Ensure path matches

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// /**
//  * =================================================
//  * 1️⃣ CREATE RAZORPAY ORDER
//  * =================================================
//  */
// export const createOrder = async (req, res) => {
//   try {
//     const { subscriptionPackageId } = req.body;
    
//     // Check if user is authenticated
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         message: "User not authenticated",
//       });
//     }

//     // ✅ Only Owner can purchase subscriptions
//     if (req.user.role !== "Owner") {
//       return res.status(403).json({
//         success: false,
//         message: "Only property owners can purchase subscriptions",
//         userRole: req.user.role
//       });
//     }

//     const userRole = req.user.role;
//     const userCity = req.user.city || "Unknown";

//     console.log("Creating order for user:", req.user.id, "Package:", subscriptionPackageId);

//     // 1️⃣ Get package
//     const pkg = await SubscriptionPackage.findById(subscriptionPackageId);
//     if (!pkg || !pkg.isActive) {
//       return res.status(404).json({
//         success: false,
//         message: "Subscription package not available",
//       });
//     }

//     // 2️⃣ Role validation - Owners can buy any package
//     // Tenants can only buy packages marked for them or "Both"
//     if (userRole === "Tenant" && pkg.applicableFor === "Owner") {
//       return res.status(403).json({
//         success: false,
//         message: "This package is only for property owners",
//         packageRole: pkg.applicableFor,
//         userRole: userRole
//       });
//     }

//     // 3️⃣ CHECK PRICE Logic (Handling Free Cities)
//     let amountToCharge = pkg.amount;

//     // Agar user ki city "Free Cities" list mein hai, to amount 0 kar do
//     if (pkg.isFreeForCities && pkg.isFreeForCities.includes(userCity)) {
//         amountToCharge = 0;
//     }

//     // 4️⃣ Handle FREE Plan (Frontend compatible response)
//     if (amountToCharge === 0) {
//         const freeOrderId = `FREE_ORD_${Date.now()}_${req.user.id}`;
//         return res.status(200).json({
//             success: true,
//             isFree: true,
//             order: {
//               id: freeOrderId,
//               amount: 0,
//               currency: "INR",
//               status: "created"
//             },
//             package: pkg,
//             message: "This plan is free for you."
//         });
//     }

//     // 5️⃣ Create Razorpay order (Only if amount > 0)
//     const options = {
//       amount: amountToCharge * 100, // INR → paise
//       currency: "INR",
//       receipt: `sub_${Date.now()}_${req.user.id.slice(-8)}`, // Max 40 chars
//       notes: {
//         subscriptionPackageId: subscriptionPackageId.toString(),
//         userId: req.user.id
//       }
//     };

//     const order = await razorpay.orders.create(options);

//     console.log("Razorpay order created:", order.id);

//     res.status(200).json({
//       success: true,
//       isFree: false,
//       order: {
//         id: order.id,
//         amount: order.amount,
//         currency: order.currency,
//         status: order.status
//       },
//       package: pkg,
//     });
//   } catch (error) {
//     console.error("❌ Create order error:", error);
//     console.error("Error stack:", error.stack);
//     res.status(500).json({
//       success: false,
//       message: "Unable to create order",
//       error: error.message,
//       details: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// };

// /**
//  * =================================================
//  * 2️⃣ VERIFY PAYMENT & ACTIVATE SUBSCRIPTION
//  * POST /api/subscription-purchase/verify-payment
//  * =================================================
//  */
// /**
//  * =================================================
//  * 2️⃣ VERIFY PAYMENT & ACTIVATE SUBSCRIPTION
//  * =================================================
//  */
// // export const verifyPayment = async (req, res) => {
// //   try {
// //     const {
// //       razorpay_order_id,
// //       razorpay_payment_id,
// //       razorpay_signature,
// //       subscriptionPackageId,
// //       isFreeMode // Frontend se bhejna agar plan free tha (Step 1 se)
// //     } = req.body;

// //     // 1️⃣ Get package
// //     const pkg = await SubscriptionPackage.findById(subscriptionPackageId);
// //     if (!pkg) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Subscription package not found",
// //       });
// //     }

// //     // 🛑 DUPLICATE CHECK: Kya ye Order ID pehle hi use ho chuka hai?
// //     // Agar Razorpay payment hai to check karo
// //     if (razorpay_order_id) {
// //         const existingPurchase = await SubscriptionPurchase.findOne({ orderId: razorpay_order_id });
// //         if (existingPurchase) {
// //             return res.status(200).json({
// //                 success: true,
// //                 message: "Subscription already activated.",
// //                 data: existingPurchase
// //             });
// //         }
// //     }

// //     // 🔐 2️⃣ Verify Razorpay signature (Only if NOT Free Mode)
// //     if (!isFreeMode) {
// //         const generatedSignature = crypto
// //           .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
// //           .update(razorpay_order_id + "|" + razorpay_payment_id)
// //           .digest("hex");

// //         if (generatedSignature !== razorpay_signature) {
// //           return res.status(400).json({
// //             success: false,
// //             message: "Payment verification failed",
// //           });
// //         }
// //     }

// //     // 3️⃣ Calculate subscription expiry
// //     const startDate = new Date();
// //     const endDate = new Date(startDate);

// //     switch (pkg.durationType) {
// //       case "Day":
// //         endDate.setDate(endDate.getDate() + pkg.durationValue);
// //         break;
// //       case "Week":
// //         endDate.setDate(endDate.getDate() + pkg.durationValue * 7);
// //         break;
// //       case "Month":
// //         endDate.setMonth(endDate.getMonth() + pkg.durationValue);
// //         break;
// //       case "Year":
// //         endDate.setFullYear(endDate.getFullYear() + pkg.durationValue);
// //         break;
// //       default:
// //         endDate.setMonth(endDate.getMonth() + 1); // Fallback
// //     }

// //     // 4️⃣ Expire old active subscriptions
// //     await SubscriptionPurchase.updateMany(
// //       { userId: req.user.id, status: "active" },
// //       { status: "expired" }
// //     );

// //     // 5️⃣ Create subscription purchase
// //     // Agar free hai to paymentId dummy daal do
// //     const purchase = await SubscriptionPurchase.create({
// //       userId: req.user.id,
// //       subscriptionPackageId: pkg._id,
// //       role: req.user.role,
// //       city: req.user.city || "Unknown",
// //       amount: isFreeMode ? 0 : pkg.amount,
// //       paymentMethod: isFreeMode ? "free" : "razorpay",
// //       paymentId: razorpay_payment_id || `FREE_${Date.now()}`,
// //       orderId: razorpay_order_id || `FREE_ORD_${Date.now()}`,
// //       startDate,
// //       endDate,
// //       status: "active",
// //     });

// //     res.status(201).json({
// //       success: true,
// //       message: "Subscription activated successfully",
// //       data: purchase,
// //     });
// //   } catch (error) {
// //     console.error("Verify payment error:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Server error while verifying payment",
// //     });
// //   }
// // };

// export const verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       subscriptionPackageId,
//       isFreeMode,
//     } = req.body;

//     // Check authentication
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         message: "User not authenticated",
//       });
//     }

//     // ✅ Only Owner can purchase subscriptions
//     if (req.user.role !== "Owner") {
//       return res.status(403).json({
//         success: false,
//         message: "Only property owners can purchase subscriptions",
//         userRole: req.user.role
//       });
//     }

//     // ✅ Normalize Free Mode (IMPORTANT)
//     const freeMode = isFreeMode === true || isFreeMode === "true";

//     // 1️⃣ Fetch Package
//     const pkg = await SubscriptionPackage.findById(subscriptionPackageId);
//     if (!pkg) {
//       return res.status(404).json({
//         success: false,
//         message: "Subscription package not found",
//       });
//     }

//     // Re-calculate expected amount and free status
//     let expectedAmount = pkg.amount;
//     if (pkg.isFreeForCities && pkg.isFreeForCities.includes(req.user.city)) {
//       expectedAmount = 0;
//     }
//     const isActuallyFree = expectedAmount === 0;

//     if (freeMode !== isActuallyFree) {
//       return res.status(400).json({
//         success: false,
//         message: "Mismatch in free mode status",
//       });
//     }

//     // 2️⃣ Duplicate Order Check (Only for Paid)
//     if (!freeMode && razorpay_order_id) {
//       const alreadyUsed = await SubscriptionPurchase.findOne({
//         orderId: razorpay_order_id,
//       });

//       if (alreadyUsed) {
//         return res.status(200).json({
//           success: true,
//           message: "Subscription already activated",
//           data: alreadyUsed,
//         });
//       }
//     }

//     // Additional duplicate check for free mode (recent purchases)
//     if (freeMode) {
//       const recentFree = await SubscriptionPurchase.findOne({
//         userId: req.user.id,
//         subscriptionPackageId: pkg._id,
//         paymentMethod: "free",
//         status: "active",
//         createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
//       });
//       if (recentFree) {
//         return res.status(200).json({
//           success: true,
//           message: "Subscription already activated",
//           data: recentFree,
//         });
//       }
//     }

//     // 3️⃣ Razorpay Signature Verification (ONLY PAID)
//     if (!freeMode) {
//       if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//         return res.status(400).json({
//           success: false,
//           message: "Missing Razorpay payment details",
//         });
//       }

//       // Manual signature verification
//       const generatedSignature = crypto
//         .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//         .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//         .digest("hex");

//       if (generatedSignature !== razorpay_signature) {
//         return res.status(400).json({
//           success: false,
//           message: "Payment verification failed",
//         });
//       }
//     }

//     // 4️⃣ Calculate Subscription Dates
//     const startDate = new Date();
//     const endDate = new Date(startDate);

//     switch (pkg.durationType) {
//       case "Day":
//         endDate.setDate(endDate.getDate() + pkg.durationValue);
//         break;
//       case "Week":
//         endDate.setDate(endDate.getDate() + pkg.durationValue * 7);
//         break;
//       case "Month":
//         endDate.setMonth(endDate.getMonth() + pkg.durationValue);
//         break;
//       case "Year":
//         endDate.setFullYear(endDate.getFullYear() + pkg.durationValue);
//         break;
//       default:
//         endDate.setMonth(endDate.getMonth() + 1);
//     }

//     // 5️⃣ Expire Existing Active Subscriptions
//     await SubscriptionPurchase.updateMany(
//       { userId: req.user.id, status: "active" },
//       { status: "expired" }
//     );

//     // 6️⃣ Create Subscription Entry
//     const purchase = await SubscriptionPurchase.create({
//       userId: req.user.id,
//       subscriptionPackageId: pkg._id,
//       role: req.user.role,
//       city: req.user.city || "Unknown",
//       amount: freeMode ? 0 : pkg.amount,
//       paymentMethod: freeMode ? "free" : "razorpay",
//       paymentId: freeMode
//         ? `FREE_PAY_${Date.now()}`
//         : razorpay_payment_id,
//       orderId: freeMode
//         ? `FREE_ORD_${Date.now()}`
//         : razorpay_order_id,
//       startDate,
//       endDate,
//       status: "active",
//     });

//     // 7️⃣ Success Response
//     return res.status(201).json({
//       success: true,
//       message: "Subscription activated successfully",
//       data: purchase,
//     });
//   } catch (error) {
//     console.error("Verify payment error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while verifying payment",
//     });
//   }
// };

// /**
//  * =================================================
//  * 3️⃣ ADMIN: GET ALL USER PURCHASED SUBSCRIPTIONS
//  * GET /api/subscription-purchase/all
//  * =================================================
//  */
// export const getAllPurchasedSubscriptions = async (req, res) => {
//   try {
//     const purchases = await SubscriptionPurchase.find()
//       .populate("userId", "fullName email phone city role")
//       .populate("subscriptionPackageId")
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: purchases.length,
//       data: purchases,
//     });
//   } catch (error) {
//     console.error("Get all subscriptions error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// /**
//  * =================================================
//  * 4️⃣ ADMIN: CHECK USER ACTIVE SUBSCRIPTION
//  * GET /api/subscription-purchase/check-user/:userId
//  * =================================================
//  */
// export const checkUserSubscription = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const activeSubscription = await SubscriptionPurchase.findOne({
//       userId,
//       status: "active",
//       endDate: { $gte: new Date() },
//     }).populate("subscriptionPackageId");

//     if (!activeSubscription) {
//       return res.status(200).json({
//         success: true,
//         hasSubscription: false,
//         message: "User has no active subscription",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       hasSubscription: true,
//       data: {
//         subscriptionId: activeSubscription._id,
//         planName: activeSubscription.subscriptionPackageId?.name,
//         amount: activeSubscription.amount,
//         startDate: activeSubscription.startDate,
//         endDate: activeSubscription.endDate,
//         status: activeSubscription.status,
//       },
//     });

//   } catch (error) {
//     console.error("Check user subscription error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while checking subscription",
//     });
//   }
// };


