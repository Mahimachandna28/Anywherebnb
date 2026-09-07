"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { fetchApi } from "@/lib/api";

interface UserContextType {
  currentUser: User | null;
  currentRole: UserRole;
  allUsers: User[];
  isLoading: boolean;
  switchUser: (userId: number) => void;
  toggleRole: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>("guest");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const users = await fetchApi<User[]>("/users");
        setAllUsers(users);
        
        // Default to Alex Morgan (Guest) or first user
        const defaultGuest = users.find((u) => u.email === "alex.morgan@example.com") || users[0];
        if (defaultGuest) {
          setCurrentUser(defaultGuest);
          setCurrentRole("guest");
        }
      } catch (error) {
        console.error("Failed to load initial users:", error);
        // Fallback demo user if backend is momentarily unreachable
        setCurrentUser({
          id: 1,
          name: "Alex Morgan",
          email: "alex.morgan@example.com",
          avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
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
        switchUser,
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
