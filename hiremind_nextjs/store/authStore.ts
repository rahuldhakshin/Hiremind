import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "student" | "recruiter" | "placement_officer" | "admin";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  profile_picture?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, access: string, refresh: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, access, refresh) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("jq_access_token", access);
          localStorage.setItem("jq_refresh_token", refresh);
        }
        set({ user, accessToken: access, refreshToken: refresh, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("jq_access_token");
          localStorage.removeItem("jq_refresh_token");
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "jq-auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Role-based redirect helper
export const getRoleRedirect = (role: UserRole): string => {
  switch (role) {
    case "student": return "/student";
    case "recruiter": return "/recruiter";
    case "placement_officer": return "/officer";
    case "admin": return "/admin";
    default: return "/login";
  }
};
