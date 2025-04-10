import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

const Signup = () => {
  const location = useLocation(); // Get the state passed from Home
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState(location.state?.email || ''); // Set email from state
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:8001/signup', {
        name,
        email,
        password,
      });
  
      localStorage.setItem('token', response.data.token);
  
      // ✅ Check if user has assigned tasks and navigate accordingly
      if (response.data.projectIds.length > 0) {
        navigate(`/projects/${response.data.projectIds[0]}`);
      } else {
        navigate('/dashboard'); // Default navigation if no task assigned
      }
    } catch (err) {
      console.error('Signup error:', err.response?.data?.message);
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };
  

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-10 w-[800px] rounded-lg shadow-md max-w-sm">
        <h2 className="text-2xl font-semibold mb-4 text-center">Signup</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label className="block text-lg font-medium mb-2" htmlFor="name">
              Name:
            </label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faUser}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
          <div className="mb-4 relative">
            <label className="block text-lg font-medium mb-2" htmlFor="email">
              Email:
            </label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
          <div className="mb-4 relative">
            <label className="block text-lg font-medium mb-2" htmlFor="password">
              Password:
            </label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faLock}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white text-lg rounded-lg mb-5 hover:bg-blue-600 transition-all"
          >
            Signup
          </button>
          <p className="text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;