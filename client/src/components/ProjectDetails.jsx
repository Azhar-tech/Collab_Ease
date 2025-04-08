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
  const [pendingTasks, setPendingTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [reviewTasks, setReviewTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [comment, setComment] = useState("");
  const [expandedComments, setExpandedComments] = useState({});
  const [isProjectCreator, setIsProjectCreator] = useState(false); // New state to track if the user is the project creator

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

      // Check if the logged-in user is the project creator
      setIsProjectCreator(data.created_by === userId);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`/tasks?project_id=${projectId}`);
      const allTasks = response.data;

      setPendingTasks(allTasks.filter(task => task.status.toLowerCase() === 'pending'));
      setInProgressTasks(allTasks.filter(task => task.status.toLowerCase() === 'in-progress'));
      setReviewTasks(allTasks.filter(task => task.status.toLowerCase() === 'review'));
      setCompletedTasks(allTasks.filter(task => task.status.toLowerCase() === 'completed'));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('/team-members');
      setTeamMembers(response.data);
    } catch (error) {
      console.error("Error fetching team members:", error);
      alert(`Failed to fetch team members: ${error.response?.data?.message || error.message}`);
    }
  };
  const handleCreateTaskClick = () => {
    if (!isProjectCreator) {
      alert('You are not the project owner. You cannot create tasks.');
    } else {
      setIsTaskModalOpen(true);
    }
  };

  const updateTaskStatus = async (taskId, newStatus, assignedTo = null, comment = "", file = null) => {
    try {
      if (assignedTo && assignedTo._id !== userId) {
        alert("You are not authorized to upload a file for this task.");
        return;
      }

      const formData = new FormData();
      formData.append('status', newStatus);
      if (comment) formData.append('comment', comment);
      if (assignedTo) formData.append('assigned_to', JSON.stringify(assignedTo));
      if (file) formData.append('file', file); // Append the file to FormData

      // Send the request to update the task
      try {
        await axios.put(`/tasks/${taskId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        fetchTasks();
      } catch (error) {
        if (error.response && error.response.status === 403) {
          alert("You are not authorized to move this task. Only the project owner can perform this action.");
        } else {
          console.error("Error updating task status:", error);
          alert("An error occurred while updating the task status. Please try again later.");
        }
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  // Update the file handling logic inside the component


  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchTeamMembers();
  }, [projectId, userId]);

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleAssignTask = (task) => {
    setSelectedTask(task);
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = () => {
    const selectedMember = teamMembers.find(member => member._id === selectedMemberId);
    if (selectedMember) {
      updateTaskStatus(
        selectedTask._id,
        'in-progress',
        { name: selectedMember.name, email: selectedMember.email },
        comment
      );
    }
    setIsAssignModalOpen(false);
    setSelectedTask(null);
    setSelectedMemberId("");
    setComment("");
  };

  const toggleComment = (taskId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const hasAssignedActiveTask = [...inProgressTasks, ...reviewTasks].some(
    task => task.assigned_to && task.assigned_to._id === userId
  );


  if (error) return <div className="text-red-500">{error}</div>;
  if (!project) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {isProjectCreator || !hasAssignedActiveTask ? (
        <button onClick={() => navigate('/dashboard')} className="mb-4 text-blue-500">
          Back to Dashboard
        </button>
      ) : null}


      <div className="bg-red- p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold mb-4">{project.project_name}</h1>
        <p className="mb-4">{project.project_description}</p>
        {isProjectCreator && (
          <button
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            onClick={handleCreateTaskClick}
          >
            Create New Task
          </button>
        )}


        {/* Optionally show an alert or message if the user is not the creator */}
        {!isProjectCreator && (
          <p className="text-red-500 mt-2">You are not the project owner. You cannot create tasks.</p>
        )}
      </div>
      <div className="grid gap-4">
        {/* Pending Tasks */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pending</h2>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white">
                <th className="border border-gray-300 px-4 py-2">Task Name</th>
                <th className="border border-gray-300 px-4 py-2">Description</th>
                {isProjectCreator && <th className="border border-gray-300 px-4 py-2">Assign</th>}
              </tr>
            </thead>
            <tbody className="text-center">
              {pendingTasks.map(task => (
                <tr key={task._id}>
                  <td className="border border-gray-300 px-4 py-2">{task.task_name}</td>
                  <td className="border border-gray-300 px-4 py-2">{task.task_description}</td>
                  {isProjectCreator && (
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                        onClick={() => handleAssignTask(task)}
                      >
                        Assign to Team Member
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* In Progress Tasks */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">In Progress</h2>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Task Name</th>
                <th className="border border-gray-300 px-4 py-2">Description</th>
                <th className="border border-gray-300 px-4 py-2">Assigned To</th>
                <th className="border border-gray-300 px-4 py-2">Comment</th>
                {isProjectCreator && <th className="border border-gray-300 px-4 py-2">Action</th>}
              </tr>
            </thead>
            <tbody className="text-center">
              {inProgressTasks.map(task => (
                <tr key={task._id}>
                  <td className="border border-gray-300 px-4 py-2">{task.task_name}</td>
                  <td className="border border-gray-300 px-4 py-2">{task.task_description}</td>
                  <td className="border border-gray-300 px-4 py-2">{task.assigned_to?.name || "Unassigned"}</td> {/* Display assigned user */}
                  <td className="border border-gray-300 px-4 py-2">
                    {task.comment ? (
                      <>
                        {expandedComments[task._id]
                          ? task.comment
                          : `${task.comment.slice(0, 50)}...`}
                        <button
                          onClick={() => toggleComment(task._id)}
                          className="text-blue-500 underline ml-2"
                        >
                          {expandedComments[task._id] ? "Show Less" : "Show More"}
                        </button>
                      </>
                    ) : (
                      "No comment"
                    )}
                  </td>
                  {task.assigned_to && task.assigned_to._id === userId ? (
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="file"
                        onClick={(e) => {
                          if (task.assigned_to && task.assigned_to._id !== userId) {
                            alert("You are not authorized to upload a file for this task.");
                            e.preventDefault(); // Prevent the file dialog from opening
                          }
                        }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            updateTaskStatus(task._id, 'review', task.assigned_to, null, file);
                          }
                        }}
                      />
                    </td>
                  ) : (
                    <td className="border border-gray-300 px-4 py-2 text-gray-400 italic">
                      Only assigned user can upload
                    </td>
                  )}

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Review Tasks */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Review</h2>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white">
                <th className="border border-gray-300 px-4 py-2">Task Name</th>
                <th className="border border-gray-300 px-4 py-2">Description</th>
                <th className="border border-gray-300 px-4 py-2">Assigned To</th> {/* Add Assigned To column */}
                <th className="border border-gray-300 px-4 py-2">File</th>
                {isProjectCreator && <th className="border border-gray-300 px-4 py-2">Action</th>}
              </tr>
            </thead>
            <tbody className="text-center">
              {reviewTasks.map(task => (
                <tr key={task._id}>
                  <td className="border border-gray-300 px-4 py-2">{task.task_name}</td>
                  <td className="border border-gray-300 px-4 py-2">{task.task_description}</td>
                  <td className="border border-gray-300 px-4 py-2">{task.assigned_to?.name || "Unassigned"}</td> {/* Display assigned user */}
                  <td className="border border-gray-300 px-4 py-2">
                    {task.file ? (
                      <a
                        href={`http://localhost:8001/${task.file}`} // Use the backend's static routed's static file route
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View File
                      </a>
                    ) : (
                      "No file uploaded"
                    )}
                  </td>
                  {isProjectCreator && (
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        onClick={() => updateTaskStatus(task._id, "completed")}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg mr-2"
                      >
                        Approve & Complete
                      </button>
                      <button
                        onClick={() => {
                          const comment = prompt("Enter a comment for moving back to In Progress:");
                          updateTaskStatus(task._id, "in-progress", task.assigned_to, comment || "");
                        }}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                      >
                        Back to In Progress
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Completed</h2>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Task Name</th>
                <th className="border border-gray-300 px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {completedTasks.map(task => (
                <tr key={task._id}>
                  <td className="border border-gray-300 px-4 py-2">{task.task_name}</td>
                  <td className="border border-gray-300 px-4 py-2">{task.task_description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4">Create Task</h2>
        <TaskForm projectId={projectId} userId={userId} isProjectOwner={isProjectCreator} onTaskCreated={(newTask) => {
          // Add the new task to the appropriate state array based on its status
          if (newTask.status.toLowerCase() === 'pending') {
            setPendingTasks((prev) => [...prev, newTask]);
          } else if (newTask.status.toLowerCase() === 'in-progress') {
            setInProgressTasks((prev) => [...prev, newTask]);
          } else if (newTask.status.toLowerCase() === 'review') {
            setReviewTasks((prev) => [...prev, newTask]);
          } else if (newTask.status.toLowerCase() === 'completed') {
            setCompletedTasks((prev) => [...prev, newTask]);
          }
          setIsTaskModalOpen(false); // Close the modal after task creation
        }} onCancel={() => setIsTaskModalOpen(false)} /> {/* Close the modal when cancel is clicked */}
      </Modal>
      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Assign Task</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Team Member</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
              >
                <option value="">Select a member</option>
                {teamMembers.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Comment</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-lg mr-2"
                onClick={() => setIsAssignModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={handleSaveAssignment}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;

