"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { fetchApi } from "@/lib/api";

export interface AuthModalOptions {
  title?: string;
  message?: string;
  mode?: "login" | "signup" | "both";
  onSuccess?: () => void;
}

interface UserContextType {
  currentUser: User | null;
  currentRole: UserRole;
  allUsers: User[];
  isLoading: boolean;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  authModalOptions: AuthModalOptions | null;
  setIsAuthModalOpen: (open: boolean) => void;
  openAuthModal: (options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
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
  const [authModalOptions, setAuthModalOptions] = useState<AuthModalOptions | null>(null);

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

        // Unauthenticated initial visitor state
        setCurrentUser(null);
        setCurrentRole("guest");
        setIsLoggedIn(false);
      } catch (error) {
        console.error("Failed to load initial users:", error);
        setCurrentUser(null);
        setIsLoggedIn(false);
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
    if (authModalOptions?.onSuccess) {
      authModalOptions.onSuccess();
    }
    setAuthModalOptions(null);
    if (typeof window !== "undefined") {
      localStorage.setItem("anywherebnb_current_user", JSON.stringify(user));
      localStorage.setItem("anywherebnb_is_logged_in", "true");
    }
  };

  const openAuthModal = (options?: AuthModalOptions) => {
    setAuthModalOptions(options || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalOptions(null);
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("anywherebnb_current_user");
      localStorage.setItem("anywherebnb_is_logged_in", "false");
    }
  };

  const toggleRole = () => {
    if (currentRole === "guest") {
      // Find primary host user (Rahul Sharma)
      const hostUser =
        allUsers.find((u) => u.email === "rahul.sharma@example.com") ||
        allUsers.find((u) => u.is_superhost || u.role === "host" || u.role === "both");
      if (hostUser) {
        setCurrentUser(hostUser);
        setIsLoggedIn(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("anywherebnb_current_user", JSON.stringify(hostUser));
          localStorage.setItem("anywherebnb_is_logged_in", "true");
        }
      }
      setCurrentRole("host");
    } else {
      // Find a guest user
      const guestUser = allUsers.find((u) => u.role === "guest");
      if (guestUser) {
        setCurrentUser(guestUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("anywherebnb_current_user", JSON.stringify(guestUser));
        }
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
        authModalOptions,
        setIsAuthModalOpen,
        openAuthModal,
        closeAuthModal,
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
