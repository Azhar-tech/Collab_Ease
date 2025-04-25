const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  task_name: { type: String, required: true },
  task_description: { type: String, required: true },
  task_start_date: { type: Date, required: true },
  task_end_date: { type: Date, required: true },

  status: {
    type: String,
    enum: ["pending", "in-progress", "review", "completed"],
    default: "pending",
  },

  assigned_to: {
    name: { type: String },
    email: { type: String },
  },

  project_id: { type: Schema.Types.ObjectId, ref: 'Project', required: true },

  comments: [
    {
      text: { type: String, required: true },
      created_at: { type: Date, default: Date.now },
      user: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
        name: { type: String, required: true }, // Store the user's name
      },
    },
  ],
  

  files: [{ type: String }],

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },

  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Task', TaskSchema);
