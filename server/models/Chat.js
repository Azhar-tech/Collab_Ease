const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false, // New messages are unread by default
  },
});

chatSchema.index({ senderId: 1, receiverId: 1, isRead: 1 }); // Add an index for efficient queries

module.exports = mongoose.model("Chat", chatSchema);
