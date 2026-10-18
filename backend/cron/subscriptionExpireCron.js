import cron from "node-cron";
import SubscriptionPurchase from "../models/subscriptionPurchase.js";
import TenantSubscriptionPurchase from "../models/tenantSubscriptionPurchase.js";
import Property from "../models/addProps.js";

/**
 * =================================================
 * UNIFIED SUBSCRIPTION EXPIRY CRON
 * Runs every day at midnight (00:00)
 * Handles both Owner and Tenant subscriptions
 * =================================================
 */
export const startSubscriptionExpireCron = () => {
    cron.schedule("0 0 * * *", async () => {
        try {
            console.log("🕐 Running unified subscription expiry cron...");
            const now = new Date();

            // ===============================
            // 1️⃣ EXPIRE OWNER SUBSCRIPTIONS
            // ===============================
            const expiredOwnerSubs = await SubscriptionPurchase.find({
                status: "active",
                endDate: { $lt: now },
            });

            if (expiredOwnerSubs.length > 0) {
                for (const sub of expiredOwnerSubs) {
                    // Expire subscription
                    sub.status = "expired";
                    await sub.save();

                    // Expire linked property
                    if (sub.propertyId) {
                        await Property.findByIdAndUpdate(sub.propertyId, {
                            status: "expired",
                        });
                        console.log(`⏰ Property ${sub.propertyId} expired (owner subscription ended)`);
                    }
                }
                console.log(`✅ Expired ${expiredOwnerSubs.length} owner subscription(s)`);
            } else {
                console.log("✅ No owner subscriptions to expire");
            }

            // ===============================
            // 2️⃣ EXPIRE TENANT SUBSCRIPTIONS
            // ===============================
            const expiredTenantSubs = await TenantSubscriptionPurchase.find({
                status: "active",
                endDate: { $lt: now },
            });

            if (expiredTenantSubs.length > 0) {
                for (const sub of expiredTenantSubs) {
                    sub.status = "expired";
                    sub.cancelledBy = "system";
                    sub.cancellationReason = "Subscription period ended";
                    await sub.save();
                }
                console.log(`✅ Expired ${expiredTenantSubs.length} tenant subscription(s)`);
            } else {
                console.log("✅ No tenant subscriptions to expire");
            }

            console.log("✅ Subscription expiry cron completed");

        } catch (error) {
            console.error("❌ Error in subscription expiry cron:", error);
        }
    });

    console.log("✅ Unified subscription expiry cron started (runs daily at 00:00)");
};

/**
 * =================================================
 * MANUAL EXPIRY TRIGGER (For Admin/Testing)
 * =================================================
 */
export const manualExpireAllSubscriptions = async (req, res) => {
    try {
        const now = new Date();
        let ownerExpiredCount = 0;
        let propertyExpiredCount = 0;
        let tenantExpiredCount = 0;

        // 1️⃣ Expire Owner Subscriptions
        const expiredOwnerSubs = await SubscriptionPurchase.find({
            status: "active",
            endDate: { $lt: now },
        });

        for (const sub of expiredOwnerSubs) {
            sub.status = "expired";
            await sub.save();
            ownerExpiredCount++;

            if (sub.propertyId) {
                await Property.findByIdAndUpdate(sub.propertyId, {
                    status: "expired",
                });
                propertyExpiredCount++;
            }
        }

        // 2️⃣ Expire Tenant Subscriptions
        const expiredTenantSubs = await TenantSubscriptionPurchase.find({
            status: "active",
            endDate: { $lt: now },
        });

        for (const sub of expiredTenantSubs) {
            sub.status = "expired";
            sub.cancelledBy = "system";
            sub.cancellationReason = "Subscription period ended";
            await sub.save();
            tenantExpiredCount++;
        }

        return res.status(200).json({
            success: true,
            message: "Expiry check completed",
            data: {
                ownerSubscriptionsExpired: ownerExpiredCount,
                propertiesExpired: propertyExpiredCount,
                tenantSubscriptionsExpired: tenantExpiredCount,
            },
        });
    } catch (error) {
        console.error("Manual expire error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to expire subscriptions",
            error: error.message,
        });
    }
};
