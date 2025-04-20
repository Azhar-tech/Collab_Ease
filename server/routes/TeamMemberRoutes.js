const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember'); 
const authMiddleware = require('../middleware/authMiddleware');

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
router.delete('/:id', async (req, res) => {
  try {
    const teamMember = await TeamMember.findOne({ _id: req.params.id, userId: req.user.id });

    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    await teamMember.deleteOne();
    res.status(200).json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error.message);
    res.status(500).json({ message: 'Error deleting team member', error: error.message });
  }
});

module.exports = router;
