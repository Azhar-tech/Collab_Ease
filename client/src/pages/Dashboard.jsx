import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import Modal from '../components/Model'; // Ensure the correct path and spelling
import ProjectForm from '../components/ProjectForm'; // Ensure the correct path and spelling
import TeamMemberForm from '../components/TeamMemberForm'; // Ensure the correct path and spelling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from '../components/images/logo.png' // Import the logo image
import { faCog, faPlus, faEdit, faTrash, faProjectDiagram, faUsers } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]); // State for team members
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false); // State for team member modal
  const [currentProject, setCurrentProject] = useState(null);
  const [currentMember, setCurrentMember] = useState(null); // State for current team member
  const [userId, setUserId] = useState(null); // State for user ID
  const [userEmail, setUserEmail] = useState(null); // State for user email
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State for settings dropdown
  const [loggedInUserName, setLoggedInUserName] = useState(""); // State for logged-in user's name
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/projects');
        setProjects(response.data);
        if (response.data.length > 0) {
          setCurrentProject(response.data[0]); // Set the first project as the current project
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    const fetchUserId = async () => {
      try {
        const response = await axios.get('/users'); // Ensure this endpoint is correct
        if (response.data.length > 0) {
          const user = response.data[0]; // Assuming you're fetching the first user
          setUserId(user._id);
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error("Error fetching user id:", error);
      }
    };
     

    fetchProjects();
    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId || !currentProject) {
      setTeamMembers([]); // Clear team members list if userId or currentProject is not available
      return;
    }

    const fetchTeamMembers = async () => {
      try {
        console.log('Fetching team members for project:', currentProject); // Debugging log
        const response = await axios.get('/team-members', { params: { projectId: currentProject._id } }); // Use projectId
        console.log('Fetched team members:', response.data); // Debugging log
        setTeamMembers(response.data);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, [userId, currentProject]); // Fetch team members when userId or currentProject changes

  useEffect(() => {
    if (userEmail) {
      const checkAssignedTasks = async () => {
        try {
          const response = await axios.get('/tasks', { params: { email: userEmail } });
          const projectIds = response.data.map(task => task.project_id);
          if (projectIds.length > 0) {
            navigate(`/projects/${projectIds[0]}`);
          }
        } catch (error) {
          console.error('Error checking assigned tasks:', error);
        }
      };

      checkAssignedTasks();
    }
  }, [userEmail, navigate]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")); // Fetch user from localStorage
    if (user) {
      setLoggedInUserName(user.name); // Set the logged-in user's name
    }
  }, []);

  const handleProjectCreated = (newProject) => {
    setProjects([...projects, newProject]);
    setIsProjectModalOpen(false);
  };

  const handleProjectUpdated = (updatedProject) => {
    setProjects(projects.map(project => project._id === updatedProject._id ? updatedProject : project));
    setIsEditModalOpen(false);
  };

  const handleEditClick = (project) => {
    setCurrentProject(project);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (projectId) => {
    try {
      await axios.delete(`/projects/${projectId}`);
      setProjects(projects.filter(project => project._id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleMemberCreated = async (newMember) => {
    try {
      const response = await axios.post('/team-members', {
        ...newMember,
        projectId: currentProject._id, // Associate with the current project
      });
      setTeamMembers([...teamMembers, response.data]);
      setIsTeamMemberModalOpen(false);
    } catch (error) {
      console.error('Error creating team member:', error);
    }
  };

  const handleEditMemberClick = (member) => {
    setCurrentMember(member);
    setIsTeamMemberModalOpen(true);
  };

  const handleDeleteMemberClick = async (memberId) => {
    try {
      await axios.delete(`/team-members/${memberId}`);
      setTeamMembers(teamMembers.filter(member => member._id !== memberId));
    } catch (error) {
      console.error('Error deleting team member:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="mb-6 bg-gray-200 p-5 shadow-lg">
  <div className="flex flex-col md:flex-row justify-between items-center w-full">
    {/* Logo and Settings Button */}
    <div className="flex items-center justify-between w-full md:w-auto">
      <img
        src={logo}
        alt="Logo"
        className="h-auto max-h-16 object-contain"
      />
      <div className="relative md:hidden">
        <button
          className="bg-gray-300 text-blue-500 text-sm px-4 py-2 rounded-lg hover:bg-gray-400 transition-all"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        >
          {loggedInUserName}
        </button>

        {isSettingsOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
            <p className="block w-full text-left px-4 py-2 text-gray-700">
              Logged in as: <strong>{loggedInUserName}</strong>
            </p>
            <button
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Heading */}
    <h1 className="text-xl md:text-3xl font-bold text-blue-950 text-center flex items-center mt-3 md:mt-0">
      <FontAwesomeIcon icon={faProjectDiagram} className="mr-2 text-gray-600" />
      Project Management Dashboard
    </h1>

    {/* Settings Button for Desktop */}
    <div className="relative hidden md:block">
      <button
        className="bg-gray-300 text-blue-500 text-sm md:text-base px-4 py-2 rounded-lg hover:bg-gray-400 transition-all"
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
      >
        {loggedInUserName}
      </button>

      {isSettingsOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
          <p className="block w-full text-left px-4 py-2 text-gray-700">
            Logged in as: <strong>{loggedInUserName}</strong>
          </p>
          <button
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  </div>
</div>

      <div className="flex justify-end mb-4">
        <button
          className="bg-yellow-300 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-yellow-400 flex items-center"
          onClick={() => setIsProjectModalOpen(true)}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Create New Project
        </button>
        
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FontAwesomeIcon icon={faProjectDiagram} className="mr-2 " />
          Projects
        </h2>
        <table className="min-w-full bg-white border-none ">
          <thead>
            <tr className="bg-blue-950 text-white">
              <th className="py-2 px-4 border">Project Name</th>
              <th className="py-2 px-4 border">Description</th>
              <th className="py-2 px-4 border">Start Date</th>
              <th className="py-2 px-4 border">End Date</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project._id}
                className="text-center hover:bg-yellow-100 cursor-pointer odd:bg-white even:bg-gray-100"
                onClick={() => navigate(`/projects/${project._id}`)} // Navigate to ProjectDetails
              >
                <td className="px-4 py-2">{project.project_name}</td>
                <td className="px-4 py-2">{project.project_description}</td>
                <td className="px-4 py-2">{new Date(project.project_start).toLocaleDateString()}</td>
                <td className="px-4 py-2">{new Date(project.project_end_date).toLocaleDateString()}</td>
                <td className="px-4 py-2 flex justify-center">
                  <button
                    className="bg-blue-950 text-white px-2 py-1 rounded-lg mr-2 hover:bg-yellow-500 flex items-center"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering row click
                      handleEditClick(project);
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                    Edit
                  </button>
                  <button
                    className="bg-blue-950 text-white px-2 py-1 rounded-lg hover:bg-red-400 flex items-center"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering row click
                      handleDeleteClick(project._id);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4">Create Project</h2>
        <ProjectForm
          onProjectCreated={handleProjectCreated}
          userId={userId}
          onCancel={() => setIsProjectModalOpen(false)}
        />
      </Modal>
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4">Edit Project</h2>
        <ProjectForm
          project={currentProject}
          onProjectUpdated={handleProjectUpdated}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
      <Modal isOpen={isTeamMemberModalOpen} onClose={() => setIsTeamMemberModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4">{currentMember ? 'Edit Team Member' : 'Create Team Member'}</h2>
        <TeamMemberForm
          member={currentMember}
          onMemberCreated={handleMemberCreated}
          userId={userId}
          onCancel={() => setIsTeamMemberModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;


