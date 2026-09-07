"use client";

import React from "react";

export function HostIllustration({ className = "w-12 h-14" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Soft shadow underneath */}
      <ellipse cx="50" cy="124" rx="22" ry="4" fill="#000000" fillOpacity="0.12" />

      {/* Shoes */}
      <ellipse cx="43" cy="120" rx="6" ry="3.5" fill="#3D2314" />
      <ellipse cx="57" cy="121" rx="6" ry="3.5" fill="#3D2314" />

      {/* Trousers - Khaki beige */}
      <path
        d="M39 76 L42 118 L46 118 L49 84 L52 118 L56 118 L60 76 Z"
        fill="#C4B59D"
      />
      {/* Trousers shading */}
      <path d="M49 84 L49 116" stroke="#A8987E" strokeWidth="1.5" />

      {/* Torso - Vibrant Red Top / Cardigan */}
      <path
        d="M36 44 C36 40 42 38 50 38 C58 38 64 40 64 44 L62 78 C62 79 38 79 38 78 Z"
        fill="#E03B3B"
      />
      {/* Cardigan buttons/seam */}
      <line x1="50" y1="42" x2="50" y2="76" stroke="#B82626" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Left arm hanging relaxed */}
      <path
        d="M37 45 C32 50 30 62 32 72 C33 74 36 74 37 72 C37 64 39 52 40 47 Z"
        fill="#E03B3B"
      />
      {/* Left hand */}
      <circle cx="33" cy="74" r="3.5" fill="#F3C3A0" />

      {/* Right arm raised in welcoming wave */}
      <path
        d="M63 45 C68 44 74 38 78 28 C80 26 83 28 82 31 C78 42 70 52 63 53 Z"
        fill="#E03B3B"
      />
      {/* Right hand waving */}
      <circle cx="80" cy="26" r="4.5" fill="#F3C3A0" />
      <path d="M82 23 C84 22 86 24 85 26" stroke="#F3C3A0" strokeWidth="1.5" strokeLinecap="round" />

      {/* Neck */}
      <rect x="47" y="32" width="6" height="8" rx="3" fill="#F3C3A0" />

      {/* Head */}
      <circle cx="50" cy="24" r="11" fill="#F3C3A0" />

      {/* Hair - Stylish dark brunette bun/bob */}
      <path
        d="M39 22 C39 12 45 8 50 8 C57 8 62 12 62 21 C62 25 61 28 59 30 C58 26 56 20 50 20 C44 20 41 24 40 28 C39 26 39 24 39 22 Z"
        fill="#3A2312"
      />
      {/* Hair bun */}
      <circle cx="50" cy="7" r="5" fill="#3A2312" />

      {/* Friendly facial features */}
      <circle cx="47" cy="24" r="1" fill="#2E1B0D" />
      <circle cx="53" cy="24" r="1" fill="#2E1B0D" />
      <path d="M48 28 C49 30 51 30 52 28" stroke="#D17552" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
