const express = require('express');
const path = require('path'); // Import path module
const router = express.Router();
const Task = require('../models/task');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer'); // Import multer for file uploads
const fs = require('fs');
const Project = require('../models/project'); // Update the path as needed
const nodemailer = require('nodemailer'); // Import Nodemailer for email notifications
require('dotenv').config(); // Load environment variables from .env

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Use SMTP host from .env
  port: process.env.SMTP_PORT, // Use SMTP port from .env
  secure: false, // Use TLS (false for port 587)
  auth: {
    user: process.env.SMTP_USER, // Use email from .env
    pass: process.env.SMTP_PASS, // Use password from .env
  },
});

// Function to send email notification
const sendEmailNotification = async (email, taskDetails) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER, // Use sender email from .env
      to: email,
      subject: 'Task Assigned Notification',
      text: `You have been assigned a new task. Here are the details:
      
Task Name: ${taskDetails.task_name}
Description: ${taskDetails.task_description}
Start Date: ${taskDetails.task_start_date}
End Date: ${taskDetails.task_end_date}
Comment: ${taskDetails.comment}

Please check the project management system for more details.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};

// Configure multer for multiple file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Directory to store uploaded files
    },
    filename: (req, file, cb) => {
      cb(null, `${file.originalname}`); // Unique file name
    },
  }),
});

// Serve static files from the uploads folder with logging
router.use('/uploads', (req, res, next) => {
  console.log('Requested URL:', req.url); // Log the requested URL
  req.url = decodeURIComponent(req.url); // Decode URL to handle spaces and special characters
  express.static(path.join(__dirname, '../uploads'))(req, res, next);
});

// Serve static files from the uploads folder
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure the uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ Create a new task (Uses JWT for user_id)
router.post('/', authMiddleware, async (req, res) => {
  const { task_name, task_description, project_id, task_start_date, task_end_date, comment } = req.body;

  try {
    const project = await Project.findById(project_id);
console.log('Project owner:', project.user_id.toString());
console.log('Logged in user:', req.user);

if (project.user_id.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: 'You are not able to create a new task' });
}



    const newTask = new Task({
      task_name,
      task_description,
      project_id,
      task_start_date,
      task_end_date,
      comment,
      user_id: req.user,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});




// ✅ Get all tasks for a project (Requires Authentication)
// ✅ Get tasks assigned to the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { project_id, email } = req.query;

    let query = {};

    // Handle project_id if provided
    if (project_id) {
      if (!mongoose.Types.ObjectId.isValid(project_id)) {
        return res.status(400).json({ message: "Invalid project_id format" });
      }
      query.project_id = new mongoose.Types.ObjectId(project_id);
    }

    // Handle email if provided
    if (email) {
      query['assigned_to.email'] = email;
    }

    // Ensure at least one query parameter is provided
    if (!project_id && !email) {
      return res.status(400).json({ message: "Either project_id or email must be provided" });
    }

    const tasks = await Task.find(query)
      .populate('assigned_to', 'name email') // Populate assigned_to with user details
      .select('task_name task_description project_id task_start_date task_end_date comment status file'); // Include file field

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
});

// ✅ Get a specific task by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.id;

    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const task = await Task.findById(taskId).populate('assigned_to', 'name email');
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task:", error.message);
    res.status(500).json({ message: "Error fetching task", error: error.message });
  }
});

// ✅ Update a task by ID with file upload
router.put('/:id', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { status, comment, assigned_to } = req.body; // Get new status, comment, and assigned_to from the request body
    const taskId = req.params.id;

    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    // Fetch the task and project details
    const task = await Task.findById(taskId).populate('assigned_to', '_id'); // Ensure assigned_to is populated
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project_id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Debugging logs to identify the issue
    console.log("Task Details:", task);
    console.log("Project Details:", project);
    console.log("Logged-in User:", req.user);

    // Authorization: Check if the user is either the project creator or the assigned user
    const isProjectCreator = project.user_id && project.user_id.toString() === req.user._id.toString();
    const isAssignedUser = task.assigned_to && task.assigned_to.email === req.user.email;


    // Restrict moving task from "Pending" to "Review"
    if (task.status === 'pending' && status === 'review') {
      if (!isProjectCreator && !isAssignedUser) {
        console.log("Authorization failed: User is neither the project creator nor the assigned user.");
        return res.status(403).json({ message: "Only the project creator or the assigned user can move this task to Review." });
      }
    }

    // Restrict moving task from "Pending" to "In Progress"
    if (task.status === 'pending' && status === 'in-progress') {
      if (!isProjectCreator && !isAssignedUser) {
        console.log("Authorization failed: User is neither the project creator nor the assigned user.");
        return res.status(403).json({ message: "Only the project creator or the assigned user can move this task to In Progress." });
      }
    }
    

    // Restrict moving task from "In Progress" to "Pending"
if (task.status === 'in-progress' && status === 'pending') {
  if (!isAssignedUser) {
    console.log("Authorization failed: Only the assigned user can move this task back to Pending.");
    return res.status(403).json({ message: "Only the assigned user can move the task back to Pending." });
  }
}

// Restrict moving task from "In Progress" to "Review"
if (task.status === 'in-progress' && status === 'review') {
  if (!isAssignedUser) {
    console.log("Authorization failed: Only the assigned user can move this task to Review.");
    return res.status(403).json({ message: "Only the assigned user can move the task to Review." });
  }
}

// Restrict moving task from "Review" to "Complete"
if (task.status === 'review' && status === 'completed') {
  if (!isProjectCreator) {
    console.log("Authorization failed: Only the project creator can move this task to Complete.");
    return res.status(403).json({ message: "Only the project owner can move the task from Review to Complete." });
  }
}

// Restrict moving task from "Review" to "In Progress"
if (task.status === 'review' && status === 'in-progress') {
  if (!isProjectCreator) {
    console.log("Authorization failed: Only the project creator can move this task back to In Progress.");
    return res.status(403).json({ message: "Only the project owner can move the task from Review to In Progress." });
  }
}



    // Prepare the update object
    const updateData = {
      ...(status && { status }), // Ensure status is updated
      ...(comment && { comment }), // Ensure comment is updated
      ...(assigned_to && { assigned_to: JSON.parse(assigned_to) }), // Ensure assigned_to is updated
    };

    // Handle file upload
    if (req.file) {
      updateData.file = `uploads/${req.file.filename}`; // Save the relative file path
    }

    // Update the task in the database
    Object.assign(task, updateData); // Merge the updateData into the task
    const updatedTask = await task.save();
    // // Update fields if provided

 // Save the task with the new comment and updates

    // Send email notification if the task is assigned to a new user
    if (assigned_to) {
      const assignedUser = JSON.parse(assigned_to);
      if (assignedUser && assignedUser.email) {
        const emailSubject = `Task Assigned: ${task.task_name}`;
        const emailText = `Hello ${assignedUser.name},\n\nYou have been assigned a new task:\n\nTask Name: ${task.task_name}\nDescription: ${task.task_description}\nStart Date: ${task.task_start_date}\nEnd Date: ${task.task_end_date}\nComment: ${comment || 'No comment provided'}\n\nPlease log in to the project management system for more details.\n\nBest regards,\nProject Management Team`;

        await sendEmailNotification(assignedUser.email, {
          task_name: task.task_name,
          task_description: task.task_description,
          task_start_date: task.task_start_date,
          task_end_date: task.task_end_date,
          comment,
        });
      }
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error.message);
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
});

// ✅ Delete a task by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.id;

    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    // Fetch the task to find the associated project
    const task = await Task.findById(taskId).populate('project_id'); // Populate the project_id field to get project details
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Fetch the project to check if the logged-in user is the creator
    const project = await Project.findById(task.project_id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Authorization: Check if the logged-in user is the project creator
    if (project.user_id.toString() !== req.user._id.toString()) {
      console.log("Authorization failed: User is not the project creator.");
      return res.status(403).json({ message: "Only the project creator can delete this task." });
    }

    // Delete the task
    const deletedTask = await Task.findByIdAndDelete(taskId);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error.message);
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
});


// Add a comment to a task
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { comment } = req.body;
    console.log("Received comment:", comment); // Log the received comment
    console.log("Authenticated user:", req.user); // Log the authenticated user details

    const task = await Task.findById(req.params.id);
    if (!task) {
      console.error("Task not found for ID:", req.params.id); // Log if the task is not found
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log("Task found:", task); // Log the task details

    // Add the comment with user details
    task.comments.push({
      text: comment,
      created_at: new Date(),
      user: {
        id: req.user._id, // Ensure user ID is included as ObjectId
        name: req.user.name, // Ensure user name is included
      },
    });

    await task.save();
    console.log("Comment added successfully:", task.comments[task.comments.length - 1]); // Log the added comment

    res.status(200).json(task.comments[task.comments.length - 1]); // Return the newly added comment
  } catch (error) {
    console.error('Error adding comment:', error.message); // Log the error message
    console.error('Error stack trace:', error.stack); // Log the stack trace for debugging
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

// Upload a file to a task
router.put('/:id/file', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.file = `uploads/${req.file.filename}`;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error('Error uploading file:', error.message);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Upload multiple files to a task
router.put('/:id/files', authMiddleware, upload.array('files', 10), async (req, res) => {
  try {
    const taskId = req.params.id;

    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Add uploaded file paths to the task
    const filePaths = req.files.map(file => `uploads/${file.filename}`);
    task.files = [...(task.files || []), ...filePaths];
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error('Error uploading files:', error.message);
    res.status(500).json({ message: 'Error uploading files', error: error.message });
  }
});

router.get('/view/:filename', (req, res) => {
  const decodedFilename = decodeURIComponent(req.params.filename); // Decode the filename
  const filePath = path.join(__dirname, '../uploads', decodedFilename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

// ✅ Get team members for a project
router.get('/:projectId/team-members', authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }

    const project = await Project.findById(projectId).populate('team_members', 'name email');
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project.team_members);
  } catch (error) {
    console.error("Error fetching team members:", error.message);
    res.status(500).json({ message: "Error fetching team members", error: error.message });
  }
});

module.exports = router;