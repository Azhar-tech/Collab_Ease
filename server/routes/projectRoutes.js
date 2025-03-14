const express = require("express");
const router = express.Router();
const Project = require("../models/project");
const authMiddleware = require("../middleware/authMiddleware");

// Create a new project
router.post("/", authMiddleware, async (req, res) => {
  const { project_name, project_description, project_start, project_end_date } = req.body;

  try {
    const newProject = new Project({
      project_name,
      project_description,
      user_id: req.user, // Associate project with the authenticated user
      project_start,
      project_end_date,
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
    const projects = await Project.find({ user_id: req.user });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving projects", error: error.message });
  }
});

// Get a project by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user_id: req.user });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
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

module.exports = router;