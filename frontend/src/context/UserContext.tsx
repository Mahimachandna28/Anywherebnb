"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { fetchApi } from "@/lib/api";

interface UserContextType {
  currentUser: User | null;
  currentRole: UserRole;
  allUsers: User[];
  isLoading: boolean;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  switchUser: (userId: number) => void;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  toggleRole: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>("guest");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadUsers() {
      try {
        const users = await fetchApi<User[]>("/users");
        setAllUsers(users);
        
        // Restore existing user session if present
        if (typeof window !== "undefined") {
          const savedUserStr = localStorage.getItem("anywherebnb_current_user");
          const savedLoggedIn = localStorage.getItem("anywherebnb_is_logged_in");
          if (savedUserStr && savedLoggedIn === "true") {
            try {
              const parsed = JSON.parse(savedUserStr);
              setCurrentUser(parsed);
              setCurrentRole(parsed.role === "host" ? "host" : "guest");
              setIsLoggedIn(true);
              return;
            } catch {
              // ignore json parse errors
            }
          }
        }

        // Default to Aarav Patel (Guest) or first user
        const defaultGuest = users.find((u) => u.email === "aarav.patel@example.com") || users[0];
        if (defaultGuest) {
          setCurrentUser(defaultGuest);
          setCurrentRole("guest");
        }
      } catch (error) {
        console.error("Failed to load initial users:", error);
        // Fallback demo user if backend is momentarily unreachable
        setCurrentUser({
          id: 1,
          name: "Aarav Patel",
          email: "aarav.patel@example.com",
          avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
          is_superhost: false,
          role: "guest",
          joined_date: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  const switchUser = (userId: number) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setCurrentRole(target.role === "host" ? "host" : "guest");
      setIsLoggedIn(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("anywherebnb_current_user", JSON.stringify(target));
        localStorage.setItem("anywherebnb_is_logged_in", "true");
      }
    }
  };

  const loginUser = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role === "host" ? "host" : "guest");
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("anywherebnb_current_user", JSON.stringify(user));
      localStorage.setItem("anywherebnb_is_logged_in", "true");
    }
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("anywherebnb_current_user");
      localStorage.setItem("anywherebnb_is_logged_in", "false");
    }
  };

  const toggleRole = () => {
    if (currentRole === "guest") {
      // Find a host user
      const hostUser = allUsers.find((u) => u.is_superhost || u.role === "host");
      if (hostUser) {
        setCurrentUser(hostUser);
      }
      setCurrentRole("host");
    } else {
      // Find a guest user
      const guestUser = allUsers.find((u) => u.role === "guest");
      if (guestUser) {
        setCurrentUser(guestUser);
      }
      setCurrentRole("guest");
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        currentRole,
        allUsers,
        isLoading,
        isLoggedIn,
        isAuthModalOpen,
        setIsAuthModalOpen,
        switchUser,
        loginUser,
        logoutUser,
        toggleRole,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
