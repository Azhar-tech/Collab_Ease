const express = require('express');
const mongoose = require('mongoose');
const authenticateToken = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');

const app = express();
const port = 8001;

app.use(express.json());

app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  const projectId = req.params.id;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }

  const userId = req.user.id; // Assuming the token contains the user ID

  try {
    // Fetch the project details
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the user is the creator of the project
    const isCreator = project.user_id.toString() === userId;

    // Check if the user is assigned to a task in the project
    const isAssigned = await Task.exists({ project_id: projectId, assigned_to: userId });

    if (!isCreator && !isAssigned) {

  const userId = req.user.id; // Assuming the token contains the user ID

  try {
    // Fetch the project details
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the user is the creator of the project
    const isCreator = project.user_id.toString() === userId;

    // Check if the user is assigned to a task in the project
    const isAssigned = await Task.exists({ project_id: projectId, assigned_to: userId });

    if (!isCreator && !isAssigned) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    res.json({
      project_name: project.project_name,
      project_description: project.project_description,
      project_start: project.project_start,
      project_end_date: project.project_end_date,
    });
  } catch (error) {
    console.error('Error fetching project:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/user', (req, res) => {
  // Replace with your actual user fetching logic
  res.json({
    user: {
      _id: '12345',
      email: 'user@example.com',
    },
    tasks: [
      { project_id: 'project1' },
      { project_id: 'project2' },
    ],
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
