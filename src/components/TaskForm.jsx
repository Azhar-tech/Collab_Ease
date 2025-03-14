import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const TaskForm = ({ onTaskCreated, onTaskUpdated, task, projectId, onCancel }) => {
  const [taskName, setTaskName] = useState(task ? task.task_name : '');
  const [taskDescription, setTaskDescription] = useState(task ? task.task_description : '');
  const [taskStart, setTaskStart] = useState(task ? task.task_start : '');
  const [taskEndDate, setTaskEndDate] = useState(task ? task.task_end_date : '');
  const [assignedTo, setAssignedTo] = useState(task ? task.assigned_to : { name: '', email: '' });
  const [teamMembers, setTeamMembers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get('/team-members');
        setTeamMembers(response.data);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, [projectId]);

  const handleAssignChange = (e) => {
    const selectedMember = teamMembers.find(member => member._id === e.target.value);
    setAssignedTo({ _id: selectedMember._id, name: selectedMember.name, email: selectedMember.email });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = {
      task_name: taskName,
      task_description: taskDescription,
      task_start_date: taskStart, // Update field name to match backend requirement
      task_end_date: taskEndDate,
      assigned_to: assignedTo,
      project_id: projectId,
    };

    try {
      if (task) {
        const response = await axios.put(`/tasks/${task._id}`, taskData);
        onTaskUpdated(response.data);
      } else {
        const response = await axios.post('/tasks', taskData);
        onTaskCreated(response.data);
      }
    } catch (error) {
      console.error('Error creating/updating task:', error);
    }
  };

  const handleCancel = () => {
    setTaskName('');
    setTaskDescription('');
    setTaskStart('');
    setTaskEndDate('');
    setAssignedTo({ name: '', email: '' });
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Create a New Task</h2>

      <input
        type="text"
        name="task_name"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        placeholder="Task Name"
        required
        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
      />

      <textarea
        name="task_description"
        value={taskDescription}
        onChange={(e) => setTaskDescription(e.target.value)}
        placeholder="Task Description"
        required
        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
      />

      <input
        type="date"
        name="task_start_date"
        value={taskStart}
        onChange={(e) => setTaskStart(e.target.value)}
        required
        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
      />

      <input
        type="date"
        name="task_end_date"
        value={taskEndDate}
        onChange={(e) => setTaskEndDate(e.target.value)}
        required
        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
      />

      {/* Select Team Member */}
      <select
        name="assigned_to"
        onChange={handleAssignChange}
        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
      >
        <option value="">Assign to</option>
        {teamMembers.map(member => (
          <option key={member._id} value={member._id}>
            {member.name} ({member.email})
          </option>
        ))}
      </select>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {task ? 'Update Task' : 'Create Task'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancel
        </button>
      </div>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </form>
  );
};

export default TaskForm;