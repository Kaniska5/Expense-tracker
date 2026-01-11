import { create } from 'zustand';
import { User } from '@/types';
import { getCurrentUser } from '@/services/authService';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialize = () => {
    set({ loading: true });
    // Check if user is logged in from session storage
    const currentUser = getCurrentUser();
    set({
      user: currentUser,
      loading: false,
      initialized: true,
    });
  };

  return {
    user: null,
    loading: true,
    initialized: false,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    initialize,
  };
});
