import React, { useState } from 'react';
import axios from '../axiosConfig';

const ProjectForm = ({ onProjectCreated, onProjectUpdated, project, userId, onCancel }) => {
  const [projectName, setProjectName] = useState(project ? project.project_name : '');
  const [projectDescription, setProjectDescription] = useState(project ? project.project_description : '');
  const [projectStart, setProjectStart] = useState(project ? project.project_start : '');
  const [projectEndDate, setProjectEndDate] = useState(project ? project.project_end_date : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const projectData = {
      project_name: projectName,
      project_description: projectDescription,
      project_start: projectStart,
      project_end_date: projectEndDate,
      user_id: userId, // Include the user ID
    };

    try {
      if (project) {
        const response = await axios.put(`/projects/${project._id}`, projectData);
        onProjectUpdated(response.data);
      } else {
        const response = await axios.post('/projects', projectData);
        onProjectCreated(response.data);
      }
    } catch (error) {
      console.error('Error creating/updating project:', error);
    }
  };

  const handleCancel = () => {
    setProjectName('');
    setProjectDescription('');
    setProjectStart('');
    setProjectEndDate('');
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projectName">
          Project Name
        </label>
        <input
          type="text"
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projectDescription">
          Project Description
        </label>
        <textarea
          id="projectDescription"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projectStart">
          Start Date
        </label>
        <input
          type="date"
          id="projectStart"
          value={projectStart}
          onChange={(e) => setProjectStart(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projectEndDate">
          End Date
        </label>
        <input
          type="date"
          id="projectEndDate"
          value={projectEndDate}
          onChange={(e) => setProjectEndDate(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {project ? 'Update Project' : 'Create Project'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;