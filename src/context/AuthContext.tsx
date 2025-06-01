"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  dataLocalStorage,
  getLocalStorage,
  saveLocalStorage,
} from "../helper/public-functions";
import type { ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  login: (userData: any) => void;
  logout: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatePrivileges: (privileges: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const login = (userData: any) => {
    saveLocalStorage(dataLocalStorage.userinfo, userData);
    setIsAuthenticated(true);

    // Dispatch event to notify route loader
    window.dispatchEvent(new CustomEvent("privilegesUpdated"));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePrivileges = (privileges: any) => {
    saveLocalStorage(dataLocalStorage.privileges, privileges);

    // Dispatch event to notify route loader that privileges have been updated
    window.dispatchEvent(new CustomEvent("privilegesUpdated"));
    console.log("Privileges updated:", privileges);
  };

  const logout = () => {
    localStorage.removeItem(dataLocalStorage.userinfo);
    localStorage.removeItem(dataLocalStorage.privileges);
    setIsAuthenticated(false);

    // Dispatch event to notify route loader
    window.dispatchEvent(new CustomEvent("privilegesUpdated"));
  };

  useEffect(() => {
    // Check if user data exists in localStorage on component mount
    const userData = getLocalStorage(dataLocalStorage.userinfo);

    if (userData && userData.token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, logout, updatePrivileges }}
    >
      {children}
    </AuthContext.Provider>
  );
};
