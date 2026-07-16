import React from 'react';

interface LogoProps {
  className?: string;
  strokeWidth?: number;
}

export default function Logo({ className = "w-12 h-12", strokeWidth = 4 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} text-black transition-colors duration-300`}
    >
      {/* Background Door Frame Structure */}
      {/* Left frame vertical line */}
      <path
        d="M 31 20 L 31 72"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Outer boundary of the door structure */}
      <path
        d="M 31 20 L 56 20 L 56 72"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Open Door perspective panel */}
      <path
        d="M 31 20 L 48 29 L 48 72 M 48 72 L 56 72"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dynamic Arrow forming 'V' shape inside the door */}
      {/* The path starts on the left, dips down to form V, rises, then shoots right */}
      <path
        d="M 32 37 L 38 37 L 43 62 L 53 42 L 63 42"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Arrowhead on the right */}
      <path
        d="M 57 35 L 64 42 L 57 49"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
