import React from "react";

interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
}

/**
 * Pure CSS text logo using Pacifico — a flowing connected script font.
 * variant="dark"  → blue gradient  (navbar / light backgrounds)
 * variant="light" → white          (footer / dark backgrounds)
 */
export function Logo({ variant = "dark", className = "" }: LogoProps) {
  const isDark = variant === "dark";

  return (
    <span
      className={`inline-flex items-center select-none ${className}`}
      aria-label="CognitoByte"
    >
      {/* Small glowing dot accent before the text */}
      <span
        className="mr-1.5 w-2 h-2 rounded-full shrink-0"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #4F6EF7, #7c93ff)"
            : "rgba(255,255,255,0.9)",
          boxShadow: isDark
            ? "0 0 6px 2px rgba(79,110,247,0.55)"
            : "0 0 6px 2px rgba(255,255,255,0.35)",
        }}
        aria-hidden="true"
      />

      {/* Wordmark in Pacifico */}
      <span
        style={{
          fontFamily: "'Pacifico', cursive",
          fontSize: "1.35rem",
          lineHeight: 1,
          letterSpacing: "-0.01em",
          ...(isDark
            ? {
                background: "linear-gradient(135deg, #4F6EF7 0%, #6b85f8 50%, #3a52e8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 1px 4px rgba(79,110,247,0.25))",
              }
            : {
                color: "#ffffff",
                filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.3))",
              }),
        }}
      >
        CognitoByte
      </span>
    </span>
  );
}
