
"use client";

import type { User, UserRole } from "@/lib/types";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, role: UserRole, name?: string) => void;
  logout: () => void;
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to set a cookie
function setCookie(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (encodeURIComponent(value) || "")  + expires + "; path=/";
}

// Helper function to erase a cookie
function eraseCookie(name: string) {   
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRoleState] = useState<UserRole | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserString = localStorage.getItem("farmLinkUser");
    if (storedUserString) {
      try {
        const storedUser: User = JSON.parse(storedUserString);
        setUser(storedUser);
        setCookie("farmLinkUser", storedUserString, 7); // Ensure cookie is set if user in localStorage
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
  }, []);

  const login = (email: string, role: UserRole, name?: string) => {
    const mockUser: User = { id: Date.now().toString(), email, role, name: name || `${role.charAt(0).toUpperCase() + role.slice(1)} User` };
    const userString = JSON.stringify(mockUser);
    
    // Set cookie and localStorage first
    localStorage.setItem("farmLinkUser", userString);
    localStorage.setItem("farmLinkSelectedRole", role);
    setCookie("farmLinkUser", userString, 7); 

    // Then update React state. This will trigger useEffects in components consuming this context.
    setUser(mockUser);
    setSelectedRoleState(role);

    // Intentionally removed router.push and router.refresh from here.
    // The redirection will now be handled by useEffect in LoginPage or RegisterPage
    // which listens for changes in 'isAuthenticated' and 'user'.
  };

  const logout = () => {
    setUser(null);
    setSelectedRoleState(null);
    
    localStorage.removeItem("farmLinkUser");
    localStorage.removeItem("farmLinkSelectedRole");
    eraseCookie("farmLinkUser"); 
    
    router.push("/"); // Navigate to home
    router.refresh(); // Then refresh to ensure server state/middleware syncs
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
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, selectedRole, setSelectedRole }}>
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
