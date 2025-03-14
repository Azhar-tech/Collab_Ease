const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember'); 
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Protect all routes

// Create a new team member
router.post('/', async (req, res) => {
  const { name, email } = req.body;

  try {
    const newTeamMember = new TeamMember({
      name,
      email,
      userId: req.user.id  // Store the logged-in user's ID
    });

    const savedTeamMember = await newTeamMember.save();
    res.status(201).json(savedTeamMember);
  } catch (error) {
    console.error('Error creating team member:', error.message);
    res.status(500).json({ message: 'Error creating team member', error: error.message });
  }
});

// Get team members only for logged-in user
router.get('/', async (req, res) => {
  try {
    const teamMembers = await TeamMember.find({ userId: req.user.id }); // Fetch only the logged-in user's team members
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
