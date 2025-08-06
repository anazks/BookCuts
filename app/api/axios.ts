import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// import { getToken } from './Utils/Storage'; 
// Ensure this path is correct based on your project structure
// import { getToken } from '../utils/storage';

const axiosInstance = axios.create({
  // https://bookmycuts.onrender.com
  // http://localhost:3002/api/
  // https://e4d54b45f914.ngrok-free.app 
  baseURL: 'https://e4d54b45f914.ngrok-free.app/api/', // ⬅️ Replace with your real API base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

export default axiosInstance;
