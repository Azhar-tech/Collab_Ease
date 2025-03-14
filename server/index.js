const express = require('express');
const app = express();
const port = 8001;

app.use(express.json());

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
