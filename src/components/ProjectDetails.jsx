import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import Modal from './Model';
import TaskForm from './TaskForm';

const ProjectDetails = ({ userId }) => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("token");

  const handleError = (error) => {
    console.error('Error:', error.response?.data || error.message);
    const status = error.response?.status;

    if (status === 401) {
      setError('Your session has expired. Please log in again.');
      navigate('/login');
    } else if (status === 403) {
      setError('You do not have access to this project.');
    } else {
      setError('An error occurred while fetching data.');
    }
  };

  const fetchProject = async () => {
    try {
      const token = getToken();
      if (!token) return navigate('/login');

      const config = { headers: { "Authorization": `Bearer ${token}` } };
      const { data } = await axios.get(`/projects/${projectId}`, config);
      setProject(data);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`/tasks?project_id=${projectId}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  
  
  

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [projectId, userId]);

  const handleEditTask = async (taskId, updatedData) => {
    try {
      const response = await axios.put(`http://localhost:8001/api/tasks/${taskId}`, updatedData);
      console.log("Task updated:", response.data);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:8001/api/tasks/${taskId}`);
      console.log("Task deleted successfully");
  
      // Update the state to remove the deleted task
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };
  

  if (error) return <div className="text-red-500">{error}</div>;
  if (!project) return <div>Loading...</div>;


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button onClick={() => navigate('/dashboard')} className="mb-4 text-blue-500">Back to Dashboard</button>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold mb-4">{project.project_name}</h1>
        <p className="mb-4">{project.project_description}</p>
        <p className="mb-4">Start Date: {new Date(project.project_start).toLocaleDateString()}</p>
        <p className="mb-4">End Date: {new Date(project.project_end_date).toLocaleDateString()}</p>
        <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700" onClick={() => setIsTaskModalOpen(true)}>Create New Task</button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr className='bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white'>
              <th className="py-2">Task Name</th>
              <th className="py-2">Description</th>
              <th className="py-2">Assigned To</th>
              <th className="py-2">Start Date</th>
              <th className="py-2">End Date</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
  {tasks.map((task) => (
    <tr key={task._id} className="text-center">
      <td className="border px-4 py-2">{task.task_name}</td>
      <td className="border px-4 py-2">{task.task_description}</td>
      <td className="border px-4 py-2">
        {task.assigned_to?.name} ({task.assigned_to?.email})
      </td>
      <td className="border px-4 py-2">
        {new Date(task.task_start_date).toLocaleDateString()}
      </td>
      <td className="border px-4 py-2">
        {new Date(task.task_end_date).toLocaleDateString()}
      </td>
      <td className="border px-4 py-2">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded-lg mr-2 hover:bg-blue-700"
          onClick={() => handleEditTask(task._id, {/* Pass updated data here */})}
        >
          Edit
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-700"
          onClick={() => handleDeleteTask(task._id)}
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4">Create Task</h2>
        <TaskForm projectId={projectId} userId={userId} onTaskCreated={(newTask) => {
          setTasks([...tasks, newTask]);
          setIsTaskModalOpen(false);
        }} />
      </Modal>
    </div>
  );
};

export default ProjectDetails;
