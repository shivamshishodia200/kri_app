import express from "express";
import {
  tenantBuySubscription,
  verifyTenantPayment,
  getActiveSubscription,
  getSubscriptionHistory,
  getAvailablePackages,
  adminCreateSubscription,
  adminGetAllSubscriptions,
  adminGetStats,
  adminCancelSubscription,
  adminCheckUserSubscription,
} from "../controllers/tenantSubscriptionController.js";
import { manualExpireSubscriptions } from "../cron/tenantSubscriptionCron.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyAdminToken } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// ===== TENANT USER ROUTES =====
router.get("/packages", verifyToken, getAvailablePackages);
router.post("/create-order", verifyToken, tenantBuySubscription);
router.post("/verify-payment", verifyToken, verifyTenantPayment);
router.get("/active", verifyToken, getActiveSubscription);
router.get("/history", verifyToken, getSubscriptionHistory);

// ===== ADMIN ROUTES =====
router.post("/admin/create", verifyAdminToken, adminCreateSubscription);
router.get("/admin/all", verifyAdminToken, adminGetAllSubscriptions);
router.get("/admin/stats", verifyAdminToken, adminGetStats);
router.get("/admin/check-user/:userId", verifyAdminToken, adminCheckUserSubscription);
router.patch("/admin/cancel/:subscriptionId", verifyAdminToken, adminCancelSubscription);
router.post("/admin/expire", verifyAdminToken, manualExpireSubscriptions);

export default router;
