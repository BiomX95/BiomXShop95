import React from 'react';

interface DiamondIconProps {
  className?: string;
  size?: number;
}

export function DiamondIcon({ className = '', size = 24 }: DiamondIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <defs>
        <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <filter id="diamond-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <path d="M12 1L1 8l11 14L23 8z" fill="url(#diamondGradient)" filter="url(#diamond-shadow)" />
      <path d="M12 1L1 8l11 14L23 8z" strokeWidth="1" opacity="0.9" stroke="#4285f4" />
      <path d="M1 8l11 14" strokeWidth="0.5" stroke="#ffffff" opacity="0.7" />
      <path d="M23 8l-11 14" strokeWidth="0.5" stroke="#ffffff" opacity="0.7" />
      <path d="M8 1l-7 7" strokeWidth="0.5" stroke="#ffffff" opacity="0.7" />
      <path d="M16 1l7 7" strokeWidth="0.5" stroke="#ffffff" opacity="0.7" />
      <path d="M1 8h22" strokeWidth="0.5" stroke="#ffffff" opacity="0.7" />
    </svg>
  );
}

export function DiamondIconShiny({ className = '', size = 24 }: DiamondIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      <defs>
        <linearGradient id="diamondGradientShiny" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="35%" stopColor="#3b82f6" />
          <stop offset="65%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="sparkle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M12 1L1 8l11 14L23 8z" fill="url(#diamondGradientShiny)" filter="url(#glow)" />
      <path d="M1 8h22" stroke="#ffffff" strokeWidth="0.5" opacity="0.8" />
      <path d="M12 1L1 8l11 14L23 8z" stroke="#4285f4" strokeWidth="0.7" opacity="0.9" />
      <path d="M8 3L3 8" stroke="#ffffff" strokeWidth="0.5" opacity="0.8" />
      <path d="M16 3L21 8" stroke="#ffffff" strokeWidth="0.5" opacity="0.8" />
      <path d="M12 1L12 22" stroke="#ffffff" strokeWidth="0.3" opacity="0.5" />
      <path d="M5 5L7 7" stroke="#ffffff" strokeWidth="1" opacity="0.9" />
      <circle cx="6" cy="6" r="0.7" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

export function VoucherIcon({ className = '', size = 24 }: DiamondIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <defs>
        <linearGradient id="voucherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <filter id="voucher-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect x="2" y="4" width="20" height="16" rx="2" fill="url(#voucherGradient)" filter="url(#voucher-shadow)" />
      <line x1="2" y1="10" x2="22" y2="10" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,1" />
      <line x1="12" y1="4" x2="12" y2="20" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2,1" />
      <circle cx="7" cy="15" r="1.5" fill="#ffffff" />
      <circle cx="17" cy="7" r="1.5" fill="#ffffff" />
      <path d="M6 7h6" stroke="#ffffff" strokeWidth="1" />
      <path d="M14 15h4" stroke="#ffffff" strokeWidth="1" />
    </svg>
  );
}

export function EvoPassIcon({ className = '', size = 24 }: DiamondIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <defs>
        <linearGradient id="evoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
        <filter id="evo-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16l-4-2-4 2-4-2-4 2z" fill="url(#evoGradient)" filter="url(#evo-shadow)" />
      <path d="M8 10h8" stroke="#ffffff" strokeWidth="1" />
      <path d="M8 14h5" stroke="#ffffff" strokeWidth="1" />
      <path d="M9 7l3 3 3-3" stroke="#ffffff" strokeWidth="1" fill="none" />
    </svg>
  );
}