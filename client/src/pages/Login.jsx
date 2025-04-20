import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:8001/login', {
        email,
        password,
      });
  
      console.log("Login response:", response.data);
  
      const { token, projectIds, user } = response.data;
  
      // Check if user data is received
      if (!user) {
        throw new Error("User data missing from response");
      }
  
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); // store user
  
      if (projectIds.length > 0) {
        navigate(`/projects/${projectIds[0]}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.msg || err.message || 'Something went wrong.');
    }
  };
  
  

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-10 w-[800px] rounded-lg shadow-md max-w-sm">
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
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
            Login
          </button>
          <p className="text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Signup here
            </Link>
          </p>
          <p className="text-blue-500 cursor-pointer text-sm text-center" onClick={() => navigate('/forgot-password')}>
            Forgot Password?
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;