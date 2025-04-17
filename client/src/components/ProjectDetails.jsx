import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Import Link for navigation
import axios from '../axiosConfig';
import Modal from './Model';
import TaskForm from './TaskForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesome
import { faArrowLeft, faPlus, faCheck, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'; // Import specific icons

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
      const task = [...pendingTasks, ...inProgressTasks, ...reviewTasks, ...completedTasks].find(t => t._id === taskId);
  
      // Restrict moving task from "In Progress" to "Review" or "Pending" to only the project owner or assigned user
      if (task && task.status.toLowerCase() === "in-progress" && (newStatus.toLowerCase() === "review" || newStatus.toLowerCase() === "pending")) {
        const isAssignedUser = task.assigned_to && task.assigned_to._id === userId;
        if (!isProjectCreator && !isAssignedUser) {
          alert("Only the project owner or the assigned user can move this task to Review or Pending.");
          return;
        }
      }
  
      // Restrict marking as completed to only the project owner
      if (newStatus.toLowerCase() === "completed" && !isProjectCreator) {
        alert("Only the project owner can mark a task as completed.");
        return;
      }
  
      const formData = new FormData();
      formData.append("status", newStatus);
      if (comment) formData.append("comment", comment);
      if (assignedTo) formData.append("assigned_to", JSON.stringify(assignedTo));
      if (file) formData.append("file", file);
  
      const token = getToken();
      if (!token) {
        alert("Your session has expired. Please log in again.");
        navigate("/login");
        return;
      }
  
      await axios.put(`/tasks/${taskId}`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
  
      fetchTasks(); // Refresh tasks after updating
    } catch (error) {
      if (error.response && error.response.status === 403) {
        alert(error.response.data.message || "You are not authorized to move this task.");
      } else {
        console.error("Error updating task status:", error);
        alert("An error occurred while updating the task status. Please try again later.");
      }
    }
  };
  

  const handleFileUpload = async (taskId, files) => {
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append('files', file)); // Append multiple files

      await axios.put(`/tasks/${taskId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      fetchTasks(); // Refresh tasks after upload
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    }
  };

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
      {/* Page Heading */}
      <div className="relative mb-6">
  {(isProjectCreator || !hasAssignedActiveTask) && (
    <button
      onClick={() => navigate('/dashboard')}
      className="absolute left-0 text-blue-500 flex items-center gap-2"
    >
      <FontAwesomeIcon icon={faArrowLeft} />
      <span className="sr-only">Back to Dashboard</span>
    </button>
  )}

  <h1 className="text-4xl font-bold text-center">Project Details</h1>
</div>

      


      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faEdit} className="text-purple-500" /> {/* Icon for project title */}
          {project.project_name}
        </h1>
        <p className="mb-4">{project.project_description}</p>
        {isProjectCreator && (
          <button
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            onClick={handleCreateTaskClick}
          >
            <FontAwesomeIcon icon={faPlus} /> {/* Plus icon */}
            Create New Task
          </button>
        )}
        {!isProjectCreator && (
          <p className="text-red-500 mt-2">
            You are not the project owner. You cannot create tasks.
          </p>
        )}
      </div>

      <div className="grid gap-4">
        {/* Pending Tasks */}
        <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faEdit} className="text-gray-600" /> {/* Icon for section */}
            Pending
          </h2>
          <div className="min-w-[1500px]">
            <table className="table-auto w-full border-collapse border border-gray-300 text-sm md:text-base">
              <thead>
                <tr className="bg-gray-600 text-white text-center">
                  <th className="border border-gray-300 px-2 md:px-4 py-2">Task Name</th>
                  <th className="border border-gray-300 px-2 md:px-4 py-2">Description</th>
                  {isProjectCreator && (
                    <th className="border border-gray-300 px-2 md:px-4 py-2">Assign</th>
                  )}
                </tr>
              </thead>
              <tbody className="text-center">
  {pendingTasks.map(task => (
    <tr key={task._id}>
      <td className="border border-gray-300 px-2 md:px-4 py-2">{task.task_name}</td>
      <td className="border border-gray-300 px-2 md:px-4 py-2">{task.task_description}</td>
      {isProjectCreator && (
        <td className="border border-gray-300 px-2 md:px-4 py-2">
          <div className="flex justify-center gap-2">
            {task.assigned_to ? (
              <>
                <span className="text-green-500 italic">Assigned</span> {/* Show "Assigned" if the task is already assigned */}
                <button
                  className="bg-blue-500 text-white px-2 md:px-4 py-2 rounded-lg"
                  onClick={() => updateTaskStatus(task._id, 'in-progress')}
                >
                  Move to In Progress
                </button>
              </>
            ) : (
              <button
                className="bg-blue-500 text-white px-2 md:px-4 py-2 rounded-lg flex items-center gap-2"
                onClick={() => handleAssignTask(task)}
              >
                <FontAwesomeIcon icon={faPlus} /> {/* Plus icon */}
                Assign
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </div>

        {/* In Progress Tasks */}
        <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faEdit} className="text-gray-600" /> {/* Icon for section */}
            In Progress
          </h2>
          <div className="min-w-[1500px]">
            <table className="table-auto w-full border-collapse border border-gray-300 text-sm md:text-base">
              <thead className="text-white">
                <tr className="bg-gray-700">
                  <th className="border border-gray-300 px-2 md:px-4 py-2">Task Name</th>
                  <th className="border border-gray-300 px-2 md:px-4 py-2">Description</th>
                  <th className="border border-gray-300 px-2 md:px-4 py-2">Assigned To</th>
                  
                </tr>
              </thead>
              <tbody className="text-center">
                {inProgressTasks.map(task => (
                  <tr key={task._id} className="odd:bg-white even:bg-gray-100">
                    <td className="border border-gray-300 px-2 md:px-4 py-2">
                      <Link
                        to={`/task/${task._id}`} // Navigate to TaskDetails component
                        className="text-blue-500 underline"
                      >
                        {task.task_name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-2 md:px-4 py-2">{task.task_description}</td>
                    <td className="border border-gray-300 px-2 md:px-4 py-2">
                      {task.assigned_to?.name || "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Tasks */}
        <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faCheck} className="text-gray-600" /> {/* Icon for section */}
            Review
          </h2>
          <div className="min-w-[200px]">
            <table className="table-auto  w-full border-collapse border border-gray-300 text-sm md:text-base">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="border border-gray-300 px-2 md:px-4 py-2">Task Name</th>
                  <th className="border border-gray-300 px-2 md:px-4 py-2">Description</th>
                  <th className="border border-gray-300 px-2 md:px-4 py-2">Assigned To</th>
                  
                </tr>
              </thead>
              <tbody className="text-center">
                {reviewTasks.map(task => (
                  <tr key={task._id} className='odd:bg-white even:bg-gray-100'>
                    <td className="border border-gray-300 px-2 md:px-4 py-2">
                      <Link
                        to={`/task/${task._id}`} // Navigate to TaskDetails component
                        className="text-blue-500 underline"
                      >
                        {task.task_name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-2 md:px-4 py-2">{task.task_description}</td>
                    <td className="border border-gray-300 px-2 md:px-4 py-2">
                      {task.assigned_to?.name || "Unassigned"}
                    </td>
                    
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faCheck} className="text-gray-600" /> {/* Icon for section */}
            Completed
          </h2>
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300 text-sm md:text-base">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="border border-gray-300 px-2 md:px-4 py-2">Task Name</th>
                  <th className="border border-gray-300 px-2 md:px-4 py-2">Description</th>
                  <th className="border border-gray-300 px-2 md:px-4 py-2">Assigned To</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {completedTasks.map(task => (
                  <tr key={task._id} className="odd:bg-white even:bg-gray-100">
                    <td className="border border-gray-300 px-2 md:px-4 py-2">
                      <Link
                        to={`/task/${task._id}`} // Navigate to TaskDetails component
                        className="text-blue-500 underline"
                      >
                        {task.task_name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-2 md:px-4 py-2">{task.task_description}</td>
                    <td className="border border-gray-300 px-2 md:px-4 py-2">
                      {task.assigned_to?.name || "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

