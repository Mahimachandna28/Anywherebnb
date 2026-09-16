"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Smartphone, Mail, Lock, User as UserIcon, Loader2, Eye, EyeOff } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { fetchApi } from "@/lib/api";
import { User } from "@/types";

interface AuthCardProps {
  onSuccess?: () => void;
  onClose?: () => void;
  isPage?: boolean;
  title?: string;
  message?: string;
  initialMode?: "login" | "signup" | "both";
}

export function AuthCard({
  onSuccess,
  onClose,
  isPage = false,
  title,
  message,
  initialMode = "login",
}: AuthCardProps) {
  const { allUsers, loginUser } = useUser();
  const { success, error } = useToast();

  // Mode: "login" | "signup"
  const [authMode, setAuthMode] = useState<"login" | "signup">(
    initialMode === "signup" ? "signup" : "login"
  );
  // Method: "phone" | "email"
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");

  // Form Inputs
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Loading & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleClose = () => {
    setFormError(null);
    onClose?.();
  };

  const getCleanIdentifier = () => {
    if (authMethod === "phone") {
      const digits = phoneNumber.replace(/\D/g, "");
      return digits.length >= 10 ? `+91${digits.slice(-10)}` : digits;
    }
    return emailAddress.trim().toLowerCase();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    // 1. Validate Identifier
    if (authMethod === "phone") {
      const cleanDigits = phoneNumber.replace(/\D/g, "");
      if (cleanDigits.length < 10) {
        const msg = "Please enter a valid 10-digit mobile number.";
        setFormError(msg);
        error(msg);
        return;
      }
    } else {
      const cleanEmail = emailAddress.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
        const msg = "Please enter a valid email address.";
        setFormError(msg);
        error(msg);
        return;
      }
    }

    // 2. Validate Password
    if (!password || password.trim().length === 0) {
      const msg = "Please enter your password.";
      setFormError(msg);
      error(msg);
      return;
    }

    // 3. Validate Signup Specifics
    if (authMode === "signup") {
      if (!fullName.trim()) {
        const msg = "Please enter your full name to create an account.";
        setFormError(msg);
        error(msg);
        return;
      }
      if (password.length < 6) {
        const msg = "Password must be at least 6 characters long.";
        setFormError(msg);
        error(msg);
        return;
      }
    }

    const identifier = getCleanIdentifier();

    try {
      setIsSubmitting(true);

      if (authMode === "login") {
        // Direct Password-Based Login (Zero OTP required)
        const res = await fetchApi<{
          success: boolean;
          message: string;
          user: User;
        }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            identifier,
            password: password.trim(),
          }),
        });

        if (res.user) {
          loginUser(res.user);
          success(res.message || `Welcome back, ${res.user.name}!`);
          onSuccess?.();
        }
      } else {
        // Direct Account Signup (Zero OTP required)
        const res = await fetchApi<{
          success: boolean;
          message: string;
          user: User;
        }>("/auth/signup", {
          method: "POST",
          body: JSON.stringify({
            name: fullName.trim(),
            identifier,
            password: password.trim(),
          }),
        });

        if (res.user) {
          loginUser(res.user);
          success(res.message || `Account created successfully! Welcome to AnywhereBnB, ${res.user.name}!`);
          onSuccess?.();
        }
      }
    } catch (err: any) {
      console.error("Auth submit failed:", err);
      const errMsg = err.message || "Authentication failed. Please check your credentials.";
      setFormError(errMsg);
      error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDemoUser = (user: User) => {
    loginUser(user);
    success(`Logged in as ${user.name} (${user.role === "both" ? "Superhost" : user.role}).`);
    onSuccess?.();
  };

  return (
    <div
      className="bg-white dark:bg-[#1E1E1E] w-full max-w-[420px] rounded-[32px] shadow-2xl border border-neutral-200/80 dark:border-[#2F2F2F] p-8 relative animate-in zoom-in-95 duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Controls: Close Button */}
      {isPage ? (
        <Link
          href="/"
          aria-label="Back to home"
          className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 transition"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 transition cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>
      )}

      {/* Coral Bélo Logo */}
      <div className="flex justify-center pt-2 pb-1">
        <svg
          className="w-11 h-11 text-[#FF385C]"
          viewBox="0 0 32 32"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.479.96 3.376.104 1.93-.726 3.758-2.222 4.887C25.908 29.742 24.089 30.2 22.185 30c-2.483-.262-4.66-1.782-6.185-4.281-1.525 2.499-3.702 4.019-6.185 4.281-1.904.2-3.723-.258-5.082-1.254-1.496-1.129-2.326-2.957-2.222-4.887.05-.897.293-1.785.96-3.376l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.238 0-2.235.617-3.18 2.308l-.504.968c-1.91 3.743-6.046 12.404-7.013 14.659l-.141.343c-.58 1.385-.779 2.115-.818 2.827-.074 1.373.498 2.646 1.536 3.429.954.72 2.239 1.037 3.616.891 2.296-.242 4.316-1.83 5.485-4.225l.419-.858.6 1.077c1.196 2.146 3.125 3.633 5.304 3.967 1.377.21 2.662-.107 3.616-.827 1.038-.783 1.61-2.056 1.536-3.429-.039-.712-.238-1.442-.818-2.827l-.141-.343c-.967-2.255-5.103-10.916-7.013-14.659l-.504-.968C18.235 3.617 17.238 3 16 3zm0 13c2.209 0 4 1.791 4 4 0 1.865-1.278 3.431-3 3.874V26a1 1 0 1 1-2 0v-2.126c-1.722-.443-3-2.009-3-3.874 0-2.209 1.791-4 4-4zm0 2c-1.105 0-2 .895-2 2 0 1.048.807 1.906 1.838 1.995L16 22c1.105 0 2-.895 2-2 0-1.048-.807-1.906-1.838-1.995L16 18z" />
        </svg>
      </div>

      <form onSubmit={handleSubmit}>
        <h2 className="text-[24px] font-bold text-neutral-900 dark:text-neutral-100 text-center tracking-tight mt-3 mb-1">
          {title || (authMode === "login" ? "Log in to Anywherebnb" : "Sign up for Anywherebnb")}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mb-4 leading-relaxed">
          {message ||
            (authMode === "login"
              ? "Welcome back! Enter your phone or email and password."
              : "Create an account to start booking unforgettable stays.")}
        </p>

        {/* Log in / Sign up Mode Switcher */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-[#252525] rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode("login");
              setFormError(null);
            }}
            className={`py-2 rounded-lg transition text-center cursor-pointer ${
              authMode === "login"
                ? "bg-white dark:bg-[#1E1E1E] text-neutral-900 dark:text-white shadow-xs"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("signup");
              setFormError(null);
            }}
            className={`py-2 rounded-lg transition text-center cursor-pointer ${
              authMode === "signup"
                ? "bg-white dark:bg-[#1E1E1E] text-neutral-900 dark:text-white shadow-xs"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Form Error Banner */}
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-800 dark:text-rose-300 font-medium flex items-center gap-2 animate-in fade-in">
            <span className="text-sm shrink-0">⚠️</span>
            <span>{formError}</span>
          </div>
        )}

        {/* Phone vs Email Switcher Tabs */}
        <div className="flex bg-neutral-100 dark:bg-[#252525] p-1 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMethod("phone");
              setFormError(null);
            }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              authMethod === "phone"
                ? "bg-white dark:bg-[#1E1E1E] text-neutral-900 dark:text-white shadow-xs"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod("email");
              setFormError(null);
            }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              authMethod === "email"
                ? "bg-white dark:bg-[#1E1E1E] text-neutral-900 dark:text-white shadow-xs"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3">
          {/* Full Name for Signup */}
          {authMode === "signup" && (
            <div className="relative">
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 dark:border-[#3A3A3A] bg-white dark:bg-[#252525] text-neutral-900 dark:text-white text-sm placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-400 font-medium transition"
                required
              />
              <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          )}

          {/* Phone or Email Input */}
          {authMethod === "phone" ? (
            <div className="flex items-center rounded-xl border border-neutral-300 dark:border-[#3A3A3A] bg-white dark:bg-[#252525] focus-within:border-neutral-900 dark:focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-900 transition overflow-hidden">
              <div className="bg-neutral-50 dark:bg-[#2A2A2A] px-3.5 py-3 border-r border-neutral-300 dark:border-[#3A3A3A] flex items-center gap-1.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200 shrink-0 select-none">
                <span className="text-base leading-none">🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                placeholder="10-digit phone number"
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                className="w-full px-3.5 py-3 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none bg-transparent font-medium"
                required
              />
            </div>
          ) : (
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 dark:border-[#3A3A3A] bg-white dark:bg-[#252525] text-neutral-900 dark:text-white text-sm placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-400 font-medium transition"
                required
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          )}

          {/* Password Input (for both Login and Signup) */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={authMode === "login" ? "Enter your password" : "Create password (min. 6 characters)"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-neutral-300 dark:border-[#3A3A3A] bg-white dark:bg-[#252525] text-neutral-900 dark:text-white text-sm placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-400 font-medium transition"
              required
            />
            <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-5 py-3.5 rounded-xl bg-[#E00B41] hover:bg-[#D70466] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] text-white font-semibold text-sm transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{authMode === "login" ? "Logging in..." : "Creating account..."}</span>
            </>
          ) : (
            <span>{authMode === "login" ? "Log in" : "Sign up"}</span>
          )}
        </button>
      </form>

      {/* "or" Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-neutral-200 dark:border-neutral-700 w-full" />
        <span className="bg-white dark:bg-[#1E1E1E] px-3 text-xs text-neutral-400 font-normal absolute">
          or 1-click demo login
        </span>
      </div>

      {/* Demo Persona Shortcuts */}
      <div className="text-center">
        <p className="text-[11px] text-neutral-400 mb-2">Instant demo access:</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {allUsers.slice(0, 4).map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => handleSelectDemoUser(u)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-[#2A2A2A] dark:hover:bg-[#333333] text-neutral-700 dark:text-neutral-300 transition cursor-pointer"
            >
              {u.name.split(" ")[0]} ({u.role === "both" ? "Superhost" : u.role})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
