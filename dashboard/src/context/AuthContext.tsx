"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Cookies from "js-cookie";
import { APP_STORAGE_KEYS } from "@/lib/config";
import { loginAdmin, fetchAdminProfile } from "@/services/auth";
import { AdminProfile } from "@/types/api";

const COOKIE_OPTIONS = { path: "/", sameSite: "lax" as const };

interface AuthContextValue {
  token: string | null;
  admin: AdminProfile | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getStoredValue = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  const raw = Cookies.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = Cookies.get(APP_STORAGE_KEYS.token) ?? null;
    const storedAdmin = getStoredValue<AdminProfile>(APP_STORAGE_KEYS.admin);
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedAdmin) {
      setAdmin(storedAdmin);
    }
    setLoading(false);
  }, []);

  const persistSession = useCallback((nextToken: string, profile: AdminProfile) => {
    setToken(nextToken);
    setAdmin(profile);
    if (typeof window !== "undefined") {
      Cookies.set(APP_STORAGE_KEYS.token, nextToken, COOKIE_OPTIONS);
      Cookies.set(APP_STORAGE_KEYS.admin, JSON.stringify(profile), COOKIE_OPTIONS);
    }
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setAdmin(null);
    if (typeof window !== "undefined") {
      Cookies.remove(APP_STORAGE_KEYS.token, { path: "/" });
      Cookies.remove(APP_STORAGE_KEYS.admin, { path: "/" });
    }
  }, []);

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      setLoading(true);
      try {
        const response = await loginAdmin(payload);
        const nextToken =
          (response.data && response.data.token) ||
          (response as unknown as { token?: string }).token;
        const nextAdmin =
          (response.data && response.data.admin) ||
          (response as unknown as { admin?: AdminProfile }).admin;

        if (!nextToken || !nextAdmin) {
          throw new Error("Invalid login response");
        }

        persistSession(nextToken, nextAdmin);
        
        // Refresh profile to get full data including profileImage
        if (nextToken) {
          try {
            const profileResponse = await fetchAdminProfile(nextToken);
            if (profileResponse.data) {
              persistSession(nextToken, profileResponse.data);
            }
          } catch (error) {
            console.error("Failed to refresh profile after login", error);
            // Continue with login even if profile refresh fails
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [persistSession]
  );

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetchAdminProfile(token);
      // Backend returns { success: true, data: { id, name, email, role, phone, location, bio, profileImage } }
      const profile = response.data;
      if (profile) {
        persistSession(token, profile);
      }
    } catch (error) {
      console.error("Failed to refresh profile", error);
      clearSession();
    }
  }, [token, persistSession, clearSession]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      admin,
      loading,
      login,
      logout,
      refreshProfile,
    }),
    [admin, loading, login, logout, refreshProfile, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

