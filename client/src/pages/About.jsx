import React from "react";

const About = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-10">
      <h1 className="text-center text-4xl font-bold mb-8 text-blue-500">
        About CollabEase
      </h1>
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Welcome to <span className="font-semibold text-blue-500">CollabEase</span>, 
          your ultimate project management solution. Our platform is designed to help teams 
          collaborate efficiently, track progress, and achieve their goals seamlessly. 
          Whether you're managing a small team or a large organization, CollabEase provides 
          the tools you need to stay organized and productive.
        </p>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Key Features:</h2>
        <ul className="list-disc list-inside text-gray-700 mb-6">
          <li>Task assignment and tracking</li>
          <li>Real-time collaboration</li>
          <li>Progress monitoring and reporting</li>
          <li>Team management and communication</li>
        </ul>
        <p className="text-lg text-gray-700 leading-relaxed">
          At CollabEase, we believe in empowering teams to work smarter, not harder. 
          Our intuitive interface and powerful features make project management a breeze, 
          so you can focus on what truly matters—delivering exceptional results.
        </p>
      </div>
    </div>
  );
};

export default About;