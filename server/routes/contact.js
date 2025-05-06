const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact'); // Assuming a Contact model exists

// POST route to handle contact form submissions
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Save contact info to the database
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    res.status(201).json({ message: 'Contact information saved successfully.' });
  } catch (error) {
    console.error('Error saving contact information:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
