import React, { useState } from "react";
import axios from "../axiosConfig"; // Ensure axios is configured properly

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/contact", formData); // Ensure the endpoint matches the backend
      setSuccessMessage(response.data.message);
      setErrorMessage("");
      setFormData({ name: "", email: "", message: "" }); // Reset form
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Something went wrong.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-10">
      <h1 className="text-center text-4xl font-bold mb-8 text-blue-500">
        Contact Us
      </h1>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Have questions or need assistance? We're here to help! Fill out the form below, 
          and our team will get back to you as soon as possible.
        </p>
        {successMessage && (
          <p className="text-green-600 font-medium mb-4">{successMessage}</p>
        )}
        {errorMessage && (
          <p className="text-red-600 font-medium mb-4">{errorMessage}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2" htmlFor="name">
              Name:
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2" htmlFor="email">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2" htmlFor="message">
              Message:
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              rows="5"
              placeholder="Enter your message"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 transition-all"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;