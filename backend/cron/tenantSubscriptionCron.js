import cron from "node-cron";
import TenantSubscriptionPurchase from "../models/tenantSubscriptionPurchase.js";

/**
 * Auto-expire tenant subscriptions
 * Runs every day at midnight (00:00)
 */
export const startTenantSubscriptionCron = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("🕐 Running tenant subscription expiry cron...");

      const now = new Date();

      // Find active subscriptions that have expired
      const expiredSubscriptions = await TenantSubscriptionPurchase.find({
        status: "active",
        endDate: { $lt: now },
      });

      if (expiredSubscriptions.length === 0) {
        console.log("✅ No subscriptions to expire");
        return;
      }

      // Update all to expired
      const updates = expiredSubscriptions.map(async (sub) => {
        sub.status = "expired";
        sub.cancelledBy = "system";
        sub.cancellationReason = "Subscription period ended";
        await sub.save();
        return sub;
      });

      await Promise.all(updates);

      console.log(`✅ Expired ${expiredSubscriptions.length} subscription(s)`);
    } catch (error) {
      console.error("❌ Error in expiry cron:", error);
    }
  });

  console.log("✅ Tenant subscription cron started (runs daily at 00:00)");
};

/**
 * Manual expiry trigger (for testing/admin)
 */
export const manualExpireSubscriptions = async (req, res) => {
  try {
    const now = new Date();

    const expiredSubscriptions = await TenantSubscriptionPurchase.find({
      status: "active",
      endDate: { $lt: now },
    });

    if (expiredSubscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No subscriptions to expire",
        count: 0,
      });
    }

    const updates = expiredSubscriptions.map(async (sub) => {
      sub.status = "expired";
      sub.cancelledBy = "system";
      sub.cancellationReason = "Subscription period ended";
      await sub.save();
      return sub;
    });

    await Promise.all(updates);

    return res.status(200).json({
      success: true,
      message: `Expired ${expiredSubscriptions.length} subscription(s)`,
      count: expiredSubscriptions.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to expire subscriptions",
      error: error.message,
    });
  }
};
