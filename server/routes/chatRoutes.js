const express = require("express");
const Chat = require("../models/Chat");
const User = require("../models/user"); // Import User model
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer"); // For handling file uploads
const path = require("path");

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profileImages"); // Directory to store profile images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

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

// Get unread message counts grouped by sender
router.get("/unread", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing required query parameter: userId" });
    }

    console.log("Fetching unread message counts for user:", userId); // Debugging log

    // Debugging: Check if the userId is valid and matches the database format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid userId:", userId);
      return res.status(400).json({ error: "Invalid userId format" });
    }

    // Debugging: Check if there are any messages in the database for this user
    const allMessages = await Chat.find({ receiverId: userId });
    console.log("All messages for user:", allMessages);

    const unreadCounts = await Chat.aggregate([
      { $match: { receiverId: new mongoose.Types.ObjectId(userId), isRead: false } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } },
    ]);

    console.log("Unread message counts:", unreadCounts); // Debugging log

    res.status(200).json(unreadCounts);
  } catch (error) {
    console.error("Error fetching unread message counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mark messages as read
router.put("/mark-read", async (req, res) => {
  try {
    const { userId, senderId } = req.body;

    if (!userId || !senderId) {
      return res.status(400).json({ error: "Missing required fields: userId and senderId" });
    }

    const receiverObjectId = new mongoose.Types.ObjectId(userId);
    const senderObjectId = new mongoose.Types.ObjectId(senderId);

    const result = await Chat.updateMany(
      {
        receiverId: receiverObjectId,
        senderId: senderObjectId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "Messages marked as read", updatedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user profile
router.put("/profile", upload.single("profileImage"), async (req, res) => {
  try {
    const { userId, name, bio } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing required field: userId" });
    }

    const updateData = { name, bio };

    if (req.file) {
      updateData.profileImage = req.file.path; // Save the file path of the uploaded image
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
