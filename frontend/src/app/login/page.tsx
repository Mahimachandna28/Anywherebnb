"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { User } from "@/types";

export default function AuthPage() {
  const router = useRouter();
  const { allUsers, loginUser } = useUser();
  const { success } = useToast();
  const [identifier, setIdentifier] = useState("");

  const handleContinue = () => {
    const trimmed = identifier.trim();

    if (!trimmed) {
      const defaultUser = allUsers[0] || {
        id: 1,
        name: "Aarav Patel",
        email: "aarav.patel@example.com",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        is_superhost: false,
        role: "guest",
        joined_date: "2023-01-15T00:00:00Z",
      };
      loginUser(defaultUser);
      success(`Signed in as ${defaultUser.name} (Guest)`);
      router.push("/");
      return;
    }

    const lower = trimmed.toLowerCase();
    const matchedUser = allUsers.find(
      (u) =>
        u.email.toLowerCase().includes(lower) ||
        u.name.toLowerCase().includes(lower)
    );

    if (matchedUser) {
      loginUser(matchedUser);
      success(`Signed in as ${matchedUser.name} (${matchedUser.role === "both" ? "Superhost" : matchedUser.role})`);
      router.push("/");
      return;
    }

    const isEmail = trimmed.includes("@");
    const newCustomUser: User = {
      id: Date.now(),
      name: isEmail ? trimmed.split("@")[0] : trimmed,
      email: isEmail ? trimmed.toLowerCase() : `${trimmed.replace(/\s+/g, "")}@example.in`,
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
      is_superhost: false,
      role: "guest",
      joined_date: new Date().toISOString(),
    };

    loginUser(newCustomUser);
    success(`Welcome to Anywherebnb, ${newCustomUser.name}!`);
    router.push("/");
  };

  const handleGoogleSignIn = () => {
    const guestUser = allUsers.find((u) => u.role === "guest") || allUsers[0];
    if (guestUser) {
      loginUser(guestUser);
      success(`Signed in with Google as ${guestUser.name}`);
      router.push("/");
    }
  };

  const handleAppleSignIn = () => {
    const hostUser = allUsers.find((u) => u.role === "host" || u.role === "both") || allUsers[1] || allUsers[0];
    if (hostUser) {
      loginUser(hostUser);
      success(`Signed in with Apple as ${hostUser.name} (Host)`);
      router.push("/");
    }
  };

  const handleSelectDemoUser = (user: User) => {
    loginUser(user);
    success(`Switched to ${user.name} (${user.role === "both" ? "Superhost" : user.role})`);
    router.push("/");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-neutral-50/60">
      <div
        className="bg-white w-full max-w-[420px] rounded-[32px] shadow-xl border border-neutral-200/80 p-8 relative"
        role="main"
      >
        {/* Top-right close button navigating back to home */}
        <Link
          href="/"
          aria-label="Back to home"
          className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-800 transition"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </Link>

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

        {/* Heading matching reference image */}
        <h1 className="text-[26px] font-bold text-neutral-900 text-center tracking-tight mt-3 mb-6">
          Log in or sign up
        </h1>

        {/* Phone number or email input field */}
        <div className="relative">
          <input
            type="text"
            placeholder="Phone number or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            className="w-full px-4 py-3.5 rounded-xl border border-neutral-400 text-base text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
          />
        </div>

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleContinue}
          className="w-full mt-4 py-3.5 rounded-xl bg-[#E00B41] hover:bg-[#D70466] active:scale-[0.99] text-white font-semibold text-base transition shadow-sm cursor-pointer"
        >
          Continue
        </button>

        {/* "or" Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-neutral-200 w-full" />
          <span className="bg-white px-4 text-xs text-neutral-500 font-normal absolute">
            or
          </span>
        </div>

        {/* Social Authentication Buttons (Google & Apple) */}
        <div className="flex items-center justify-center gap-4">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            aria-label="Continue with Google"
            className="w-16 h-14 rounded-2xl border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 hover:border-neutral-400 active:scale-95 transition shadow-xs cursor-pointer"
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

          {/* Apple Button */}
          <button
            type="button"
            onClick={handleAppleSignIn}
            aria-label="Continue with Apple"
            className="w-16 h-14 rounded-2xl border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 hover:border-neutral-400 active:scale-95 transition shadow-xs cursor-pointer"
            title="Continue with Apple"
          >
            <svg className="w-5 h-5 fill-current text-black" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.75-11.96-14.13-7.51-11.19-13.3-24.16-17.38-38.92-4.08-14.77-6.13-28.53-6.13-41.29 0-16.71 4.2-30.73 12.59-42.06 8.39-11.33 18.99-17.15 31.8-17.47 5.75 0 12.06 1.54 18.91 4.62 6.86 3.09 11.2 4.68 13.04 4.79 1.34 0 5.86-1.63 13.56-4.89 7.7-3.26 14.1-4.73 19.2-4.43 14.34.87 25.86 5.89 34.56 15.06-12.72 7.72-18.92 18.23-18.6 31.52.27 10.33 4.28 19.14 12.04 26.43 7.76 7.28 17.07 11.45 27.93 12.5-2.23 7.07-5.1 14.57-8.61 22.49zM119.22 31.85c0-7.28 2.66-14.42 7.99-21.41 5.33-6.99 12.04-11.53 20.14-13.62.45 1.79.67 3.48.67 5.08 0 7.39-2.73 14.62-8.19 21.68-5.46 7.07-12.18 11.53-20.15 13.38-.11-1.68-.46-3.38-.46-5.11z" />
            </svg>
          </button>
        </div>

        {/* Subtle demo accounts selector */}
        <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
          <p className="text-[11px] text-neutral-400 mb-2">Instant Demo Accounts:</p>
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
    </div>
  );
}
