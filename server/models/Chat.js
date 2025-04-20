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
});

module.exports = mongoose.model("Chat", chatSchema);
