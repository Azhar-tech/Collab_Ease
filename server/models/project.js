const mongoose = require('mongoose');
const ProjectSchema = new mongoose.Schema({
  project_name: { type: String, required: true },
  project_description: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  project_start: { type: Date, required: true },
  project_end_date: { type: Date, required: true }
});

module.exports = mongoose.model('Project', ProjectSchema);