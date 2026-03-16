import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { clearAuthToken, getStoredToken } from "../services/api";
import { getAdminProfile, loginAdmin, logoutAdmin } from "../services/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getStoredToken()));
  const [isLoading, setIsLoading] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = getStoredToken();

      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await getAdminProfile();
        setAdmin(response.data);
        setIsAuthenticated(true);
      } catch (_error) {
        clearAuthToken();
        setAdmin(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    const handleUnauthorized = () => {
      clearAuthToken();
      setAdmin(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    };

    bootstrapAuth();

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const handleLogin = async (credentials) => {
    const response = await loginAdmin(credentials);
    setAdmin(response.data.admin);
    setIsAuthenticated(true);
    return response;
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated,
      isLoading,
      login: handleLogin,
      logout: handleLogout
    }),
    [admin, isAuthenticated, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
