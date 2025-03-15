const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware') // Import auth middleware

// ✅ Create a new task (Uses JWT for user_id)
router.post('/', authMiddleware, async (req, res) => {
  const { task_name, task_description, project_id, task_start_date, task_end_date, assigned_to } = req.body;

  try {
    // Validate and structure the assigned_to field
    if (!assigned_to || !assigned_to.name || !assigned_to.email) {
      return res.status(400).json({ message: 'Assigned user must have a name and email' });
    }

    const newTask = new Task({
      task_name,
      task_description,
      project_id,
      task_start_date,
      task_end_date,
      assigned_to: {
        name: assigned_to.name,
        email: assigned_to.email,
      },
      user_id: req.user, // Extracted from JWT token
    });

    console.log('Saving task:', newTask); // Log the task being saved
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

    const tasks = await Task.find(query);

    // console.log("Retrieved tasks:", tasks);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
});

// ✅ Update a task by ID
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.id;

    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, { new: true });
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
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

module.exports = router;
