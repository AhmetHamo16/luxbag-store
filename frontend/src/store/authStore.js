import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.login(credentials);
          set({ user: data.data, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.register(userData);
          set({ user: data.data, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
