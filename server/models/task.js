const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  task_name: {
    type: String,
    required: true,
  },
  task_description: {
    type: String,
    required: true,
  },
  task_start_date: {
    type: Date,
    required: true,
  },
  task_end_date: {
    type: Date,
    required: true,
  },
  assigned_to: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'TeamMember',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  project_id: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Task', TaskSchema);