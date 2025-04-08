const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Task = require('../models/task'); // Import the Task model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
 // Import the middleware

// Signup route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({ name, email, password: await bcrypt.hash(password, 10) });
    await user.save();

    // ✅ Link assigned tasks to this user
    await Task.updateMany({ 'assigned_to.email': email }, { $set: { user_id: user._id } });

    // ✅ Fetch assigned tasks
    const tasks = await Task.find({ 'assigned_to.email': email });
    const projectIds = tasks.map(task => task.project_id);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, projectIds }); // ✅ Return projectIds
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a token
    const token = crypto.randomBytes(20).toString('hex');

    // Set reset token and expiration
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email (example using Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_PASS, // App password
      },
    });

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>You requested a password reset</p>
             <p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
    });

    res.json({ message: 'Reset email sent' });
  } catch (err) {
    console.error('Error sending reset email:', err);
    res.status(500).json({ message: 'Server error' });
  }
})
  // Reset password route
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



// Login route


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("Received login request for:", email);

  try {
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    // Convert email to lowercase
    const emailLower = email.toLowerCase();

    // Check if user exists
    let user = await User.findOne({ email: emailLower });
    console.log("User found:", user);

    if (!user) {
      console.log("User not found, checking assigned tasks...");
      const tasks = await Task.find({ 'assigned_to.email': emailLower });

      if (tasks.length > 0) {
        console.log("User has assigned tasks, auto-creating user...");
        const hashedPassword = await bcrypt.hash("defaultpassword", 10);

        user = new User({
          name: tasks[0].assigned_to.name, // Use name from task
          email: emailLower,
          role: role,
          password: hashedPassword, // Save hashed password
        });

        await user.save();
      } else {
        return res.status(400).json({ msg: "Invalid credentials" });
      }
    }

    // Compare the entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Fetch assigned projects
    const tasks = await Task.find({ 'assigned_to.email': emailLower });
    const projectIds = tasks.map(task => task.project_id);
    console.log("User authenticated. Redirecting to project:", projectIds[0]);

    res.json({ token, projectIds });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});





router.get('/user', authMiddleware, async (req, res) => {
  try {
     const user = await User.findById(req.user.userId);
     if (!user) {
        return res.status(404).json({ message: 'User not found' });
     }

     // Fetch tasks assigned to this user
     const tasks = await Task.find({ user_id: user._id });

     res.json({ user, tasks });
  } catch (error) {
     console.error(error);
     res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;