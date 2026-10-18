import express from "express";
import { createNotification, getNotifications,markNotificationAsRead,deleteNotification, getUnreadCount, markAllAsRead, deleteAllNotifications} from "../controllers/notificationController.js";
import { verifyToken  } from '../middlewares/authMiddleware.js';

const router = express.Router();

//Create Notification (already in your project)
router.post("/create", createNotification);

//  Get Notifications
router.get("/list",verifyToken, getNotifications);

//  Get Unread Count
router.get("/unread-count", getUnreadCount);

//  Mark All Notifications as Read
router.post("/read-all", markAllAsRead);

//  Delete All Notifications (MUST be before /:id)
router.delete("/delete-all", deleteAllNotifications);

//  Mark Notification as Read
router.patch("/mark-read/:id", markNotificationAsRead);

//  Delete Notification (MUST be after /delete-all)
router.delete("/:id", deleteNotification);


export default router;