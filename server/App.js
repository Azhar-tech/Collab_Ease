require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const teamMemberRoutes = require("./routes/TeamMemberRoutes");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes"); // Add this line
const dbConfig = require("./config/db");
const path = require("path");
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
app.use('/api/team-members', teamMemberRoutes);
app.use("/", authRoutes); // Add this line

// Server Listening
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));