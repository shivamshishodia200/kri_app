import express from "express";
import {
  createOrder,
  verifyPayment,
  getAllPurchasedSubscriptions,
  checkUserSubscription,
  getMyActiveSubscription,
  getMySubscriptionHistory
} from "../controllers/subscriptionPurchaseController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// ===== USER ROUTES =====
router.post("/create-order", verifyToken, createOrder);
router.post("/verify-payment", verifyToken, verifyPayment);
router.get("/my-active", verifyToken, getMyActiveSubscription);
router.get("/my-history", verifyToken, getMySubscriptionHistory);

// ===== ADMIN ROUTES =====
router.get("/all", verifyAdminToken, getAllPurchasedSubscriptions);
router.get("/check-user/:userId", verifyAdminToken, checkUserSubscription);

export default router;



// import express from "express";
// import {
//   createOrder,
//   verifyPayment,
//   getAllPurchasedSubscriptions,
//   checkUserSubscription
// } from "../controllers/subscriptionPurchaseController.js";

// import { verifyToken } from "../middlewares/authMiddleware.js";
// import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";

// const router = express.Router();

// router.post("/create-order", verifyToken, createOrder);
// router.post("/verify-payment", verifyToken, verifyPayment);
// router.get("/all", verifyAdminToken, getAllPurchasedSubscriptions);
// // 👇 NEW ADMIN API (ADD THIS)
// router.get(
//   "/check-user/:userId",
//   verifyAdminToken,
//   checkUserSubscription
// );
// export default router;
