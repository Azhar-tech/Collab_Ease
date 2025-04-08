import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSignupClick = () => {
    navigate('/signup', { state: { email } });
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button onClick={handleSignupClick}>Sign Up</button>
    </div>
  );
};

export default HomePage;
