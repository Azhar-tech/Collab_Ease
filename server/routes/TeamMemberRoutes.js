const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember'); 
const authMiddleware = require('../middleware/authMiddleware');
const Project = require('../models/project');
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation
 // Import the Project model

router.use(authMiddleware); // Protect all routes

// Create a new team member for a specific project
router.post('/', async (req, res) => {
  const { name, email, projectId } = req.body;

  try {
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const newTeamMember = new TeamMember({
      name,
      email,
      projectId,
      userId: req.user.id, // Associate with the logged-in user
    });

    const savedTeamMember = await newTeamMember.save();
    res.status(201).json(savedTeamMember);
  } catch (error) {
    console.error('Error creating team member:', error.message);
    res.status(500).json({ message: 'Error creating team member', error: error.message });
  }
});

// Fetch team members for a specific project
router.get('/', async (req, res) => {
  const { projectId } = req.query; // Expect projectId as a query parameter

  try {
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const teamMembers = await TeamMember.find({ projectId }); // Ensure this query is correct
    res.status(200).json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error.message);
    res.status(500).json({ message: 'Error fetching team members', error: error.message });
  }
});

// Delete a team member
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const teamMemberId = req.params.id;

    // Validate team member ID
    if (!mongoose.Types.ObjectId.isValid(teamMemberId)) {
      return res.status(400).json({ message: "Invalid team member ID format" });
    }

    // Fetch the team member to find the associated project
    const teamMember = await TeamMember.findById(teamMemberId);
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Fetch the project to check if the logged-in user is the creator
    const project = await Project.findById(teamMember.projectId);
    if (!project) {
      console.error(`Project with ID ${teamMember.projectId} not found.`);
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.user_id) {
      console.error(`Project with ID ${project._id} has no creator defined.`);
      return res.status(500).json({ message: "Project creator is undefined" });
    }

    // Authorization: Check if the logged-in user is the project creator
    if (project.user_id.toString() !== req.user._id.toString()) {
      console.log("Authorization failed: User is not the project creator.");
      return res.status(403).json({ message: "Only the project creator can delete this team member." });
    }

    // Delete the team member
    await teamMember.deleteOne();
    console.log(`Team member with ID ${teamMemberId} deleted successfully.`);
    res.status(200).json({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error("Error deleting team member:", error.message);
    res.status(500).json({ message: "Error deleting team member", error: error.message });
  }
});

module.exports = router;
