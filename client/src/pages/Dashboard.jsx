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
    // Perform logout logic here, e.g., clearing tokens, etc.
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="mb-6 bg-gray-200  p-5 flex justify-between items-center shadow-lg">
         <img
                    src={logo} // Updated src to point to the logo image
                    alt="Logo"
                    className="h-auto max-h-20  object-contain" // Adjust height and width dynamically
                  />
        <h1 className="text-3xl font-bold text-blue-950 flex items-center">
          <FontAwesomeIcon icon={faProjectDiagram} className="mr-3 text-gray-600" />
          Project Management Dashboard
        </h1>
        <div className="relative">
          <button
            className="bg-gray-300 text-blue-500 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <FontAwesomeIcon icon={faCog} />
          </button>
          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
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

      <div className="flex justify-end mb-4">
        <button
          className="bg-yellow-300 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-yellow-400 flex items-center"
          onClick={() => setIsProjectModalOpen(true)}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Create New Project
        </button>
        <button
          className="bg-orange-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-orange-400 flex items-center"
          onClick={() => setIsTeamMemberModalOpen(true)}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Team Member
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

      <div className="bg-white p-6 rounded-lg shadow-md mt-6 overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FontAwesomeIcon icon={faUsers} className="mr-2 " />
          Team Members
        </h2>
        <table className="min-w-full bg-white border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-950 text-white">
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr
                key={member._id}
                className="text-center hover:bg-yellow-100 odd:bg-white even:bg-gray-100"
              >
                <td className="px-4 py-2">{member.name}</td>
                <td className="px-4 py-2">{member.email}</td>
                <td className="px-4 py-2 flex justify-center">
                  <button
                    className="bg-blue-950 text-white px-2 py-1 rounded-lg mr-2 hover:bg-yellow-500 flex items-center"
                    onClick={() => handleEditMemberClick(member)}
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                    Edit
                  </button>
                  <button
                    className="bg-blue-950 text-white px-2 py-1 rounded-lg hover:bg-red-400 flex items-center"
                    onClick={() => handleDeleteMemberClick(member._id)}
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


