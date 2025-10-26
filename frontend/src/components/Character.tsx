'use client';

import type { Pose } from '@/lib/mascot';

interface CharacterProps {
  pose?: Pose;
  size?: number; // px, default 256
  ariaLabel?: string; // default "Assistant character"
  className?: string;
}

// Simple 2D medical figure component
export default function Character({
  pose = 'idle',
  size = 256,
  ariaLabel = 'Assistant character',
  className = '',
}: CharacterProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
      data-pose={pose}
    >
      <svg
        viewBox="0 0 400 500"
        width={size}
        height={size}
        className="drop-shadow-lg"
      >
        {/* Background circle */}
        <circle
          cx="200"
          cy="250"
          r="190"
          fill="url(#gradient)"
          stroke="rgb(59, 130, 246)"
          strokeWidth="4"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(219, 234, 254)" />
            <stop offset="100%" stopColor="rgb(147, 197, 253)" />
          </linearGradient>
        </defs>

        {/* Medical figure - Doctor/Nurse */}

        {/* Head */}
        <circle
          cx="200"
          cy="120"
          r="45"
          fill="#ffdbac"
          stroke="#d4a574"
          strokeWidth="2"
        />

        {/* Hair */}
        <ellipse cx="200" cy="100" rx="50" ry="30" fill="#4a3728" />

        {/* Cap/Hat base */}
        <path
          d="M 150 85 Q 200 70, 250 85"
          stroke="#ffffff"
          strokeWidth="20"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cross symbol on cap */}
        <g stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none">
          <line x1="200" y1="75" x2="200" y2="95" />
          <line x1="190" y1="85" x2="210" y2="85" />
        </g>

        {/* Eyes */}
        <circle cx="185" cy="115" r="3" fill="#333" />
        <circle cx="215" cy="115" r="3" fill="#333" />

        {/* Smile */}
        <path
          d="M 170 135 Q 200 150, 230 135"
          stroke="#333"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Body */}
        <rect
          x="150"
          y="170"
          width="100"
          height="150"
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth="2"
          rx="5"
        />

        {/* Medical coat */}
        <path
          d="M 150 180 L 200 230 L 250 180 L 250 320 L 150 320 Z"
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth="2"
        />

        {/* Stethoscope */}
        <g stroke="#3b82f6" strokeWidth="4" fill="none">
          {/* Left earpiece */}
          <path d="M 230 180 Q 250 190, 230 210" />
          <circle cx="230" cy="210" r="8" fill="#60a5fa" />

          {/* Main tube */}
          <path d="M 230 210 Q 210 230, 200 280" />

          {/* Right earpiece */}
          <path d="M 200 280 Q 190 300, 180 320" />
          <circle cx="180" cy="320" r="8" fill="#60a5fa" />
        </g>

        {/* Cross on coat */}
        <g stroke="#3b82f6" strokeWidth="6" strokeLinecap="round">
          <line x1="200" y1="220" x2="200" y2="250" />
          <line x1="180" y2="235" y1="235" x2="220" />
        </g>

        {/* Arms */}
        {/* Left arm */}
        <ellipse cx="120" cy="240" rx="20" ry="60" fill="#ffdbac" />

        {/* Right arm */}
        <ellipse cx="280" cy="240" rx="20" ry="60" fill="#ffdbac" />

        {/* Hand gestures based on pose */}
        {pose === 'welcome' && (
          <g>
            {/* Waving hand */}
            <path
              d="M 100 280 Q 95 290, 100 300 Q 105 310, 100 320"
              stroke="#ffdbac"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}

        {pose === 'pointLeft' && (
          <g>
            {/* Pointing finger */}
            <path
              d="M 90 260 L 85 290"
              stroke="#ffdbac"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="85" cy="295" r="4" fill="#ffdbac" />
          </g>
        )}

        {pose === 'celebrate' && (
          <g>
            {/* Celebration hands raised */}
            <path
              d="M 100 240 Q 95 220, 100 200"
              stroke="#ffdbac"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 300 240 Q 305 220, 300 200"
              stroke="#ffdbac"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Stars */}
            <text x="90" y="180" fontSize="20" fill="#fbbf24">
              ✨
            </text>
            <text x="290" y="180" fontSize="20" fill="#fbbf24">
              ✨
            </text>
          </g>
        )}

        {/* Legs */}
        {/* Left leg */}
        <ellipse cx="170" cy="350" rx="15" ry="60" fill="#1e40af" />

        {/* Right leg */}
        <ellipse cx="230" cy="350" rx="15" ry="60" fill="#1e40af" />

        {/* Shoes */}
        <ellipse cx="170" cy="410" rx="20" ry="12" fill="#1f2937" />
        <ellipse cx="230" cy="410" rx="20" ry="12" fill="#1f2937" />
      </svg>
    </div>
  );
}
