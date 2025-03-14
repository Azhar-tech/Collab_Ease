import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import Modal from '../components/Model'; // Ensure the correct path and spelling
import ProjectForm from '../components/ProjectForm'; // Ensure the correct path and spelling
import TeamMemberForm from '../components/TeamMemberForm'; // Ensure the correct path and spelling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

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
    if (!userId) {
      setTeamMembers([]); // Clear team members list when userId changes
      return;
    }

    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get('/team-members', { params: { userId } });
        setTeamMembers(response.data);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, [userId]);

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

  const handleMemberCreated = (newMember) => {
    setTeamMembers([...teamMembers, newMember]);
    setIsTeamMemberModalOpen(false);
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
    <div className="min-h-screen bg-gray-100">
      <div className='mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-3 flex justify-between items-center'>
        <h1 className="text-3xl font-bold mx-auto text-white">Project Management Software</h1>
        <div className="relative">
          <button
            className="bg-gray-700 text-white px-4 py-2 rounded-lg"
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
          className="bg-purple-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-purple-700"
          onClick={() => setIsProjectModalOpen(true)}
        >
          Create New Project
        </button>
        <button
          className="bg-pink-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-pink-700"
          onClick={() => setIsTeamMemberModalOpen(true)}
        >
          Create New Team Member
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Projects</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr className='bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white'>
              <th className="py-2">Project Name</th>
              <th className="py-2">Description</th>
              <th className="py-2">Start Date</th>
              <th className="py-2">End Date</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project._id} className="cursor-pointer text-center">
                <td className="border px-4 py-2" onClick={() => navigate(`/projects/${project._id}`)}>{project.project_name}</td>
                <td className="border px-4 py-2" onClick={() => navigate(`/projects/${project._id}`)}>{project.project_description}</td>
                <td className="border px-4 py-2" onClick={() => navigate(`/projects/${project._id}`)}>{new Date(project.project_start).toLocaleDateString()}</td>
                <td className="border px-4 py-2" onClick={() => navigate(`/projects/${project._id}`)}>{new Date(project.project_end_date).toLocaleDateString()}</td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded-lg mr-2 hover:bg-yellow-700"
                    onClick={() => handleEditClick(project)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-700"
                    onClick={() => handleDeleteClick(project._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr className='bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white'>
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member._id} className="text-center">
                <td className="border px-4 py-2">{member.name}</td>
                <td className="border px-4 py-2">{member.email}</td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded-lg mr-2 hover:bg-yellow-700"
                    onClick={() => handleEditMemberClick(member)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-700"
                    onClick={() => handleDeleteMemberClick(member._id)}
                  >
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


