const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const authMiddleware = require('../middleware/authMiddleware') // Import auth middleware

// ✅ Create a new task (Uses JWT for user_id)
router.post('/', authMiddleware, async (req, res) => {
  const { task_name, task_description, project_id, task_start_date, task_end_date, assigned_to } = req.body;

  try {
    const newTask = new Task({
      task_name,
      task_description,
      project_id,
      task_start_date,
      task_end_date,
      assigned_to,
      user_id: req.user  // ✅ Extracted from JWT token
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error.message);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// ✅ Get all tasks for a project (Requires Authentication)
// ✅ Get tasks assigned to the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { project_id } = req.query;
    
    // Find tasks assigned to the logged-in user OR created by them
    const tasks = await Task.find({
      project_id,
      $or: [{ 'assigned_to.email': req.user.email }, { user_id: req.user._id }]
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});


module.exports = router;
