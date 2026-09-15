import axios from 'axios';
import { logger } from './logger';

/**
 * Returns the resolved API base URL.
 * Prioritizes VITE_API_BASE_URL if set.
 * In development, defaults to local backend http://localhost:5000.
 * In production, defaults to deployed Render backend https://linkedin-analyzer-4.onrender.com.
 */
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return import.meta.env.DEV ? 'http://localhost:5000' : 'https://linkedin-analyzer-4.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error('API request failed:', error?.response?.data || error?.message);
    return Promise.reject(error);
  }
);

export default api;
