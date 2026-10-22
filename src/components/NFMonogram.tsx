import React from 'react';

interface NFMonogramProps {
  className?: string;
  size?: number;
  inverted?: boolean;
}

export const NFMonogram: React.FC<NFMonogramProps> = ({
  className = '',
  size = 36,
  inverted = false,
}) => {
  const primaryColor = inverted ? '#F4F0E7' : '#17211D';
  const copperColor = '#B87952';
  const sageColor = '#C8D6B0';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="NF Estate Group Monogram"
    >
      {/* Outer Foundation Shield/Frame */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="14"
        stroke={inverted ? sageColor : primaryColor}
        strokeWidth="3.5"
        strokeOpacity="0.4"
      />

      {/* Building Tower 1: Left column of 'N' */}
      <path
        d="M24 74V26H32V74H24Z"
        fill={inverted ? '#F4F0E7' : primaryColor}
      />

      {/* Diagonal Spire of 'N' that transitions into 'F' */}
      <path
        d="M32 30L56 70H48L24 30H32Z"
        fill={copperColor}
      />

      {/* Building Tower 2: Right column of 'N' / Stem of 'F' */}
      <path
        d="M48 74V26H56V74H48Z"
        fill={inverted ? '#F4F0E7' : primaryColor}
      />

      {/* Top Beam of 'F' (Architectural Cantilever) */}
      <path
        d="M56 26H76V34H56V26Z"
        fill={copperColor}
      />

      {/* Mid Beam of 'F' */}
      <path
        d="M56 46H70V53H56V46Z"
        fill={sageColor}
      />

      {/* Foundation Pedestal */}
      <line
        x1="20"
        y1="76"
        x2="80"
        y2="76"
        stroke={copperColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};
