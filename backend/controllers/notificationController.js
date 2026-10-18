import Notification from "../models/notificationModel.js";
import User from "../models/user.js";
import admin from "../config/firebase.js";
/**
 * @desc Create a new notification
 */
// export const createNotification = async (req, res) => {
//   try {
//     const { title, message } = req.body;

//     if (!title || !message) {
//       return res.status(400).json({
//         success: false,
//         message: "Title and message are required",
//       });
//     }

//     const notification = new Notification({ title, message });
//     const saved = await notification.save();

//     // ❌ Socket.IO removed
//     // req.io.emit("newNotification", saved);

//     res.status(201).json({
//       success: true,
//       data: saved,
//     });
//   } catch (error) {
//     console.error("Error creating notification:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };

export const createNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    // 1️⃣ Save in DB
    const notification = new Notification({ title, message });
    const saved = await notification.save();

    // 2️⃣ Fetch all users with an FCM token (ensure unique tokens)
    const users = await User.find({ fcmToken: { $exists: true, $ne: "" } });
    const allTokens = users.map((u) => u.fcmToken);
    const uniqueTokens = [...new Set(allTokens)]; // Remove duplicates

    console.log(`📡 Broadcast: Found ${allTokens.length} users, targetting ${uniqueTokens.length} unique devices.`);

    if (uniqueTokens.length > 0) {
      // 3️⃣ Send Multicast Notification
      const response = await admin.messaging().sendEachForMulticast({
        tokens: uniqueTokens,
        notification: {
          title,
          body: message,
        },
        data: {
          notificationId: saved._id.toString(),
        },
      });

      console.log(`✅ Broadcast sent. Success: ${response.successCount}, Failure: ${response.failureCount}`);
    } else {
      console.log("⚠️ No users found with FCM tokens to notify.");
    }

    res.status(201).json({
      success: true,
      message: tokens.length > 0 ? "Notification sent to all users" : "Notification saved, but no users to notify",
      data: saved,
      recipientCount: tokens.length
    });
  } catch (error) {
    console.error("Error creating/broadcasting notification:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


/**
 * @desc Get all notifications
 */
// export const getNotifications = async (req, res) => {
//   try {
//     const notifications = await Notification.find()
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       data: notifications,
//     });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };





export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // 1️⃣ Get logged-in user
    const user = await User.findById(userId).select("createdAt");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2️⃣ Fetch notifications from user's joining date onwards
    const notifications = await Notification.find({
      createdAt: { $gte: user.createdAt },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @desc Mark Notification as Read
 * PATCH /api/notification/mark-read/:id
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking notification as read",
    });
  }
};

/**
 * @desc Delete Notification
 * DELETE /api/notification/:id
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting notification",
    });
  }
};

/**
 * @desc Get Unread Notification Count
 * GET /api/notification/unread-count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      unreadCount: unreadCount,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting unread count",
    });
  }
};

/**
 * @desc Mark All Notifications as Read
 * POST /api/notification/read-all
 */
export const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking all notifications as read",
    });
  }
};

/**
 * @desc Delete All Notifications
 * DELETE /api/notification/delete-all
 */
export const deleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({});

    res.status(200).json({
      success: true,
      message: "All notifications deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting all notifications",
    });
  }
};
