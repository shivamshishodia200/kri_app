import Razorpay from "razorpay";
import crypto from "crypto";
import SubscriptionPackage from "../models/SubscriptionPackage.js";
import TenantSubscriptionPurchase from "../models/tenantSubscriptionPurchase.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * ========================================
 * TENANT USER APIS
 * ========================================
 */

// 1. Tenant Buy Subscription - Create Razorpay Order
// export const tenantBuySubscription = async (req, res) => {
//   try {
//     const { subscriptionPackageId } = req.body;
//     const userId = req.user.id;
//     const userCity = req.user.city || "Unknown";

//     // Check if user is tenant
//     if (req.user.role !== "Tenant") {
//       return res.status(403).json({
//         success: false,
//         message: "Only tenants can purchase subscriptions",
//       });
//     }

//     // Get package
//     const pkg = await SubscriptionPackage.findById(subscriptionPackageId);
//     if (!pkg || !pkg.isActive) {
//       return res.status(404).json({
//         success: false,
//         message: "Package not found",
//       });
//     }

//     // Check if package is for tenant
//     if (pkg.applicableFor !== "Tenant" && pkg.applicableFor !== "Both") {
//       return res.status(400).json({
//         success: false,
//         message: "This package is not for tenants",
//       });
//     }

//     // Check if free for city
//     const isFree = pkg.isFreeForCities && pkg.isFreeForCities.includes(userCity);
//     const amount = isFree ? 0 : pkg.amount;

//     // Calculate end date
//     const endDate = calculateEndDate(pkg.durationValue, pkg.durationType);

//     // If free, activate directly
//     if (isFree || amount === 0) {
//       const subscription = new TenantSubscriptionPurchase({
//         userId,
//         subscriptionPackageId: pkg._id,
//         role: "Tenant",
//         city: userCity,
//         amount: 0,
//         paymentMethod: "free",
//         startDate: new Date(),
//         endDate,
//         status: "active",
//         planSnapshot: {
//           name: pkg.name,
//           description: pkg.description,
//           features: pkg.features,
//           durationValue: pkg.durationValue,
//           durationType: pkg.durationType,
//         },
//       });

//       await subscription.save();

//       return res.status(200).json({
//         success: true,
//         message: "Free subscription activated",
//         data: subscription,
//       });
//     }

//     // Create Razorpay order
//     const options = {
//       amount: amount * 100,
//       currency: "INR",
//       receipt: `tenant_sub_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);

//     // Create pending purchase
//     const purchase = new TenantSubscriptionPurchase({
//       userId,
//       subscriptionPackageId: pkg._id,
//       role: "Tenant",
//       city: userCity,
//       amount,
//       paymentMethod: "razorpay",
//       orderId: order.id,
//       startDate: new Date(),
//       endDate,
//       status: "pending",
//       planSnapshot: {
//         name: pkg.name,
//         description: pkg.description,
//         features: pkg.features,
//         durationValue: pkg.durationValue,
//         durationType: pkg.durationType,
//       },
//     });

//     await purchase.save();

//     return res.status(200).json({
//       success: true,
//       message: "Order created",
//       data: {
//         orderId: order.id,
//         amount,
//         currency: "INR",
//         purchaseId: purchase._id,
//         packageName: pkg.name,
//       },
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create order",
//       error: error.message,
//     });
//   }
// };

export const tenantBuySubscription = async (req, res) => {
  try {
    const { subscriptionPackageId } = req.body;
    const userId = req.user.id;
    const userCity = req.user.city || "Unknown";

    // Check if user is tenant
    if (req.user.role !== "Tenant") {
      return res.status(403).json({
        success: false,
        message: "Only tenants can purchase subscriptions",
      });
    }

    // Get package
    const pkg = await SubscriptionPackage.findById(subscriptionPackageId);
    if (!pkg || !pkg.isActive) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // Check if package is for tenant
    if (pkg.applicableFor !== "Tenant" && pkg.applicableFor !== "Both") {
      return res.status(400).json({
        success: false,
        message: "This package is not for tenants",
      });
    }

    // Check if free for city
    const isFree = pkg.isFreeForCities && pkg.isFreeForCities.includes(userCity);
    const amount = isFree ? 0 : pkg.amount;

    // Calculate end date
    const endDate = calculateEndDate(pkg.durationValue, pkg.durationType);

    // If free, activate directly
    if (isFree || amount === 0) {
      const subscription = new TenantSubscriptionPurchase({
        userId,
        subscriptionPackageId: pkg._id,
        role: "Tenant",
        city: userCity,
        amount: 0,
        paymentMethod: "free",
        startDate: new Date(),
        endDate,
        status: "active",
        planSnapshot: {
          name: pkg.name,
          description: pkg.description,
          features: pkg.features,
          durationValue: pkg.durationValue,
          durationType: pkg.durationType,
        },
      });

      await subscription.save();

      return res.status(200).json({
        success: true,
        message: "Free subscription activated",
        data: subscription,
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `tenant_sub_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Create pending purchase
    const purchase = new TenantSubscriptionPurchase({
      userId,
      subscriptionPackageId: pkg._id,
      role: "Tenant",
      city: userCity,
      amount,
      paymentMethod: "razorpay",
      orderId: order.id,
      startDate: null,
      endDate: null,
      status: "pending",
      planSnapshot: {
        name: pkg.name,
        description: pkg.description,
        features: pkg.features,
        durationValue: pkg.durationValue,
        durationType: pkg.durationType,
      },
    });

    await purchase.save();

    return res.status(200).json({
      success: true,
      message: "Order created",
      data: {
        orderId: order.id,
        amount,
        currency: "INR",
        purchaseId: purchase._id,
        packageName: pkg.name,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// 2. Verify Payment
// export const verifyTenantPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, purchaseId } = req.body;

//     // Find purchase
//     const purchase = await TenantSubscriptionPurchase.findById(purchaseId);
//     if (!purchase) {
//       return res.status(404).json({
//         success: false,
//         message: "Purchase not found",
//       });
//     }

//     // Verify signature
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       purchase.status = "cancelled";
//       purchase.cancellationReason = "Payment verification failed";
//       await purchase.save();

//       return res.status(400).json({
//         success: false,
//         message: "Payment verification failed",
//       });
//     }

//     // Activate subscription
//     purchase.paymentId = razorpay_payment_id;
//     purchase.razorpaySignature = razorpay_signature;
//     purchase.status = "active";
//     await purchase.save();

//     return res.status(200).json({
//       success: true,
//       message: "Payment verified. Subscription activated!",
//       data: purchase,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Payment verification failed",
//       error: error.message,
//     });
//   }
// };


export const verifyTenantPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, purchaseId } = req.body;

    // Find purchase
    const purchase = await TenantSubscriptionPurchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      purchase.status = "cancelled";
      purchase.cancellationReason = "Payment verification failed";
      await purchase.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Activate subscription and set dates from NOW
    const now = new Date();
    purchase.startDate = now;
    purchase.endDate = calculateEndDate(
      purchase.planSnapshot.durationValue, 
      purchase.planSnapshot.durationType
    );
    purchase.paymentId = razorpay_payment_id;
    purchase.razorpaySignature = razorpay_signature;
    purchase.status = "active";
    await purchase.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified. Subscription activated!",
      data: purchase,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// 3. Get Active Subscription
export const getActiveSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await TenantSubscriptionPurchase.findOne({
      userId,
      status: "active",
    })
      .populate("subscriptionPackageId", "name description features amount")
      .sort({ endDate: -1 });

    if (!subscription) {
      return res.status(200).json({
        success: true,
        message: "No active subscription",
        data: null,
      });
    }

    // Check if expired
    if (subscription.endDate < new Date()) {
      subscription.status = "expired";
      await subscription.save();

      return res.status(200).json({
        success: true,
        message: "Subscription expired",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Active subscription found",
      data: subscription,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription",
      error: error.message,
    });
  }
};

// 4. Get Subscription History
export const getSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const subscriptions = await TenantSubscriptionPurchase.find(query)
      .populate("subscriptionPackageId", "name description amount")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TenantSubscriptionPurchase.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "History fetched",
      data: {
        subscriptions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch history",
      error: error.message,
    });
  }
};

// 5. Get Available Packages
export const getAvailablePackages = async (req, res) => {
  try {
    const userCity = req.user.city || "Unknown";

    const packages = await SubscriptionPackage.find({
      isActive: true,
      applicableFor: { $in: ["Tenant", "Both"] },
    }).sort({ amount: 1 });

    const packagesWithFreeInfo = packages.map((pkg) => {
      const isFree = pkg.isFreeForCities && pkg.isFreeForCities.includes(userCity);
      return {
        ...pkg.toObject(),
        isFreeForYou: isFree,
        effectiveAmount: isFree ? 0 : pkg.amount,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Packages fetched",
      data: packagesWithFreeInfo,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch packages",
      error: error.message,
    });
  }
};

/**
 * ========================================
 * ADMIN APIS
 * ========================================
 */

// 6. Admin Create Subscription for Tenant
export const adminCreateSubscription = async (req, res) => {
  try {
    const { userId, subscriptionPackageId, durationValue, durationType, adminNotes } = req.body;

    if (!userId || !subscriptionPackageId) {
      return res.status(400).json({
        success: false,
        message: "userId and subscriptionPackageId required",
      });
    }

    // Get package
    const pkg = await SubscriptionPackage.findById(subscriptionPackageId);
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const duration = durationValue || pkg.durationValue;
    const type = durationType || pkg.durationType;
    const endDate = calculateEndDate(duration, type);

    const subscription = new TenantSubscriptionPurchase({
      userId,
      subscriptionPackageId: pkg._id,
      role: "Tenant",
      city: "Admin Created",
      amount: 0,
      paymentMethod: "admin",
      startDate: new Date(),
      endDate,
      status: "active",
      planSnapshot: {
        name: pkg.name,
        description: pkg.description,
        features: pkg.features,
        durationValue: duration,
        durationType: type,
      },
      adminNotes: adminNotes || "Created by admin",
    });

    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription created by admin",
      data: subscription,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create subscription",
      error: error.message,
    });
  }
};

// 7. Admin Get All Subscriptions
export const adminGetAllSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const subscriptions = await TenantSubscriptionPurchase.find(query)
      .populate("userId", "name email phone city")
      .populate("subscriptionPackageId", "name description amount")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TenantSubscriptionPurchase.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Subscriptions fetched",
      data: {
        subscriptions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
      error: error.message,
    });
  }
};

// 8. Admin Get Stats
export const adminGetStats = async (req, res) => {
  try {
    const total = await TenantSubscriptionPurchase.countDocuments();
    const active = await TenantSubscriptionPurchase.countDocuments({ status: "active" });
    const expired = await TenantSubscriptionPurchase.countDocuments({ status: "expired" });
    const cancelled = await TenantSubscriptionPurchase.countDocuments({ status: "cancelled" });

    const revenueData = await TenantSubscriptionPurchase.aggregate([
      { $match: { status: { $in: ["active", "expired"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    return res.status(200).json({
      success: true,
      message: "Stats fetched",
      data: {
        total,
        active,
        expired,
        cancelled,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
};

// 9. Admin Cancel Subscription
export const adminCancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { reason, adminNotes } = req.body;

    const subscription = await TenantSubscriptionPurchase.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason || "Cancelled by admin";
    subscription.cancelledBy = "admin";
    subscription.adminNotes = adminNotes || subscription.adminNotes;
    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled",
      data: subscription,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
      error: error.message,
    });
  }
};

// 10. Admin Check User Subscription
export const adminCheckUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;

    const activeSubscription = await TenantSubscriptionPurchase.findOne({
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
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check subscription",
      error: error.message,
    });
  }
};

// Helper function
function calculateEndDate(durationValue, durationType) {
  const endDate = new Date();
  switch (durationType) {
    case "Day":
      endDate.setDate(endDate.getDate() + durationValue);
      break;
    case "Week":
      endDate.setDate(endDate.getDate() + durationValue * 7);
      break;
    case "Month":
      endDate.setMonth(endDate.getMonth() + durationValue);
      break;
    case "Year":
      endDate.setFullYear(endDate.getFullYear() + durationValue);
      break;
    default:
      endDate.setMonth(endDate.getMonth() + durationValue);
  }
  return endDate;
}
