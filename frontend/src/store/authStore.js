import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

const getInitialState = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const user = jwtDecode(token).user;
      return { token, user, isAuthenticated: true };
    } catch (error) {
      localStorage.removeItem('token');
    }
  }
  return { token: null, user: null, isAuthenticated: false };
};

export const useAuthStore = create((set) => ({
  ...getInitialState(),

  login: (token) => {
    localStorage.setItem('token', token);
    const user = jwtDecode(token).user;
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
