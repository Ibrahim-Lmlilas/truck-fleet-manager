import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from "../services/auth.service";
import { setAuthToken } from "../services/apiClient";
import type { UserProfile } from "../services/auth.service";

type AuthState = {
  user: UserProfile | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (nom: string, prenom: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetError: () => void;
  fetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem("token"),
    status: "idle",
    error: null,
  });

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    setState((prev) => ({ ...prev, status: "loading" }));
    try {
      const user = await getMe();
      setState((prev) => ({
        ...prev,
        user,
        status: "succeeded",
        error: null,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        status: "failed",
        error: err?.response?.data?.message || "Échec de la récupération du profil",
        token: null,
        user: null,
      }));
      localStorage.removeItem("token");
      setAuthToken(null);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken && !state.user && state.status === "idle") {
      setAuthToken(storedToken);
      setState((prev) => ({ ...prev, token: storedToken }));
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const res = await apiLogin({ email, password });
      localStorage.setItem("token", res.data.token);
      setState({
        user: res.data.user,
        token: res.data.token,
        status: "succeeded",
        error: null,
      });
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        status: "failed",
        error: err?.response?.data?.message || "Échec de la connexion",
      }));
      throw err;
    }
  };

  const register = async (nom: string, prenom: string, email: string, password: string, role?: string) => {
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const res = await apiRegister({ nom, prenom, email, password, role });
      localStorage.setItem("token", res.data.token);
      setState({
        user: res.data.user,
        token: res.data.token,
        status: "succeeded",
        error: null,
      });
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        status: "failed",
        error: err?.response?.data?.message || "Échec de l'inscription",
      }));
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error("Erreur de déconnexion:", err);
    } finally {
      localStorage.removeItem("token");
      setAuthToken(null);
      setState({
        user: null,
        token: null,
        status: "succeeded",
        error: null,
      });
    }
  };

  const resetError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        resetError,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};

