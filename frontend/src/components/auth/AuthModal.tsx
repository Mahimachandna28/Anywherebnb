"use client";

import React, { useState } from "react";
import { X, Check, ShieldCheck, User as UserIcon, Sparkles } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { User } from "@/types";

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    allUsers,
    currentUser,
    loginUser,
  } = useUser();
  const { success, error } = useToast();

  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    currentUser?.id || (allUsers[0]?.id ?? null)
  );
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSelectUser = (user: User) => {
    setSelectedUserId(user.id);
  };

  const handleContinue = () => {
    if (isCustomMode) {
      if (!customName.trim() || !customEmail.trim()) {
        error("Please enter both your name and email.");
        return;
      }
      const newUser: User = {
        id: Date.now(),
        name: customName.trim(),
        email: customEmail.trim().toLowerCase(),
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
        is_superhost: false,
        role: "guest",
        joined_date: new Date().toISOString(),
      };
      loginUser(newUser);
      success(`Welcome to Anywherebnb, ${newUser.name}!`);
      return;
    }

    const user = allUsers.find((u) => u.id === selectedUserId) || allUsers[0];
    if (user) {
      loginUser(user);
      success(`Signed in as ${user.name} (${user.role === "host" ? "Host" : "Guest"})`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            aria-label="Close"
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-neutral-900">
            Log in or sign up
          </span>
          <div className="w-8" />
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Welcome to Anywherebnb
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Select an authentic demo profile to experience the site as a guest or host:
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-xl bg-neutral-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => setIsCustomMode(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                !isCustomMode
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Demo Profiles
            </button>
            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                isCustomMode
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Custom Sign In
            </button>
          </div>

          {!isCustomMode ? (
            /* Demo Persona List */
            <div className="space-y-2.5 mb-6">
              {allUsers.map((user) => {
                const isSelected = selectedUserId === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition ${
                      isSelected
                        ? "border-neutral-900 bg-neutral-50/80 ring-1 ring-neutral-900"
                        : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-11 h-11 rounded-full object-cover border border-neutral-200"
                        />
                        {user.is_superhost && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 bg-[#FF385C] text-white p-0.5 rounded-full ring-2 ring-white"
                            title="Superhost"
                          >
                            <ShieldCheck className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-neutral-900">
                            {user.name}
                          </p>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 capitalize">
                            {user.role === "both" ? "Superhost" : user.role}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Custom Credentials Form */
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Malhotra"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-medium focus:outline-none focus:border-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. vikram@example.in"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-medium focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-3.5 rounded-xl bg-[#FF385C] hover:bg-[#E00B41] active:scale-[0.99] text-white font-bold text-sm transition shadow-sm"
          >
            Continue
          </button>

          <p className="text-[11px] text-neutral-400 text-center mt-4 leading-relaxed">
            By selecting Continue, you agree to Anywherebnb&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
