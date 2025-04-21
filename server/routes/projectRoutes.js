const express = require("express");
const router = express.Router();
const Project = require("../models/project");
const Task = require("../models/task"); // Import the Task model
const authMiddleware = require("../middleware/authMiddleware");

// Create a new project
router.post("/", authMiddleware, async (req, res) => {
  const { project_name, project_description, project_start, project_end_date } = req.body;

  try {
    // Validate and parse dates
    const startDate = new Date(project_start);
    const endDate = new Date(project_end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const newProject = new Project({
      project_name,
      project_description,
      user_id: req.user._id.toString(), // Ensure it's a string
      project_start: startDate,
      project_end_date: endDate,
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Error creating project:', error.message);
    res.status(500).json({ message: "Error creating project", error: error.message });
  }
});

// Get all projects for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log('Fetching projects for user:', req.user);

    // Fetch projects owned by the user
    const ownedProjects = await Project.find({ user_id: req.user._id });

    // Fetch project IDs from tasks assigned to the user
    const assignedTaskProjects = await Task.find({ 'assigned_to.email': req.user.email }).distinct('project_id');

    // Fetch projects where the user is assigned to tasks
    const assignedProjects = await Project.find({ _id: { $in: assignedTaskProjects } });

    // Combine owned projects and assigned projects, ensuring no duplicates
    const allProjects = [...ownedProjects, ...assignedProjects].reduce((acc, project) => {
      if (!acc.some(p => p._id.toString() === project._id.toString())) {
        acc.push(project);
      }
      return acc;
    }, []);

    console.log('Retrieved projects:', allProjects); // Log the retrieved projects

    res.status(200).json(allProjects);
  } catch (error) {
    console.error('Error retrieving projects:', error.message);
    res.status(500).json({ message: "Error retrieving projects", error: error.message });
  }
});

// Get a project by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.id;

    // Fetch the project by ID
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if the user is the owner of the project
    const isOwner = project.user_id.toString() === req.user._id.toString();

    // Check if the user is assigned to the project
    const isAssignedUser = project.assignedUsers.some(
      user => user.toString() === req.user._id.toString()
    );

    // Check if the user is assigned to any task in the project
    const assignedTasks = await Task.find({
      project_id: projectId,
      'assigned_to.email': req.user.email,
    });

    const isAssignedToTask = assignedTasks.length > 0;

    // If the user is neither the owner nor assigned, deny access
    if (!isOwner && !isAssignedUser && !isAssignedToTask) {
      return res.status(403).json({ message: "You do not have access to this project" });
    }

    const formattedProject = {
      ...project.toObject(),
      project_start: project.project_start.toISOString(),
      project_end_date: project.project_end_date.toISOString(),
    };

    res.json({ project: formattedProject });
  } catch (error) {
    console.error("Error retrieving project:", error);
    res.status(500).json({ message: "Error retrieving project", error: error.message });
  }
});

// Update a project by ID
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedProject = await Project.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user },
      req.body,
      { new: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error: error.message });
  }
});

// Delete a project by ID
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.id;

    // Find and delete the project
    const deletedProject = await Project.findOneAndDelete({
      _id: projectId,
      user_id: req.user._id, // Ensure the user is the owner of the project
    });

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found or you do not have permission to delete it" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error.message);
    res.status(500).json({ message: "Error deleting project", error: error.message });
  }
});

module.exports = router;