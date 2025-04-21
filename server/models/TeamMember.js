const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }, // Removed unique: true to allow duplicate emails across projects
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
});

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
