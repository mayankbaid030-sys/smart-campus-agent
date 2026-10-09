'use client';

import React from 'react';
import { APP_NAME } from '@/config/app';

export interface LogoProps {
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  variant?: 'dark' | 'light';
  animated?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showWordmark = false,
  variant = 'dark',
  animated = false,
  className = '',
}) => {
  // Map size tokens to numeric pixel sizes
  const getPixelSize = (s: number | string): number => {
    if (typeof s === 'number') return s;
    switch (s) {
      case 'xs':
        return 18;
      case 'sm':
        return 28;
      case 'md':
        return 38;
      case 'lg':
        return 56;
      case 'xl':
        return 72;
      default:
        return 38;
    }
  };

  const pixelSize = getPixelSize(size);
  const isLight = variant === 'light';

  return (
    <div
      role="img"
      aria-label={APP_NAME}
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
    >
      {/* SVG Icon: Circular Gradient Orb with Location Pin */}
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 transition-all ${
          animated ? 'animate-[pulse_3s_ease-in-out_infinite]' : ''
        }`}
        style={
          animated
            ? {
                filter: 'drop-shadow(0 0 16px rgba(124, 58, 237, 0.65)) drop-shadow(0 0 28px rgba(59, 130, 246, 0.45))',
              }
            : {
                filter: 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.35))',
              }
        }
      >
        <defs>
          {/* Violet to Blue Gradient */}
          <linearGradient id="snpu-orb-grad" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          {/* Subtle Outer Glow Filter */}
          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Circular Gradient Orb */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="url(#snpu-orb-grad)"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="2"
        />

        {/* Inner Radial Highlight Ring */}
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Simple crisp white location-pin shape (representing campus + finding people & places) */}
        <path
          d="M50 24C40.611 24 33 31.611 33 41C33 53.5 48.2 72.8 48.85 73.6C49.44 74.34 50.56 74.34 51.15 73.6C51.8 72.8 67 53.5 67 41C67 31.611 59.389 24 50 24ZM50 48C46.134 48 43 44.866 43 41C43 37.134 46.134 34 50 34C53.866 34 57 37.134 57 41C57 44.866 53.866 48 50 48Z"
          fill="#FFFFFF"
        />
      </svg>

      {/* Wordmark in Space Grotesk Bold with matching gradient */}
      {showWordmark && (
        <span
          className={`font-heading font-black tracking-tight leading-none bg-gradient-to-r from-[#A78BFA] via-[#EC4899] to-[#60A5FA] bg-clip-text text-transparent ${
            pixelSize <= 28
              ? 'text-base'
              : pixelSize <= 38
              ? 'text-lg sm:text-xl'
              : 'text-2xl sm:text-3xl'
          }`}
        >
          {APP_NAME}
        </span>
      )}
    </div>
  );
};
