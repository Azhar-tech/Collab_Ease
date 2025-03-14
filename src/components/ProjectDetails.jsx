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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token from local storage
        const config = {
          headers: {
            "Authorization": `Bearer ${token}` // Send token in headers
          }
        };
        const response = await axios.get(`/projects/${projectId}`, config);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error.response?.data || error.message);
      }
    };
  
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        };
        const response = await axios.get(`/tasks?project_id=${projectId}&assigned_to=${userId}`, config);
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error.response?.data || error.message);
      }
    };
  
    fetchProject();
    fetchTasks();
  }, [projectId, userId]);
  

  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
    setIsTaskModalOpen(false);
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button onClick={() => navigate('/dashboard')} className="mb-4 text-blue-500">Back to Dashboard</button>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold mb-4">{project.project_name}</h1>
        <p className="mb-4">{project.project_description}</p>
        <p className="mb-4">Start Date: {new Date(project.project_start).toLocaleDateString()}</p>
        <p className="mb-4">End Date: {new Date(project.project_end_date).toLocaleDateString()}</p>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          onClick={() => setIsTaskModalOpen(true)}
        >
          Create New Task
        </button>
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
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id} className="text-center">
                <td className="border px-4 py-2">{task.task_name}</td>
                <td className="border px-4 py-2">{task.task_description}</td>
                <td className="border px-4 py-2">{task.assigned_to?.name} ({task.assigned_to?.email})</td>
                <td className="border px-4 py-2">{new Date(task.task_start_date).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{new Date(task.task_end_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4">Create Task</h2>
        <TaskForm projectId={projectId} userId={userId} onTaskCreated={handleTaskCreated} onCancel={() => setIsTaskModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default ProjectDetails;