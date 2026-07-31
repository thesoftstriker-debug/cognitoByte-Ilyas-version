"use client";
import { useEffect, useState } from "react";

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 600);
    const removeTimer = setTimeout(() => setVisible(false), 1100);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className="relative flex items-center justify-center">
        <span className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
      </div>
      <p className="mt-6 text-sm font-semibold text-gray-500 tracking-wide uppercase animate-pulse">
        CognitoByte
      </p>
    </div>
  );
}
