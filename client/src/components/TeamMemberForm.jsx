import React, { useState } from 'react';
import axios from '../axiosConfig';

const TeamMemberForm = ({ onMemberCreated, userId, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const memberData = {
      name,
      email,
      user_id: userId, // Include the user ID
    };

    try {
      const response = await axios.post('/team-members', memberData);
      onMemberCreated(response.data);
      setName('');
      setEmail('');
    } catch (error) {
      console.error('Error creating team member:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='mb-4'>
        <label className='block text-gray-700 text-sm font-bold mb-2'>Name</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className='mb-4'>
        <label className='block text-gray-700 text-sm font-bold mb-2'>Email</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          className='bg-blue-500 px-3 py-2 rounded-2xl text-white mr-2'
          type="submit"
        >
          Add Team Member
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

export default TeamMemberForm;