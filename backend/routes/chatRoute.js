// import express from "express";
// import {
//   getOrCreateChat,
//   sendMessage,
//   getChatById,
//   getChatHistory,
//   markAsRead,
//   deleteChat,
// } from "../controllers/chatController.js";

// import  { verifyToken } from "../middlewares/authMiddleware.js";

// const router = express.Router();

// /**
//  * 🔹 Tenant → Owner (create or get chat)
//  * POST /api/chat/:ownerId
//  */
// router.post("/:ownerId", verifyToken, getOrCreateChat);

// /**
//  * 🔹 Send message in chat
//  * POST /api/chat/:chatId/message
//  */
// router.post("/:chatId/message", verifyToken, sendMessage);

// /**
//  * 🔹 Get chat with messages
//  * GET /api/chat/:chatId
//  */
// router.get("/:chatId", verifyToken, getChatById);

// /**
//  * 🔹 Get chat history (chat list)
//  * GET /api/chat
//  */
// router.get("/", verifyToken, getChatHistory);

// /**
//  * 🔹 Mark messages as read
//  * PATCH /api/chat/:chatId/read
//  */
// router.patch("/:chatId/read", verifyToken, markAsRead);

// /**
//  * 🔹 Delete chat
//  * DELETE /api/chat/:chatId
//  */
// router.delete("/:chatId", verifyToken, deleteChat);

// export default router;

import express from "express";
import {
  getOrCreateChat,
  sendMessage,
  getChatById,
  getChatHistory,
  markAsRead,
  deleteChat,
} from "../controllers/chatController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * 🔹 Get chat history (chat list)
 * GET /api/chat
 */
router.get("/", verifyToken, getChatHistory);

/**
 * 🔹 Tenant → Owner (create or get chat)
 * POST /api/chat/:ownerId
 */
router.post("/:ownerId", verifyToken, getOrCreateChat);

/**
 * 🔹 Get chat with messages
 * GET /api/chat/:chatId
 */
router.get("/:chatId", verifyToken, getChatById);

/**
 * 🔹 Send message in chat
 * POST /api/chat/:chatId/message
 */
router.post("/:chatId/message", verifyToken, sendMessage);

/**
 * 🔹 Mark messages as read
 * PATCH /api/chat/:chatId/read
 */
router.patch("/:chatId/read", verifyToken, markAsRead);

/**
 * 🔹 Delete chat
 * DELETE /api/chat/:chatId
 */
router.delete("/:chatId", verifyToken, deleteChat);

export default router;

