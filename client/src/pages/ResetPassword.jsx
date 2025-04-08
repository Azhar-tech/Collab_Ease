import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:8001/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-10 w-[500px] rounded-lg shadow-md max-w-sm">
        <h2 className="text-xl font-semibold mb-4 text-center">Reset Password</h2>
        {message && <p className="text-center text-blue-500 mb-4">{message}</p>}
        <form onSubmit={handleReset}>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
