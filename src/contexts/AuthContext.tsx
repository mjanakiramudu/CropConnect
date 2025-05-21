
"use client";

import type { User, UserRole } from "@/lib/types";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  authError: string | null;
  isLoadingAuth: boolean;
  login: (email: string, role: UserRole, name?: string) => Promise<boolean>;
  register: (name: string, email: string, role: UserRole, location?: string) => Promise<boolean>; // Added location for farmer
  logout: () => void;
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole | null) => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setCookie(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (encodeURIComponent(value) || "")  + expires + "; path=/";
}

function eraseCookie(name: string) {   
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

const REGISTERED_USERS_KEY = "farmLinkRegisteredUsers";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRoleState] = useState<UserRole | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoadingAuth(true);
    const storedRegisteredUsers = localStorage.getItem(REGISTERED_USERS_KEY);
    if (storedRegisteredUsers) {
      try {
        setRegisteredUsers(JSON.parse(storedRegisteredUsers));
      } catch (e) {
        console.error("Failed to parse registered users from localStorage", e);
        localStorage.removeItem(REGISTERED_USERS_KEY);
      }
    }

    const storedUserString = localStorage.getItem("farmLinkUser");
    if (storedUserString) {
      try {
        const storedUser: User = JSON.parse(storedUserString);
        setUser(storedUser);
        setCookie("farmLinkUser", storedUserString, 7); 
      } catch (e) {
        console.error("Failed to parse stored user from localStorage", e);
        localStorage.removeItem("farmLinkUser");
        eraseCookie("farmLinkUser"); 
      }
    }
    const storedRole = localStorage.getItem("farmLinkSelectedRole") as UserRole | null;
    if (storedRole) {
        setSelectedRoleState(storedRole);
    }
    setIsLoadingAuth(false);
  }, []);

  const clearAuthError = () => setAuthError(null);

  const login = async (email: string, role: UserRole): Promise<boolean> => {
    setAuthError(null);
    setIsLoadingAuth(true);
    await new Promise(resolve => setTimeout(resolve, 300)); 

    const foundUser = registeredUsers.find(u => u.email === email);

    if (foundUser) {
      if (foundUser.role === role) {
        const userString = JSON.stringify(foundUser);
        localStorage.setItem("farmLinkUser", userString);
        localStorage.setItem("farmLinkSelectedRole", role);
        setCookie("farmLinkUser", userString, 7); 
        setUser(foundUser);
        setSelectedRoleState(role);
        setIsLoadingAuth(false);
        // No router.push here, let page handle redirection based on auth state
        return true;
      } else {
        setAuthError(`User found, but role is incorrect. Expected ${role}, got ${foundUser.role}.`);
        setIsLoadingAuth(false);
        return false;
      }
    } else {
      setAuthError("User not found. Please check your email or register.");
      setIsLoadingAuth(false);
      return false;
    }
  };

  const register = async (name: string, email: string, role: UserRole, location?: string): Promise<boolean> => {
    setAuthError(null);
    setIsLoadingAuth(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    if (registeredUsers.some(u => u.email === email)) {
      setAuthError("Email already registered. Please login or use a different email.");
      setIsLoadingAuth(false);
      return false;
    }

    const newUser: User = { 
        id: Date.now().toString(), 
        email, 
        role, 
        name,
        ...(role === 'farmer' && location && { location }) // Add location if farmer and location is provided
    };
    const updatedRegisteredUsers = [...registeredUsers, newUser];
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedRegisteredUsers));
    setRegisteredUsers(updatedRegisteredUsers);
    
    const userString = JSON.stringify(newUser);
    localStorage.setItem("farmLinkUser", userString);
    localStorage.setItem("farmLinkSelectedRole", role);
    setCookie("farmLinkUser", userString, 7); 
    setUser(newUser);
    setSelectedRoleState(role);
    setIsLoadingAuth(false);
    // No router.push here
    return true;
  };

  const logout = () => {
    setUser(null);
    // Keep selectedRole if you want to remember the last role context, or clear it:
    // setSelectedRoleState(null); 
    // localStorage.removeItem("farmLinkSelectedRole");
    setAuthError(null);
    localStorage.removeItem("farmLinkUser");
    eraseCookie("farmLinkUser"); 
    router.push("/"); 
    router.refresh(); 
  };

  const setSelectedRole = (role: UserRole | null) => {
    setSelectedRoleState(role);
    if (role) {
        localStorage.setItem("farmLinkSelectedRole", role);
    } else {
        localStorage.removeItem("farmLinkSelectedRole");
    }
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!user, 
      user, 
      login, 
      register, 
      logout, 
      selectedRole, 
      setSelectedRole,
      authError,
      isLoadingAuth,
      clearAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
