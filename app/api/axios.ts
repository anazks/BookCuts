import axios from 'axios';
// import { getToken } from './Utils/Storage'; 
// Ensure this path is correct based on your project structure
// import { getToken } from '../utils/storage';

const axiosInstance = axios.create({
  baseURL: 'https://bookmycuts.onrender.com/api/', // ⬅️ Replace with your real API base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


export default axiosInstance;
