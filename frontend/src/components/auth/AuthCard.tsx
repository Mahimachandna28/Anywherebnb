"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, ArrowLeft, Smartphone, Mail } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { User } from "@/types";

interface AuthCardProps {
  onSuccess?: () => void;
  onClose?: () => void;
  isPage?: boolean;
}

export function AuthCard({ onSuccess, onClose, isPage = false }: AuthCardProps) {
  const { allUsers, loginUser } = useUser();
  const { success, error, info } = useToast();

  // Mode: "phone" | "email"
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  // Step: "input" | "otp"
  const [step, setStep] = useState<"input" | "otp">("input");

  // Inputs
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("123456");
  const [resendTimer, setResendTimer] = useState(30);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  const handleClose = () => {
    setStep("input");
    setOtpCode("");
    onClose?.();
  };

  const handleSendOtp = () => {
    if (authMethod === "phone") {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        error("Please enter a valid 10-digit mobile number.");
        return;
      }
      // Generate a realistic 6-digit OTP
      const newOtp = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(newOtp);
      setStep("otp");
      setResendTimer(30);
      setOtpCode("");
      info(`OTP sent to +91 ${cleanPhone.slice(-10)}`);
    } else {
      const cleanEmail = emailAddress.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
        error("Please enter a valid email address.");
        return;
      }
      const newOtp = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(newOtp);
      setStep("otp");
      setResendTimer(30);
      setOtpCode("");
      info(`Verification code sent to ${cleanEmail}`);
    }
  };

  const handleVerifyOtp = () => {
    const entered = otpCode.trim();
    if (entered !== generatedOtp && entered !== "123456") {
      error("Invalid code. Please enter the 6-digit code shown above.");
      return;
    }

    if (authMethod === "phone") {
      const cleanPhone = phoneNumber.replace(/\D/g, "").slice(-10);
      const phoneFull = `+91 ${cleanPhone}`;

      // Check if phone matches any seeded account or previous custom
      const matched = allUsers.find(
        (u) =>
          u.phone?.replace(/\D/g, "").includes(cleanPhone) ||
          u.email.toLowerCase().includes(cleanPhone)
      );

      if (matched) {
        loginUser(matched);
        success(`Welcome back, ${matched.name}! Wishlist loaded.`);
      } else {
        const newUser: User = {
          id: Date.now(),
          name: fullName.trim() || `User ${cleanPhone.slice(-4)}`,
          email: `${cleanPhone}@phone.anywherebnb.in`,
          phone: phoneFull,
          avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
          is_superhost: false,
          role: "guest",
          joined_date: new Date().toISOString(),
        };
        loginUser(newUser);
        success(`Account created with ${phoneFull}! Your private wishlist is ready.`);
      }
    } else {
      const cleanEmail = emailAddress.trim().toLowerCase();

      // Check if email matches seeded demo users
      const matched = allUsers.find(
        (u) => u.email.toLowerCase() === cleanEmail
      );

      if (matched) {
        loginUser(matched);
        success(`Welcome back, ${matched.name} (${matched.role === "both" ? "Superhost" : matched.role})! Wishlist loaded.`);
      } else {
        const namePart = fullName.trim() || cleanEmail.split("@")[0].replace(/[._]/g, " ");
        const newUser: User = {
          id: Date.now(),
          name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
          email: cleanEmail,
          avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
          is_superhost: false,
          role: "guest",
          joined_date: new Date().toISOString(),
        };
        loginUser(newUser);
        success(`Welcome to Anywherebnb, ${newUser.name}! Your private wishlist is ready.`);
      }
    }

    onSuccess?.();
  };

  const handleAutoFillOtp = () => {
    setOtpCode(generatedOtp);
  };

  const handleGoogleSignIn = () => {
    const guestUser = allUsers.find((u) => u.role === "guest") || allUsers[0];
    if (guestUser) {
      loginUser(guestUser);
      success(`Signed in with Google as ${guestUser.name}`);
      onSuccess?.();
    }
  };

  const handleAppleSignIn = () => {
    const hostUser = allUsers.find((u) => u.role === "host" || u.role === "both") || allUsers[1] || allUsers[0];
    if (hostUser) {
      loginUser(hostUser);
      success(`Signed in with Apple as ${hostUser.name} (Host)`);
      onSuccess?.();
    }
  };

  const handleSelectDemoUser = (user: User) => {
    loginUser(user);
    success(`Switched to ${user.name}'s account (${user.role === "both" ? "Superhost" : user.role}). Wishlist synced.`);
    onSuccess?.();
  };

  return (
    <div
      className="bg-white w-full max-w-[420px] rounded-[32px] shadow-2xl border border-neutral-200/80 p-8 relative animate-in zoom-in-95 duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Controls: Back Arrow & Close */}
      {step === "otp" && (
        <button
          type="button"
          onClick={() => setStep("input")}
          aria-label="Back"
          className="absolute top-6 left-6 w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>
      )}

      {isPage ? (
        <Link
          href="/"
          aria-label="Back to home"
          className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-800 transition"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-800 transition cursor-pointer"
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

      {step === "input" ? (
        /* STEP 1: Phone / Email Input Screen */
        <div>
          <h2 className="text-[26px] font-bold text-neutral-900 text-center tracking-tight mt-3 mb-5">
            Log in or sign up
          </h2>

          {/* Separate Method Switcher Tabs: Phone vs Email */}
          <div className="flex bg-neutral-100 p-1 rounded-xl mb-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAuthMethod("phone")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                authMethod === "phone"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone Number</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod("email")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                authMethod === "email"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email ID</span>
            </button>
          </div>

          {/* Input Box based on chosen method */}
          {authMethod === "phone" ? (
            /* Phone Number Box with India Country Code */
            <div className="space-y-3">
              <div className="flex items-center rounded-xl border border-neutral-400 focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900 transition overflow-hidden">
                <div className="bg-neutral-50 px-3.5 py-3.5 border-r border-neutral-300 flex items-center gap-1.5 text-sm font-semibold text-neutral-800 shrink-0 select-none">
                  <span className="text-base leading-none">🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className="w-full px-3.5 py-3.5 text-base text-neutral-900 placeholder:text-neutral-500 focus:outline-none bg-white font-medium"
                />
              </div>
              <input
                type="text"
                placeholder="Your full name (optional)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
              />
            </div>
          ) : (
            /* Email ID Box */
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className="w-full px-4 py-3.5 rounded-xl border border-neutral-400 text-base text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                />
              </div>
              <input
                type="text"
                placeholder="Your full name (optional)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
              />
            </div>
          )}

          {/* Continue / Send OTP Button */}
          <button
            type="button"
            onClick={handleSendOtp}
            className="w-full mt-4 py-3.5 rounded-xl bg-[#E00B41] hover:bg-[#D70466] active:scale-[0.99] text-white font-semibold text-base transition shadow-sm cursor-pointer"
          >
            Continue with OTP
          </button>

          {/* "or" Divider */}
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-neutral-200 w-full" />
            <span className="bg-white px-4 text-xs text-neutral-500 font-normal absolute">
              or
            </span>
          </div>

          {/* Social Authentication Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              aria-label="Continue with Google"
              className="w-16 h-13 rounded-2xl border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 hover:border-neutral-400 active:scale-95 transition shadow-xs cursor-pointer"
              title="Continue with Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleAppleSignIn}
              aria-label="Continue with Apple"
              className="w-16 h-13 rounded-2xl border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 hover:border-neutral-400 active:scale-95 transition shadow-xs cursor-pointer"
              title="Continue with Apple"
            >
              <svg className="w-5 h-5 fill-current text-black" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.75-11.96-14.13-7.51-11.19-13.3-24.16-17.38-38.92-4.08-14.77-6.13-28.53-6.13-41.29 0-16.71 4.2-30.73 12.59-42.06 8.39-11.33 18.99-17.15 31.8-17.47 5.75 0 12.06 1.54 18.91 4.62 6.86 3.09 11.2 4.68 13.04 4.79 1.34 0 5.86-1.63 13.56-4.89 7.7-3.26 14.1-4.73 19.2-4.43 14.34.87 25.86 5.89 34.56 15.06-12.72 7.72-18.92 18.23-18.6 31.52.27 10.33 4.28 19.14 12.04 26.43 7.76 7.28 17.07 11.45 27.93 12.5-2.23 7.07-5.1 14.57-8.61 22.49zM119.22 31.85c0-7.28 2.66-14.42 7.99-21.41 5.33-6.99 12.04-11.53 20.14-13.62.45 1.79.67 3.48.67 5.08 0 7.39-2.73 14.62-8.19 21.68-5.46 7.07-12.18 11.53-20.15 13.38-.11-1.68-.46-3.38-.46-5.11z" />
              </svg>
            </button>
          </div>

          {/* Quick Demo Accounts Switcher */}
          <div className="mt-5 pt-4 border-t border-neutral-100 text-center">
            <p className="text-[11px] text-neutral-400 mb-2">Instant Demo Accounts (with separate wishlists):</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectDemoUser(u)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
                >
                  {u.name.split(" ")[0]} ({u.role === "both" ? "Superhost" : u.role})
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: OTP Verification Screen */
        <div>
          <h2 className="text-[24px] font-bold text-neutral-900 text-center tracking-tight mt-3 mb-1">
            Confirm your {authMethod === "phone" ? "phone number" : "email"}
          </h2>
          <p className="text-xs text-neutral-500 text-center mb-5">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-neutral-800">
              {authMethod === "phone" ? `+91 ${phoneNumber.slice(-10)}` : emailAddress}
            </span>
          </p>

          {/* Simulated OTP Display Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold text-amber-900">
                Demo Verification Code:
              </p>
              <p className="text-lg font-mono font-extrabold tracking-widest text-amber-950">
                {generatedOtp}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoFillOtp}
              className="text-xs font-bold px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg transition shrink-0 cursor-pointer"
            >
              Auto-fill
            </button>
          </div>

          {/* 6-digit OTP input */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="• • • • • •"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              className="w-full text-center tracking-[0.6em] text-2xl font-mono font-bold px-4 py-3.5 rounded-xl border border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
            />
          </div>

          {/* Verify & Continue Button */}
          <button
            type="button"
            onClick={handleVerifyOtp}
            className="w-full py-3.5 rounded-xl bg-[#E00B41] hover:bg-[#D70466] active:scale-[0.99] text-white font-semibold text-base transition shadow-sm cursor-pointer"
          >
            Verify &amp; Continue
          </button>

          {/* Resend OTP */}
          <div className="mt-4 text-center">
            {resendTimer > 0 ? (
              <p className="text-xs text-neutral-400">
                Resend code in <span className="font-semibold text-neutral-600">{resendTimer}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-xs font-semibold text-neutral-800 hover:underline cursor-pointer"
              >
                Resend code
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
