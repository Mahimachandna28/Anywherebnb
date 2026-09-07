"use client";

import React from "react";
import { useUser } from "@/context/UserContext";
import { AuthCard } from "./AuthCard";

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useUser();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <AuthCard
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
