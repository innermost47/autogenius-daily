import React, { useState, useEffect, useCallback, useContext } from "react";
import AuthContext from "./authContext";
import { errorClass, successClass } from "../utils/cssUtils";
import ToastContext from "../contexts/ToastContext";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [success] = useState(null);
  const { showToast } = useContext(ToastContext);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setIsAuthenticated(true);
      setToken(storedToken);
    }
  }, []);

  const login = useCallback(
    (tokenValue) => {
      if (tokenValue) {
        localStorage.setItem("authToken", tokenValue);
        setToken(tokenValue);
        setIsAuthenticated(true);
        setError(null);
        showToast("Vous êtes connecté.", successClass);
      } else {
        showToast("Token not provided", errorClass);
      }
    },
    [showToast]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setToken(null);
    showToast("Vous êtes déconnecté.", successClass);
    setIsAuthenticated(false);
  }, [showToast]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        error,
        setError,
        success,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
