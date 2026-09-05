"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  apiClient,
  setAuthTokenGetter,
  setAuthTokenSetter,
  setOnUnauthorizedCallback,
} from "@/lib/api/client";
import type { User, AuthResponse } from "@/types/api";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
}

export interface GoogleAuthPayload {
  googleId?: string;
  credential?: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUser: (updatedFields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const tokenRef = useRef<string | null>(null);
  tokenRef.current = accessToken;

  // Helper to persist or clear user cache in cookie and localStorage
  const persistUser = useCallback((userData: User | null) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      try {
        if (userData) {
          const minimal = {
            id: userData.id,
            fullName: userData.fullName,
            email: userData.email,
            role: userData.role,
            avatarUrl: userData.avatarUrl || null,
          };
          localStorage.setItem("eduhub_auth_user", JSON.stringify(userData));
          document.cookie = `eduhub_user=${encodeURIComponent(JSON.stringify(minimal))}; path=/; max-age=2592000; SameSite=Lax`;
        } else {
          localStorage.removeItem("eduhub_auth_user");
          document.cookie = "eduhub_user=; path=/; max-age=0; SameSite=Lax";
        }
      } catch {
        // Ignore localStorage quota/access errors
      }
    }
  }, []);

  // Sync token getter and setter with apiClient
  useEffect(() => {
    setAuthTokenGetter(() => tokenRef.current);
    setAuthTokenSetter((newToken) => {
      tokenRef.current = newToken;
      setAccessToken(newToken);
    });
    setOnUnauthorizedCallback(() => {
      tokenRef.current = null;
      setAccessToken(null);
      persistUser(null);
    });
  }, [persistUser]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const refreshRes = await apiClient.post<{ accessToken: string }>("/auth/refresh", {
        skipAuth: true,
      });

      const newToken = refreshRes.data?.accessToken;
      if (newToken) {
        tokenRef.current = newToken;
        setAccessToken(newToken);

        const profileRes = await apiClient.get<User>("/auth/me");
        if (profileRes.data) {
          persistUser(profileRes.data);
          return true;
        }
      }
      return false;
    } catch {
      tokenRef.current = null;
      setAccessToken(null);
      persistUser(null);
      return false;
    }
  }, [persistUser]);

  // Bootstrap session on mount
  useEffect(() => {
    let mounted = true;

    // Synchronously hydrate cached user snapshot on client mount if not already populated
    try {
      const saved = localStorage.getItem("eduhub_auth_user");
      if (saved && mounted) {
        const parsed = JSON.parse(saved);
        setUser((prev) => prev || parsed);
        if (typeof document !== "undefined" && !document.cookie.includes("eduhub_user=")) {
          const minimal = {
            id: parsed.id,
            fullName: parsed.fullName,
            email: parsed.email,
            role: parsed.role,
            avatarUrl: parsed.avatarUrl || null,
          };
          document.cookie = `eduhub_user=${encodeURIComponent(JSON.stringify(minimal))}; path=/; max-age=2592000; SameSite=Lax`;
        }
      }
    } catch {
      // Ignore
    }

    async function initAuth() {
      setIsLoading(true);
      await refreshSession();
      if (mounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, [refreshSession]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", {
      body: credentials,
      skipAuth: true,
    });

    const authData = response.data;
    tokenRef.current = authData.accessToken;
    setAccessToken(authData.accessToken);
    persistUser(authData.user);
    return authData;
  }, [persistUser]);

  const loginWithGoogle = useCallback(async (payload: GoogleAuthPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/google", {
      body: payload,
      skipAuth: true,
    });

    const authData = response.data;
    tokenRef.current = authData.accessToken;
    setAccessToken(authData.accessToken);
    persistUser(authData.user);
    return authData;
  }, [persistUser]);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<User> => {
    const response = await apiClient.post<User>("/auth/register", {
      body: credentials,
      skipAuth: true,
    });
    return response.data;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore network / token error on logout
    } finally {
      tokenRef.current = null;
      setAccessToken(null);
      persistUser(null);
    }
  }, [persistUser]);

  const updateUser = useCallback((updatedFields: Partial<User>) => {
    setUser((prev) => {
      const updated = prev ? { ...prev, ...updatedFields } : null;
      if (typeof window !== "undefined") {
        try {
          if (updated) {
            localStorage.setItem("eduhub_auth_user", JSON.stringify(updated));
          } else {
            localStorage.removeItem("eduhub_auth_user");
          }
        } catch {
          // Ignore
        }
      }
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      isLoading,
      login,
      loginWithGoogle,
      register,
      logout,
      refreshSession,
      updateUser,
    }),
    [user, accessToken, isLoading, login, loginWithGoogle, register, logout, refreshSession, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
