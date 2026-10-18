// import Chat from "../models/chatSchema.js";

// /**
//  * 🔹 Get or Create Chat (Tenant → Owner)
//  * POST /api/chat/:ownerId
//  */
// export const getOrCreateChat = async (req, res) => {
//   try {
//     // ✅ FIX HERE
//     const tenantId = req.user.id;
//     const ownerId = req.params.ownerId;

//     if (req.user.role !== "Tenant") {
//       return res.status(403).json({ message: "Only tenant can start chat" });
//     }

//     let chat = await Chat.findOne({
//       tenant: tenantId,
//       owner: ownerId,
//     });

//     if (!chat) {
//       chat = await Chat.create({
//         tenant: tenantId,
//         owner: ownerId,
//       });
//     }

//     res.json(chat);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * 🔹 Send Message
//  * POST /api/chat/:chatId/message
//  */
// export const sendMessage = async (req, res) => {
//   try {
//     const { text } = req.body;
//     const { chatId } = req.params;

//     // ✅ FIX HERE
//     const senderId = req.user.id;

//     if (!text) {
//       return res.status(400).json({ message: "Message required" });
//     }

//     const chat = await Chat.findById(chatId);
//     if (!chat) {
//       return res.status(404).json({ message: "Chat not found" });
//     }

//     const allowedUsers = [
//       chat.tenant.toString(),
//       chat.owner.toString(),
//     ];

//     if (!allowedUsers.includes(senderId)) {
//       return res.status(403).json({ message: "Not allowed" });
//     }

//     chat.messages.push({
//       sender: senderId,
//       text,
//     });

//     chat.lastMessage = text;
//     chat.lastMessageAt = new Date();

//     await chat.save();

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * 🔹 Get Chat with Messages
//  * GET /api/chat/:chatId
//  */
// export const getChatById = async (req, res) => {
//   try {
//     const chat = await Chat.findById(req.params.chatId)
//       .populate("tenant", "fullName email phone role")
//       .populate("owner", "fullName email phone role")
//       .populate("messages.sender", "fullName role");

//     if (!chat) {
//       return res.status(404).json({ message: "Chat not found" });
//     }

//     // Format response
//     const response = {
//       chatId: chat._id,
//       tenant: {
//         _id: chat.tenant._id,
//         fullName: chat.tenant.fullName,
//         email: chat.tenant.email,
//         phone: chat.tenant.phone,
//         role: chat.tenant.role,
//       },
//       owner: {
//         _id: chat.owner._id,
//         fullName: chat.owner.fullName,
//         email: chat.owner.email,
//         phone: chat.owner.phone,
//         role: chat.owner.role,
//       },
//       messages: chat.messages.map((msg) => ({
//         sender: {
//           _id: msg.sender._id,
//           fullName: msg.sender.fullName,
//           role: msg.sender.role,
//         },
//         text: msg.text,
//         isRead: msg.isRead,
//         createdAt: msg.createdAt,
//         updatedAt: msg.updatedAt,
//       })),
//       lastMessage: chat.lastMessage,
//       lastMessageAt: chat.lastMessageAt,
//       createdAt: chat.createdAt,
//       updatedAt: chat.updatedAt,
//     };

//     res.json({ success: true, chat: response });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * 🔹 Mark Messages as Read
//  * PATCH /api/chat/:chatId/read
//  */
// export const markAsRead = async (req, res) => {
//   try {
//     // ✅ FIX HERE
//     const userId = req.user.id;

//     const chat = await Chat.findById(req.params.chatId);
//     if (!chat) {
//       return res.status(404).json({ message: "Chat not found" });
//     }

//     chat.messages.forEach((msg) => {
//       if (msg.sender.toString() !== userId) {
//         msg.isRead = true;
//       }
//     });

//     await chat.save();
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * 🔹 Get Chat History (Chat List)
//  * GET /api/chat
//  */
// export const getChatHistory = async (req, res) => {
//   try {
//     // ✅ FIX HERE
//     const userId = req.user.id;

//     const chats = await Chat.find({
//       $or: [{ tenant: userId }, { owner: userId }],
//     })
//       .populate("tenant", "fullName email phone role")
//       .populate("owner", "fullName email phone role")
//       .sort({ lastMessageAt: -1 });

//     // Format response with better details
//     const formattedChats = chats.map((chat) => {
//       const otherUser = chat.tenant._id.toString() === userId ? chat.owner : chat.tenant;
      
//       return {
//         chatId: chat._id,
//         tenant: {
//           _id: chat.tenant._id,
//           fullName: chat.tenant.fullName,
//           role: chat.tenant.role,
//         },
//         owner: {
//           _id: chat.owner._id,
//           fullName: chat.owner.fullName,
//           role: chat.owner.role,
//         },
//         otherUser: {
//           _id: otherUser._id,
//           fullName: otherUser.fullName,
//           role: otherUser.role,
//         },
//         lastMessage: chat.lastMessage || "No messages yet",
//         lastMessageAt: chat.lastMessageAt,
//         messageCount: chat.messages.length,
//         unreadCount: chat.messages.filter(
//           (msg) => msg.sender.toString() !== userId && !msg.isRead
//         ).length,
//         createdAt: chat.createdAt,
//         updatedAt: chat.updatedAt,
//       };
//     });

//     res.json({ success: true, chats: formattedChats });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * 🔹 Delete Chat
//  * DELETE /api/chat/:chatId
//  */
// export const deleteChat = async (req, res) => {
//   try {
//     // ✅ FIX HERE
//     const userId = req.user.id;
//     const { chatId } = req.params;

//     const chat = await Chat.findById(chatId);
//     if (!chat) {
//       return res.status(404).json({ message: "Chat not found" });
//     }

//     if (
//       chat.tenant.toString() !== userId &&
//       chat.owner.toString() !== userId
//     ) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     await Chat.findByIdAndDelete(chatId);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

import Chat from "../models/chatSchema.js";

/**
 * 🔹 Get or Create Chat (Tenant → Owner)
 */
export const getOrCreateChat = async (req, res) => {
  try {
    const tenantId = req.user.id;   // ✅ correct
    const ownerId = req.params.ownerId;

    if (req.user.role !== "Tenant") {
      return res.status(403).json({ message: "Only tenant can start chat" });
    }

    let chat = await Chat.findOne({ tenant: tenantId, owner: ownerId });

    if (!chat) {
      chat = await Chat.create({ tenant: tenantId, owner: ownerId });
    }

    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 🔹 Send Message
 */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;   // ✅ correct
    const { chatId } = req.params;
    const { text } = req.body;

    if (!text) return res.status(400).json({ message: "Message required" });

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    if (
      chat.tenant.toString() !== senderId &&
      chat.owner.toString() !== senderId
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    chat.messages.push({ sender: senderId, text });
    chat.lastMessage = text;
    chat.lastMessageAt = new Date();

    await chat.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 🔹 Get Chat By ID
 */
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("tenant", "fullName role")
      .populate("owner", "fullName role")
      .populate("messages.sender", "fullName role");

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 🔹 Get Chat History
 */
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({
      $or: [{ tenant: userId }, { owner: userId }],
    })
      .sort({ lastMessageAt: -1 })
      .populate("tenant", "fullName role")
      .populate("owner", "fullName role");

    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 🔹 Mark Messages Read
 */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.messages.forEach((msg) => {
      if (msg.sender.toString() !== userId) msg.isRead = true;
    });

    await chat.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/**
 * 🔹 Delete Chat
 * DELETE /api/chat/:chatId
 * Only Tenant or Owner of the chat can delete
 */
export const deleteChat = async (req, res) => {
  try {
    const userId = req.user.id;       // ✅ JWT middleware se
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // 🔒 Authorization check
    const isTenant = chat.tenant.toString() === userId;
    const isOwner  = chat.owner.toString() === userId;

    if (!isTenant && !isOwner) {
      return res.status(403).json({ message: "Not authorized to delete this chat" });
    }

    await Chat.findByIdAndDelete(chatId);

    return res.json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (err) {
    console.error("Delete chat error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

