import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const LogoIcon: React.FC<LogoIconProps> = ({
  className = '',
  size = 24,
  color = 'currentColor',
  strokeWidth = 9
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Circle Ring (fills to the edge, zero padding) */}
      <circle cx="50" cy="50" r="45.5" />
      
      {/* Inner Bold S-Curve (scaled up and spaced for thick separating curve) */}
      <path
        d="M 35 37 C 35 18, 65 18, 65 37 C 65 48, 35 52, 35 63 C 35 82, 65 82, 65 63"
        strokeWidth={strokeWidth * 1.33}
      />
    </svg>
  );
};
