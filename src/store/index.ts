import { create } from 'zustand';

interface AppState {
  user: null | { id: string; name: string; email?: string; role: string };
  token: string | null;
  setUser: (user: any, token?: string) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => {
    if (token) {
      localStorage.setItem('gvb_token', token);
      set({ user, token });
    } else {
      set({ user });
    }
  },
  logout: () => {
    localStorage.removeItem('gvb_user');
    localStorage.removeItem('gvb_token');
    set({ user: null, token: null });
  },
}));
