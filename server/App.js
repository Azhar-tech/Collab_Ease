require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const teamMemberRoutes = require("./routes/TeamMemberRoutes");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
console.log("chatRoutes:", chatRoutes); // Debugging log to check the imported value
const dbConfig = require("./config/db");
const path = require("path");
const Chat = require("./models/Chat"); // Import the Chat model
const TeamMember = require("./models/TeamMember"); // Import the TeamMember model
const Contact = require("./models/Contact");
const contactRoutes = require("./routes/contact"); // Ensure the correct path to the contact routes

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
dbConfig();

// Routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/team-members", teamMemberRoutes);
app.use("/", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/contact", contactRoutes); // Ensure this route is correctly registered

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your frontend URL in production
    methods: ["GET", "POST"],
  },
});

const users = {}; // In-memory store for connected users

// Socket.IO setup
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Register user with their socket ID
  socket.on("register", (userId) => {
    users[userId] = socket.id; // Map userId to socket.id
    console.log("User registered:", userId, "Socket ID:", socket.id);
  });

  // Handle sending messages
  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    console.log("Message received:", { senderId, receiverId, text }); // Debugging log

    // Validate receiverId
    if (!receiverId) {
      console.error("Error: receiverId is missing or null.");
      socket.emit("error", { message: "Receiver ID is missing or invalid." }); // Notify client of the error
      return;
    }

    // Find the receiver's socket ID
    const receiverSocketId = users[receiverId];
    if (receiverSocketId) {
      // Send the message to the receiver
      io.to(receiverSocketId).emit("receiveMessage", { senderId, text, timestamp: new Date() });
      console.log("Message sent to receiver:", receiverId);
    } else {
      console.log("Receiver not connected:", receiverId);

      // Save the message to MongoDB for offline delivery
      try {
        const newMessage = new Chat({ senderId, receiverId, text });
        await newMessage.save();
        console.log("Message saved for offline delivery:", newMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }
  });

  // Handle marking messages as read when a chat is opened
  socket.on("markMessagesAsRead", async ({ userId, senderId }) => {
    try {
      console.log(`Marking messages as read for user: ${userId} from sender: ${senderId}`); // Debugging log

      // Update messages in the database
      const result = await Chat.updateMany(
        { receiverId: userId, senderId, isRead: false },
        { $set: { isRead: true } }
      );

      console.log(`Marked ${result.modifiedCount} messages as read for user: ${userId} from sender: ${senderId}`); // Debugging log

      // Notify the user about updated unread message counts
      const unreadCounts = await Chat.aggregate([
        { $match: { receiverId: new mongoose.Types.ObjectId(userId), isRead: false } },
        { $group: { _id: "$senderId", count: { $sum: 1 } } },
      ]);
      
      const mappedCounts = unreadCounts.map((item) => ({
        senderId: item._id.toString(),
        count: item.count || 0
      }));
      
      console.log("Mapped unread message counts:", mappedCounts); // Debug log
      socket.emit("unreadMessageCounts", mappedCounts);
      
    } catch (error) {
      console.error("Error marking messages as read for user:", userId, error);
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    // Remove the user from the in-memory store
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        console.log("User removed:", userId);
        break;
      }
    }
  });
});

// Server Listening
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));