// import mongoose from "mongoose";

// // 🔹 Message Sub-Schema
// const messageSchema = new mongoose.Schema(
//   {
//     sender: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     text: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     isRead: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true, _id: false }
// );

// // 🔹 Chat Schema (Single Collection)
// const chatSchema = new mongoose.Schema(
//   {
//     tenant: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//     owner: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//     messages: {
//       type: [messageSchema],
//       default: [],
//     },

//     lastMessage: {
//       type: String,
//       trim: true,
//     },

//     lastMessageAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// // ❌ Prevent duplicate chat
// chatSchema.index({ tenant: 1, owner: 1 }, { unique: true });

// export default mongoose.model("Chat", chatSchema);

import mongoose from "mongoose";

// 🔹 Message Sub-Schema
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, _id: false }
);

// 🔹 Chat Schema (Single Collection)
const chatSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    messages: {
      type: [messageSchema],
      default: [],
    },

    lastMessage: {
      type: String,
      trim: true,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ❌ Prevent duplicate chat
chatSchema.index({ tenant: 1, owner: 1 }, { unique: true });

export default mongoose.model("Chat", chatSchema);

