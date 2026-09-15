import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("bookverse_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const result = await api.getMe();
        setUser(result.user || null);
      } catch {
        localStorage.removeItem("bookverse_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (identifier, password) => {
    const result = await api.login({
      email: identifier,
      username: identifier,
      password,
    });
    const sessionUser = result.user;
    const token = result.token;

    if (token) {
      localStorage.setItem("bookverse_token", token);
    }

    setUser(sessionUser);
    return result;
  };

  const register = async (payload) => {
    const result = await api.register(payload);
    const sessionUser = result.user;
    const token = result.token;

    if (token) {
      localStorage.setItem("bookverse_token", token);
    }

    setUser(sessionUser);
    return result;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore logout errors and clear client state
    }

    localStorage.removeItem("bookverse_token");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, setUser, loading, login, register, logout }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
