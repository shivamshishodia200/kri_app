import User from "../models/user.js";
import admin from "../config/firebase.js";

export const sendAppUpdateNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    // Find all users who have FCM tokens
    const users = await User.find({ fcmToken: { $exists: true, $ne: "" } });

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found with FCM tokens.",
      });
    }

    // Get all tokens and ensure they are unique
    const allTokens = users.map((u) => u.fcmToken);
    const uniqueTokens = [...new Set(allTokens)];

    console.log(`📡 App Update: Found ${allTokens.length} tokens, sending to ${uniqueTokens.length} unique devices.`);

    // Send notification to all users
    const response = await admin.messaging().sendEachForMulticast({
      tokens: uniqueTokens,
      notification: {
        title: title,
        body: message,
      },
    });

    res.status(200).json({
      success: true,
      message: "App update notification sent to all users!",
      sentCount: response?.successCount || 0,
      failedCount: response?.failureCount || 0,
    });
  } catch (error) {
    console.error("Error sending update notification:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};