const express = require('express');
const authRoutes = require('./routes/authRoutes'); // Corrected import path
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// ...existing code...

// Apply the authentication middleware to the auth routes
app.use('/api/auth', authRoutes); // Removed middleware from here

// ...existing code...

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
