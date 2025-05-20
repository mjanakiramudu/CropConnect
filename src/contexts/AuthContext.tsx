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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRoleState] = useState<UserRole | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Mock: Check if user is logged in from localStorage (very basic persistence)
    const storedUser = localStorage.getItem("farmLinkUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const storedRole = localStorage.getItem("farmLinkSelectedRole") as UserRole | null;
    if (storedRole) {
        setSelectedRoleState(storedRole);
    }
  }, []);

  const login = (email: string, role: UserRole, name?: string) => {
    const mockUser: User = { id: Date.now().toString(), email, role, name: name || `${role.charAt(0).toUpperCase() + role.slice(1)} User` };
    setUser(mockUser);
    setSelectedRoleState(role);
    localStorage.setItem("farmLinkUser", JSON.stringify(mockUser));
    localStorage.setItem("farmLinkSelectedRole", role);
    if (role === "farmer") {
      router.push("/farmer/dashboard");
    } else {
      router.push("/customer/dashboard");
    }
  };

  const logout = () => {
    setUser(null);
    setSelectedRoleState(null);
    localStorage.removeItem("farmLinkUser");
    localStorage.removeItem("farmLinkSelectedRole");
    router.push("/");
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
