"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Globe, User as UserIcon, Check, ShieldCheck } from "lucide-react";
import { useUser } from "@/context/UserContext";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { currentUser, currentRole, allUsers, switchUser, toggleRole } = useUser();
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

  const handleHostAction = () => {
    if (currentRole === "guest") {
      toggleRole();
      router.push("/host");
    } else {
      router.push("/host/create");
    }
  };

  return (
    <div className="relative flex items-center gap-2" ref={menuRef}>
      {/* "Airbnb your home" button */}
      <button
        onClick={handleHostAction}
        className="hidden md:block text-sm font-semibold py-2 px-3.5 rounded-full hover:bg-airbnb-lightGray transition duration-150 text-airbnb-dark"
      >
        {currentRole === "guest" ? "Airbnb your home" : "Switch to traveling"}
      </button>

      {/* Language / Currency Globe */}
      <button
        className="p-2.5 rounded-full hover:bg-airbnb-lightGray transition duration-150 text-airbnb-dark"
        title="Choose language and currency (Demo: USD)"
        type="button"
      >
        <Globe className="h-4 w-4" />
      </button>

      {/* Profile Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 border border-airbnb-border rounded-full py-1.5 pl-3 pr-2 hover:shadow-airbnb transition duration-200 cursor-pointer"
        type="button"
      >
        <Menu className="h-4 w-4 text-airbnb-dark" />
        <div className="relative">
          {currentUser?.avatar_url ? (
            <img
              src={currentUser.avatar_url}
              alt={currentUser.name}
              className="h-7 w-7 rounded-full object-cover border border-airbnb-border"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-airbnb-gray/20 flex items-center justify-center text-airbnb-dark">
              <UserIcon className="h-4 w-4" />
            </div>
          )}
          {currentUser?.is_superhost && (
            <span
              className="absolute -top-1 -right-1 bg-airbnb-rose text-white p-0.5 rounded-full"
              title="Superhost"
            >
              <ShieldCheck className="h-2.5 w-2.5" />
            </span>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-airbnbModal border border-airbnb-border py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Active User Header */}
          <div className="px-4 py-2 border-b border-airbnb-border">
            <p className="text-xs text-airbnb-gray uppercase tracking-wider font-bold">
              Current Profile
            </p>
            <p className="text-sm font-semibold text-airbnb-dark truncate">
              {currentUser?.name || "Demo User"}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 mt-1 rounded-full bg-airbnb-lightGray text-airbnb-rose capitalize">
              {currentRole} Mode {currentUser?.is_superhost ? "· Superhost" : ""}
            </span>
          </div>

          {/* Role Switcher */}
          <div className="px-2 py-1">
            <button
              onClick={() => {
                toggleRole();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-airbnb-dark hover:bg-airbnb-lightGray rounded-lg transition"
            >
              {currentRole === "guest" ? "Switch to Host Mode" : "Switch to Guest Mode"}
            </button>
          </div>

          <div className="border-t border-airbnb-border my-1" />

          {/* Navigation Links */}
          <div className="px-2 py-1">
            <Link
              href="/trips"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm text-airbnb-dark hover:bg-airbnb-lightGray rounded-lg transition"
            >
              My Trips
            </Link>
            <Link
              href="/wishlists"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm text-airbnb-dark hover:bg-airbnb-lightGray rounded-lg transition"
            >
              Wishlists
            </Link>
            <Link
              href="/host"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm text-airbnb-dark hover:bg-airbnb-lightGray rounded-lg transition font-medium"
            >
              Host Dashboard
            </Link>
            <Link
              href="/host/create"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm text-airbnb-dark hover:bg-airbnb-lightGray rounded-lg transition"
            >
              Airbnb your home
            </Link>
          </div>

          <div className="border-t border-airbnb-border my-1" />

          {/* Demo User Switcher */}
          <div className="px-4 py-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-airbnb-gray mb-1">
              Switch Demo Persona
            </p>
            <div className="space-y-1">
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    switchUser(user.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between text-xs px-2 py-1.5 rounded hover:bg-airbnb-lightGray text-airbnb-dark transition"
                >
                  <span className="truncate">
                    {user.name} ({user.role})
                  </span>
                  {currentUser?.id === user.id && (
                    <Check className="h-3 w-3 text-airbnb-rose" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
