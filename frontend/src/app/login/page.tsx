"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth";

export default function AuthPage() {
  const router = useRouter();

  return (
    <div className="min-h-[90vh] bg-neutral-100 flex items-center justify-center p-4">
      <AuthCard
        onClose={() => router.push("/")}
        onSuccess={() => router.push("/")}
        isPage
      />
    </div>
  );
}
