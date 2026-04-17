import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (data) => api.post('/api/auth/register', data),
};

export const chatAPI = {
  getHistory: () => api.get('/api/chats/history'),
  getChat: (id) => api.get(`/api/chats/${id}`),
  deleteChat: (id) => api.delete(`/api/chats/${id}`),
  sendMessage: (payload) => api.post('/api/chat', payload),
  simplifyText: (payload) => api.post('/api/simplify', payload),
  sendFeedback: (payload) => api.post('/api/feedback', payload),
};

export const documentAPI = {
  generateDocument: (payload) => api.post('/api/generate-document', payload),
};

export const userAPI = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data) => api.put('/api/user/profile', data),
  updateAvatar: (data) => api.post('/api/user/avatar', data),
};

export default api;
