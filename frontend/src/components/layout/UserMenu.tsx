"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Globe, HelpCircle, ShieldCheck } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { HostIllustration } from "@/components/layout/HostIllustration";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    currentUser,
    currentRole,
    isLoggedIn,
    setIsAuthModalOpen,
    logoutUser,
    toggleRole,
  } = useUser();
  const { info, success } = useToast();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHostButtonClick = () => {
    if (currentRole === "guest") {
      router.push("/host/create");
    } else {
      router.push("/host");
    }
  };

  const handleLogout = () => {
    logoutUser();
    setIsOpen(false);
    info("Signed out of demo account.");
  };

  return (
    <div className="relative flex items-center gap-1.5" ref={menuRef}>
      {/* 1. "Become a host" link */}
      <button
        onClick={handleHostButtonClick}
        className="hidden md:block text-sm font-semibold py-2.5 px-4 rounded-full hover:bg-neutral-100 transition duration-150 text-neutral-900"
        type="button"
      >
        Become a host
      </button>

      {/* 2. Language / Currency Globe */}
      <button
        onClick={() => info("Language: English (IN) · Currency: ₹ INR")}
        className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-800 transition duration-150"
        title="Language & Currency (INR)"
        type="button"
      >
        <Globe className="h-4 w-4" />
      </button>

      {/* 3. User Menu Trigger Button: Circular button with 3-bar hamburger icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User navigation menu"
        aria-expanded={isOpen}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition duration-150 border border-transparent ${
          isOpen ? "bg-neutral-200/90 shadow-sm" : "bg-neutral-100 hover:bg-neutral-200/80"
        }`}
        type="button"
      >
        <Menu className="h-4 w-4 text-neutral-800 stroke-[2.5]" />
      </button>

      {/* 4. Dropdown Menu (Direct Replica of Reference Image) */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-3xl shadow-2xl border border-neutral-200/80 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          {!isLoggedIn ? (
            /* Unauthenticated / Demo Visitor State (Exact Visual Match to User's Uploaded Screenshot) */
            <div>
              {/* Help Centre */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  info("Anywherebnb 24/7 Support: support@anywherebnb.in");
                }}
                className="w-full flex items-center gap-3.5 px-5 py-3 hover:bg-neutral-50 cursor-pointer transition text-neutral-800 text-left rounded-t-3xl"
              >
                <HelpCircle className="w-5 h-5 text-neutral-800 stroke-[1.75]" />
                <span className="text-[15px] font-normal text-neutral-800">
                  Help Centre
                </span>
              </button>

              <div className="border-t border-neutral-200/80 my-1" />

              {/* Become a Host Card with Standing Illustration */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/host/create");
                }}
                className="w-full px-5 py-3.5 hover:bg-neutral-50 cursor-pointer transition flex items-center justify-between gap-3 text-left group"
              >
                <div className="flex-1 pr-1">
                  <p className="font-bold text-neutral-900 text-[15px]">
                    Become a host
                  </p>
                  <p className="text-xs text-neutral-500 mt-1 leading-snug">
                    It&apos;s easy to start hosting and earn extra income.
                  </p>
                </div>
                <div className="w-14 h-16 shrink-0 flex items-center justify-center">
                  <HostIllustration className="w-12 h-16" />
                </div>
              </button>

              {/* Refer a host */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  info("Invite hosts to Anywherebnb & earn referral credits!");
                }}
                className="w-full px-5 py-2.5 hover:bg-neutral-50 cursor-pointer transition text-[15px] font-normal text-neutral-800 text-left"
              >
                Refer a host
              </button>

              {/* Find a co-host */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  info("Find local expert co-hosts in Goa, Mumbai, Delhi, etc.");
                }}
                className="w-full px-5 py-2.5 hover:bg-neutral-50 cursor-pointer transition text-[15px] font-normal text-neutral-800 text-left"
              >
                Find a co-host
              </button>

              <div className="border-t border-neutral-200/80 my-1" />

              {/* Log in or sign up */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="w-full px-5 py-3.5 hover:bg-neutral-50 cursor-pointer transition text-[15px] font-semibold text-neutral-900 text-left rounded-b-3xl"
              >
                Log in or sign up
              </button>
            </div>
          ) : (
            /* Logged-In Active User State */
            <div>
              {/* User Identity Header */}
              <div className="px-5 py-3 border-b border-neutral-200/80 flex items-center gap-3">
                <div className="relative">
                  {currentUser?.avatar_url ? (
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-700">
                      {currentUser?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  {currentUser?.is_superhost && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 bg-[#FF385C] text-white p-0.5 rounded-full ring-2 ring-white"
                      title="Superhost"
                    >
                      <ShieldCheck className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-900 truncate">
                    {currentUser?.name || "Demo User"}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {currentUser?.email}
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FF385C]">
                    {currentRole} Mode {currentUser?.is_superhost ? "· Superhost" : ""}
                  </span>
                </div>
              </div>

              {/* User Navigation Links */}
              <div className="py-1.5">
                <Link
                  href="/trips"
                  onClick={() => setIsOpen(false)}
                  className="block px-5 py-2.5 text-[15px] text-neutral-800 hover:bg-neutral-50 transition"
                >
                  My Trips
                </Link>
                <Link
                  href="/wishlists"
                  onClick={() => setIsOpen(false)}
                  className="block px-5 py-2.5 text-[15px] text-neutral-800 hover:bg-neutral-50 transition"
                >
                  Wishlists
                </Link>
                <Link
                  href="/host"
                  onClick={() => setIsOpen(false)}
                  className="block px-5 py-2.5 text-[15px] text-neutral-800 hover:bg-neutral-50 transition font-medium"
                >
                  Host Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    toggleRole();
                    setIsOpen(false);
                    success(
                      `Switched to ${currentRole === "guest" ? "Host" : "Guest"} Mode`
                    );
                  }}
                  className="w-full text-left px-5 py-2.5 text-[15px] text-neutral-800 hover:bg-neutral-50 transition"
                >
                  {currentRole === "guest" ? "Switch to Hosting" : "Switch to Traveling"}
                </button>
              </div>

              <div className="border-t border-neutral-200/80 my-1" />

              {/* Account Switch / Auth Modal */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="w-full text-left px-5 py-2.5 text-[15px] text-neutral-800 hover:bg-neutral-50 transition"
              >
                Switch Account Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  info("Anywherebnb 24/7 Support: support@anywherebnb.in");
                }}
                className="w-full flex items-center gap-3.5 px-5 py-2.5 hover:bg-neutral-50 transition text-neutral-800 text-left"
              >
                <HelpCircle className="w-4 h-4 text-neutral-600" />
                <span className="text-[15px] font-normal">Help Centre</span>
              </button>

              <div className="border-t border-neutral-200/80 my-1" />

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-5 py-3 hover:bg-neutral-50 transition text-[15px] font-semibold text-neutral-900 rounded-b-3xl"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
