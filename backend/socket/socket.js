//  import Chat from "../models/chatSchema.js";

// const onlineUsers = new Map();

// export const setupSocket = (io) => {
//   io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     // 🔹 User joins with userId
//     socket.on("join", (userId) => {
//       onlineUsers.set(userId.toString(), socket.id);
//       socket.join(userId.toString());
//     });

//     // 🔹 Send message
//     socket.on("sendMessage", async ({ chatId, senderId, text }) => {
//       try {
//         const chat = await Chat.findById(chatId);
//         if (!chat) return;

//         // 🔒 Allow only tenant or owner
//         const allowedUsers = [
//           chat.tenant.toString(),
//           chat.owner.toString(),
//         ];

//         if (!allowedUsers.includes(senderId.toString())) return;

//         // 💾 Save message
//         chat.messages.push({ sender: senderId, text });
//         chat.lastMessage = text;
//         chat.lastMessageAt = new Date();
//         await chat.save();

//         // 👤 Find receiver
//         const receiverId =
//           senderId.toString() === chat.tenant.toString()
//             ? chat.owner.toString()
//             : chat.tenant.toString();

//         // 📡 Emit to receiver
//         io.to(receiverId).emit("receiveMessage", {
//           chatId,
//           senderId,
//           text,
//           createdAt: new Date(),
//         });
//       } catch (err) {
//         console.error("Socket error:", err.message);
//       }
//     });

//     socket.on("disconnect", () => {
//       for (const [userId, socketId] of onlineUsers.entries()) {
//         if (socketId === socket.id) {
//           onlineUsers.delete(userId);
//           break;
//         }
//       }
//       console.log("User disconnected:", socket.id);
//     });
//   });
// };

import Chat from "../models/chatSchema.js";

const onlineUsers = new Map();

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      const uid = userId.toString().trim();
      onlineUsers.set(uid, socket.id);
      socket.join(uid);
      console.log("User joined room:", uid);
    });

    socket.on("sendMessage", async ({ chatId, senderId, text }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        const allowedUsers = [
          chat.tenant.toString(),
          chat.owner.toString(),
        ];
        if (!allowedUsers.includes(senderId.toString())) return;

        chat.messages.push({ sender: senderId, text });
        chat.lastMessage = text;
        chat.lastMessageAt = new Date();
        await chat.save();

        const receiverId =
          senderId.toString() === chat.tenant.toString()
            ? chat.owner.toString()
            : chat.tenant.toString();

        const payload = {
          chatId,
          senderId,
          text,
          createdAt: new Date(),
        };

        // receiver
        io.to(receiverId).emit("receiveMessage", payload);

        // sender (confirmation)
        io.to(senderId.toString()).emit("receiveMessage", payload);

      } catch (err) {
        console.error("Socket error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      console.log("User disconnected:", socket.id);
    });
  });
};

