"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "./auth-types";
import {
  getAuthApiUrl,
  getStoredToken,
  setStoredToken,
  login as apiLogin,
  register as apiRegister,
} from "./auth-api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthEnabled: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthEnabled = !!getAuthApiUrl();

  const loadUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token || !getAuthApiUrl()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { fetchProfile } = await import("./profile-api");
      const profile = await fetchProfile();
      if (profile) setUser({ id: profile.id, email: profile.email });
      else setUser(null);
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiLogin(email, password);
      setStoredToken(data.token);
      setUser(data.user);
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const data = await apiRegister(email, password);
      setStoredToken(data.token);
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    isAuthEnabled,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
