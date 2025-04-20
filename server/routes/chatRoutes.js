const express = require("express");
const Chat = require("../models/Chat");
const router = express.Router();
const mongoose = require("mongoose");

// Get all messages between two users (for historical data)
router.get("/", async (req, res) => {
  try {
    const { userId, chatMemberId } = req.query;

    if (!userId || !chatMemberId) {
      return res.status(400).json({ error: "Missing required query parameters: userId and chatMemberId" });
    }

    const query = {
      $or: [
        {
          senderId: new mongoose.Types.ObjectId(userId),
          receiverId: new mongoose.Types.ObjectId(chatMemberId),
        },
        {
          senderId: new mongoose.Types.ObjectId(chatMemberId),
          receiverId: new mongoose.Types.ObjectId(userId),
        },
      ],
    };

    const messages = await Chat.find(query).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
