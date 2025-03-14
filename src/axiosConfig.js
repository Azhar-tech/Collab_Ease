import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8001/api', // Ensure this is correct
});

// Add a request interceptor to include the authorization token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;