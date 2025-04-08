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
      setProjectName('');
      setProjectDescription('');
      setProjectStart('');
      setProjectEndDate('');
    } catch (error) {
      console.error('Error creating/updating project:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='mb-4'>
        <label className='block text-gray-700 text-sm font-bold mb-2'>Project Name</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
        />
      </div>
      <div className='mb-4'>
        <label className='block text-gray-700 text-sm font-bold mb-2'>Description</label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          required
        />
      </div>
      <div className='mb-4'>
        <label className='block text-gray-700 text-sm font-bold mb-2'>Start Date</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="date"
          value={projectStart}
          onChange={(e) => setProjectStart(e.target.value)}
          required
        />
      </div>
      <div className='mb-4'>
        <label className='block text-gray-700 text-sm font-bold mb-2'>End Date</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="date"
          value={projectEndDate}
          onChange={(e) => setProjectEndDate(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          className='bg-blue-500 px-3 py-2 rounded-2xl text-white mr-2'
          type="submit"
        >
          {project ? 'Update Project' : 'Create Project'}
        </button>
        <button
          className='bg-gray-500 px-3 py-2 rounded-2xl text-white'
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
