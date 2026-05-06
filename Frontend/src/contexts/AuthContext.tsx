/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, login as loginApi, registerFaculty, registerStudent, type AuthResponse, type FacultyRegisterPayload, type StudentRegisterPayload, type UserProfile } from "@/api/api";

type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  registerFaculty: (payload: FacultyRegisterPayload) => Promise<AuthResponse>;
  registerStudent: (payload: StudentRegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function persistAuth(auth: AuthResponse) {
  localStorage.setItem("vignan_access_token", auth.access_token);
  localStorage.setItem("vignan_user", JSON.stringify(auth.user));
}

function clearAuth() {
  localStorage.removeItem("vignan_access_token");
  localStorage.removeItem("vignan_user");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("vignan_access_token"));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem("vignan_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await getCurrentUser();
        if (!active) return;
        setUser(me.user);
        localStorage.setItem("vignan_user", JSON.stringify(me.user));
      } catch {
        if (!active) return;
        clearAuth();
        setToken(null);
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      active = false;
    };
  }, [token]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login: async (email, password) => {
      const auth = await loginApi(email, password);
      persistAuth(auth);
      setToken(auth.access_token);
      setUser(auth.user);
      return auth;
    },
    registerFaculty: async (payload) => {
      const auth = await registerFaculty(payload);
      persistAuth(auth);
      setToken(auth.access_token);
      setUser(auth.user);
      return auth;
    },
    registerStudent: async (payload) => {
      const auth = await registerStudent(payload);
      persistAuth(auth);
      setToken(auth.access_token);
      setUser(auth.user);
      return auth;
    },
    logout: () => {
      clearAuth();
      setToken(null);
      setUser(null);
    },
  }), [loading, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
