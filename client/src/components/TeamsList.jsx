import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const TeamsList = () => {
  const [teams, setTeams] = useState([]);
  const [userId, setUserId] = useState(null);
  const [newMember, setNewMember] = useState('');

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get('/user'); // Replace with the actual endpoint to fetch user ID
        setUserId(response.data._id);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []); // Run only once on component mount

  useEffect(() => {
    if (userId) {
      const fetchTeams = async () => {
        try {
          const response = await axios.get('/team-members'); // Fetch only the logged-in user's team members
          setTeams(response.data);
        } catch (error) {
          console.error('Error fetching teams:', error);
        }
      };
  
      fetchTeams();
    }
  }, [userId]); // Fetch only when userId is available
   // Run when userId changes

  const handleAddMember = async (teamId) => {
    try {
      await axios.post(`/teams/${teamId}/members`, { memberId: newMember }); // Replace with the actual endpoint to add a member
      setNewMember('');
      // Refresh the teams list
      const response = await axios.get('/teams'); // Replace with the actual endpoint to fetch teams
      setTeams(response.data.filter(team => team.userId === userId));
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  return (
    <div>
      <h2>Your Teams</h2>
      <ul>
        {teams.map(team => (
          <li key={team._id}>
            {team.name}
            <input
              type="text"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              placeholder="New member ID"
            />
            <button onClick={() => handleAddMember(team._id)}>Add Member</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamsList;
