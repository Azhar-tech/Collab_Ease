const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  task_name: { type: String, required: true },
  task_description: { type: String, required: true },
  task_start_date: { type: Date, required: true },
  task_end_date: { type: Date, required: true },
  
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Review", "Completed"],
    default: "Pending",
  },

  assigned_to: {
    name: { type: String },
    email: { type: String },
  }, // Filled when a task is assigned

  project_id: { type: Schema.Types.ObjectId, ref: 'Project', required: true },

  comments: [
    {
      text: { type: String, required: true },
      created_at: { type: Date, default: Date.now },
    },
  ],

  file: { type: String }, // Add a field to store the file path

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  comment: { type: String }, // Ensure comment field is defined
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Task', TaskSchema);
