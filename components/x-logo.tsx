import React from 'react';

interface XLogoProps {
  size?: number;  // Size in pixels
}

/**
 * Blue X Logo for XponentL branding
 */
export function XLogo({ size = 32 }: XLogoProps) {
  return (
    <div 
      className="relative flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      <svg 
        className="text-blue-600" 
        style={{ width: size * 0.875, height: size * 0.875 }}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M18 6L6 18M6 6L18 18" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
} 