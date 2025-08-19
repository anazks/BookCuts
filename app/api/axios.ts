import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const axiosInstance = axios.create({
  // https://bookmycuts.onrender.com
  // http://localhost:3002/api/

  // baseURL: 'https://d3e694c8ba7a.ngrok-free.app/api/', 
  baseURL: ' https://0611c0c2ace3.ngrok-free.app/api/',
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
