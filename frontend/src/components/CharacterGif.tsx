'use client';

import Image from 'next/image';

interface CharacterProps {
  pose?: string;
  size?: number;
  ariaLabel?: string;
  className?: string;
  src?: string; // New prop for custom GIF source
}

// GIF-based character component with transparent background
export default function CharacterGif({
  pose = 'idle',
  size = 256,
  ariaLabel = 'Assistant character',
  className = '',
  src = '/character.gif', // Default to original character.gif
}: CharacterProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
      data-pose={pose}
    >
      <Image
        src={src}
        alt={ariaLabel}
        width={size}
        height={size}
        className="drop-shadow-lg"
        style={{
          objectFit: 'contain',
          backgroundColor: 'transparent',
        }}
        unoptimized // Required for GIF animations
      />
    </div>
  );
}
