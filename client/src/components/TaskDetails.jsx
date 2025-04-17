import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const TaskDetails = ({ userId }) => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [file, setFile] = useState(null);

  const fetchTaskDetails = async () => {
    try {
      const token = localStorage.getItem("token"); // Retrieve the token from localStorage
      if (!token) {
        navigate('/login'); // Redirect to login if no token is found
        return;
      }

      const { data } = await axios.get(`/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }, // Add the Authorization header
      });
      setTask(data);
    } catch (error) {
      console.error('Error fetching task details:', error);
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        navigate('/login'); // Redirect to login on 401 error
      }
    }
  };

  const handleAddComment = async () => {
    try {
      const token = localStorage.getItem("token"); // Ensure token is included
      if (!token) {
        navigate('/login'); // Redirect to login if no token is found
        return;
      }

      const { data } = await axios.post(
        `/tasks/${taskId}/comments`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } } // Add Authorization header
      );

      setTask(data); // Update task with the updated data from the backend
      setNewComment(''); // Clear the comment input
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleFileUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('files', file); // Ensure the field name matches the backend ('files')

      const { data } = await axios.put(`/tasks/${taskId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTask(data); // Update task with uploaded file(s)
      setFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const { data } = await axios.put(`/tasks/${taskId}`, { status: newStatus });
      setTask(data);
      alert(`Task moved to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}.`);
    } catch (error) {
      console.error(`Error moving task to ${newStatus}:`, error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert(`Failed to move task to ${newStatus}.`);
      }
    }
  };
  
const handleMoveToInProgress = async () => {
  try {
    const token = localStorage.getItem("token");
    const { data } = await axios.put(
      `/tasks/${taskId}`,
      { status: 'in-progress' },
      { headers: { Authorization: `Bearer ${token}` } } // Make sure token is passed
    );
    setTask(data);
    alert('Task moved to In Progress.');
  } catch (error) {
    console.error('Error moving task to in-progress:', error);
    if (error.response?.data?.message) {
      alert(error.response.data.message); // ✅ Show backend error message
    } else {
      alert('Failed to move task to In Progress.');
    }
  }
};


  const handleDeleteTask = async () => {
    try {
      await axios.delete(`/tasks/${taskId}`);
      navigate(-1); // Go back to the previous page
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  if (!task) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-purple-100 to-blue-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8">
        {/* Task Details Heading */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-blue-950 mb-4">Task Details</h1>
          <p className="text-lg font-semibold text-gray-600">Status: <span className="text-blue-600">{task.status}</span></p>
        </div>

        {/* Task Name and Description */}
        <div className=" flex justify-center items-center gap-3 ">
          <h2 className="text-3xl font-bold text-blue-950 mb-2">Task Name:</h2>
          <p className="text-xl  text-gray-700">{task.task_name}</p>
          
        </div>
        <div className="flex justify-center items-center gap-3">
        <h2 className="text-3xl font-bold text-blue-950 ">Task Description:</h2>
        <p className="text-lg text-gray-600">{task.task_description}</p>
        </div>
  
        {/* Comments Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">💬 Comments</h2>
          <ul className="space-y-3">
            {task.comments.map((comment, index) => (
              <li key={index} className="bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-200">
                <strong className="text-purple-700">{comment.author}:</strong> {comment.text}
              </li>
            ))}
          </ul>
          <textarea
            className="w-full mt-4 border border-purple-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="3"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          <button
            onClick={handleAddComment}
            className="mt-2 bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-all"
          >
            Post Comment
          </button>
        </div>
  
        {/* Files Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">📁 Uploaded Files</h2>
          {task.files && task.files.length > 0 ? (
            <ul className="space-y-2">
              {task.files.map((filePath, index) => {
                const fileName = filePath.split('/').pop();
                return (
                  <li key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-300 flex justify-between items-center">
                    <a
                      href={`http://localhost:8001/${filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {fileName}
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="italic text-gray-500">No files uploaded yet.</p>
          )}
  
          <div className="mt-4">
            <input
              type="file"
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button
              onClick={handleFileUpload}
              className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-green-600 transition-all"
            >
              Upload
            </button>
          </div>
        </div>
  
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-4">
          {task.status === 'completed' ? (
            <button
              onClick={handleDeleteTask}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Delete Task
            </button>
          ) : (
            <>
              {task.status === 'in-progress' && (
                <select
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onChange={(e) => handleStatusChange(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Move Task To...</option>
                  <option value="review">Review</option>
                  <option value="pending">Pending</option>
                </select>
              )}
  
              {task.status === 'pending' && (
                <button
                  onClick={handleMoveToInProgress}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Move to In Progress
                </button>
              )}

              {task.status === 'review' && (
                <button
                  onClick={handleMoveToInProgress}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Move to In Progress
                </button>
              )}

{task.status === 'review' &&  (
  <button
    onClick={() => handleStatusChange('complete')}
    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
  >
    Move to Complete
  </button>
)}

  
              {task.status !== 'review' && task.status !== 'in-progress' && (
                <button
                  onClick={handleStatusChange.bind(null, 'review')}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                >
                  Move to Review
                </button>
              )}
  
              <button
                onClick={handleDeleteTask}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Delete Task
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}  

export default TaskDetails;
