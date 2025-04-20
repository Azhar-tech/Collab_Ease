import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Import Link for navigation
import axios from '../axiosConfig';
import Modal from './Model';
import TaskForm from './TaskForm';  // Correct for named exports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesome
import { faArrowLeft, faPlus, faCheck, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'; // Import specific icons
import io from "socket.io-client"; // Import Socket.IO client

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
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedChatMember, setSelectedChatMember] = useState(null); // State for selected chat member
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false); // State for Add Member Modal
  const [newMemberName, setNewMemberName] = useState(""); // State for new member name
  const [newMemberEmail, setNewMemberEmail] = useState(""); // State for new member email

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
      const token = getToken();
      if (!token) {
        alert("Your session has expired. Please log in again.");
        navigate("/login");
        return;
      }

      console.log("Fetching team members for projectId:", projectId); // Debugging log

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`/team-members`, { params: { projectId }, ...config }); // Use projectId instead of project_id
      console.log("Fetched team members:", response.data); // Debugging log

      // Ensure team members include userId for messaging
      setTeamMembers(response.data.map(member => ({
        ...member,
        userRefId: typeof member.userId === 'object' ? member.userId._id : member.userId,
      })));
           
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
    fetchTeamMembers(); // Ensure team members are fetched
  }, [projectId, userId]);

  useEffect(() => {
    const newSocket = io("http://localhost:8001"); // Replace with your backend URL
    setSocket(newSocket);

    // Register the user with their userId
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      console.log("Registering user with ID:", user._id); // Debugging log
      newSocket.emit("register", user._id);
    }

    // Listen for incoming messages
    newSocket.on("receiveMessage", (message) => {
      console.log("Received message via WebSocket:", message);
    
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id;
      const chatMemberUserId = selectedChatMember?.userRefId;
    
      // Check if the message is for the current selected chat
      const isRelevantMessage =
        (message.senderId === userId && message.receiverId === chatMemberUserId) ||
        (message.receiverId === userId && message.senderId === chatMemberUserId);
    
        setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    return () => newSocket.disconnect();
  }, []);

  const fetchMessages = async (chatMemberId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id;
  
      if (!userId || !chatMemberId) {
        console.error("Missing userId or chatMemberId", { userId, chatMemberId });
        return;
      }
  
      console.log("Fetching messages with params:", { userId, chatMemberId }); // Debugging log
  
      const response = await axios.get("http://localhost:8001/api/chats", {
        params: { userId, chatMemberId },
      });
  
      console.log("Fetched messages:", response.data); // Debugging log
      setMessages(response.data); // Update messages state with fetched data
    } catch (error) {
      console.error("Error fetching messages:", error.response?.data || error.message);
    }
  };
  
  // Fetch messages when a chat member is selected or on refresh
  useEffect(() => {
    if (selectedChatMember) {
      fetchMessages(selectedChatMember.userRefId); // Use userRefId of the selected chat member
    }
  }, [selectedChatMember]);
  
  // Fetch messages on component load if a chat member is already selected
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && selectedChatMember) {
      fetchMessages(selectedChatMember.userRefId); // Fetch messages on user login or refresh
    }
  }, [userId, selectedChatMember]);
  
  // Fetch all messages for the logged-in user on login
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      fetchMessages(user._id); // Fetch all messages for the logged-in user
    }
  }, [userId]);
  
  const handleSendMessage = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user ? user._id : null;
  
    if (newMessage.trim() && selectedChatMember && userId) {
      const message = {
        senderId: userId,
        receiverId: selectedChatMember.userRefId,
 // Ensure userId of the selected team member is used
        text: newMessage,
      };
  
      // Emit the message via WebSocket
      if (socket) {
        socket.emit("sendMessage", message);
      }
  
      // Update local messages
      setMessages((prevMessages) => [...prevMessages, { ...message, timestamp: new Date() }]);
      setNewMessage(""); // Clear the input field
    } else {
      alert("Please enter a valid message and select a recipient.");
    }
  };

  // Automatically set the selectedChatMember to the sender if there are undelivered messages
useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  if (userId && messages.length > 0 && !selectedChatMember) {
    // Find the first message where the logged-in user is the receiver
    const firstMessage = messages.find((msg) => msg.receiverId === userId);
    if (firstMessage) {
      const sender = teamMembers.find((member) => member.userRefId === firstMessage.senderId);
      if (sender) {
        setSelectedChatMember(sender); // Automatically set the sender as the selectedChatMember
      }
    }
  }
}, [messages, selectedChatMember, teamMembers]);

// Filter messages to show only those between the logged-in user and the selected member
const filteredMessages = messages.filter((msg) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id?.toString(); // Ensure userId is a string
  const sender = msg.senderId?.toString(); // Ensure senderId is a string
  const receiver = msg.receiverId?.toString(); // Ensure receiverId is a string
  const chatMemberUserId = selectedChatMember?.userRefId?.toString(); // Use userRefId of the selected team member

  // Show messages where the logged-in user is either the sender or receiver
  const isBetweenUsers =
    sender &&
    receiver &&
    chatMemberUserId &&
    ((sender === userId && receiver === chatMemberUserId) || (sender === chatMemberUserId && receiver === userId));

  return isBetweenUsers;
});
  

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

  const handleAddMember = async () => {
    try {
      const token = getToken();
      if (!token) {
        alert("Your session has expired. Please log in again.");
        navigate("/login");
        return;
      }
  
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        "/team-members",
        { name: newMemberName, email: newMemberEmail, projectId },
        config
      );
  
      setTeamMembers((prev) => [...prev, response.data]); // Add the new member to the list
      setIsAddMemberModalOpen(false); // Close the modal
      setNewMemberName(""); // Reset the input fields
      setNewMemberEmail("");
    } catch (error) {
      console.error("Error adding team member:", error);
      alert(`Failed to add team member: ${error.response?.data?.message || error.message}`);
    }
  };


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

      {/* Chat Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Team Chat</h2>
        <div className="flex gap-6">
          {/* Team Members List */}
          <div className="w-1/4 bg-gray-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Team Members</h3>
            <ul className="space-y-2">
              {teamMembers.map((member) => (
                <li
                  key={member._id}
                  className={`p-2 bg-white rounded-lg shadow-sm flex items-center gap-2 cursor-pointer ${
                    selectedChatMember?._id === member._id ? "bg-blue-100" : ""
                  }`}
                  onClick={() => setSelectedChatMember(member)}
                >
                  <span className="font-medium">{member.name}</span>
                  <span className="text-sm text-gray-500">({member.email})</span>
                </li>
              ))}
            </ul>
            {/* Add Member Button */}
            <div className="flex justify-end mb-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                onClick={() => setIsAddMemberModalOpen(true)}
              >
                Add Team Member
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1">
            {selectedChatMember ? (
              <>
                <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4">
                  {filteredMessages.length > 0 ? (
                    filteredMessages.map((message, index) => {
                      // Find the sender's name from the teamMembers list
                      const sender = teamMembers.find((member) => member.userRefId === message.senderId);
                      const senderName = sender ? sender.name : "Unknown";
          
                      return (
                        <div key={index} className="mb-2">
                          <span className="font-bold">
                            {message.senderId === userId ? "You" : senderName}:
                          </span>{" "}
                          {message.text}
                          <div className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-grow border rounded px-3 py-2"
                    placeholder={`Message ${selectedChatMember.name}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    onClick={handleSendMessage}
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Select a team member to start chatting.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Add Team Member</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Enter member name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Enter member email"
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-lg mr-2"
                onClick={() => setIsAddMemberModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={handleAddMember}
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;

