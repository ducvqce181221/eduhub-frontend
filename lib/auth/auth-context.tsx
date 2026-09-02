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

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUser: (updatedFields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const tokenRef = useRef<string | null>(null);
  tokenRef.current = accessToken;

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
      setUser(null);
    });
  }, []);

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
          setUser(profileRes.data);
          return true;
        }
      }
      return false;
    } catch {
      tokenRef.current = null;
      setAccessToken(null);
      setUser(null);
      return false;
    }
  }, []);

  // Bootstrap session on mount
  useEffect(() => {
    let mounted = true;

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
    setUser(authData.user);
    return authData;
  }, []);

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
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updatedFields: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      isLoading,
      login,
      register,
      logout,
      refreshSession,
      updateUser,
    }),
    [user, accessToken, isLoading, login, register, logout, refreshSession, updateUser],
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
