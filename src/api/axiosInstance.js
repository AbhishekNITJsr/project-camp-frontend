// File: src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  // Change port 8000 if your backend runs on a different port
  baseURL: 'https://project-camp-backend-tvm4.onrender.com/',
  withCredentials: true,
});

// Automatically attach the JWT token to requests if it exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;