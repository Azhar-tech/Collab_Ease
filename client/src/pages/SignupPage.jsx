import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const SignupPage = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');

  return (
    <div>
      <form>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        {/* ...existing code... */}
      </form>
    </div>
  );
};

export default SignupPage;
