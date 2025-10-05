import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: 'https://helpdesk-mini-aneq.onrender.com/',
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getTickets = async () => {
  try {
    const response = await api.get('/tickets');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createTicket = async (ticketData) => {
  try {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getTicketById = async (ticketId) => {
  try {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const addComment = async (ticketId, commentData) => {
  try {
    const response = await api.post(
      `/tickets/${ticketId}/comments`,
      commentData
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default api;
