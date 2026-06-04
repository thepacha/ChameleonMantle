import React from 'react';

interface ChameleonLogoProps {
  className?: string;
  animated?: boolean;
}

export function ChameleonLogo({ className = 'w-10 h-10', animated = true }: ChameleonLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      id="chameleon-svg-logo"
    >
      <defs>
        {/* Dynamic color-shifting gradient mimicking a chameleon's skin */}
        <linearGradient id="chameleon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981">
            {animated && (
              <animate
                attributeName="stop-color"
                values="#10b981; #06b6d4; #84cc16; #10b981"
                dur="10s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="100%" stopColor="#059669">
            {animated && (
              <animate
                attributeName="stop-color"
                values="#059669; #0891b2; #65a30d; #059669"
                dur="10s"
                repeatCount="indefinite"
              />
            )}
          </stop>
        </linearGradient>

        {/* Deep electric blue gradient for the cybernetic sentinel eye */}
        <linearGradient id="eye-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        <filter id="chameleon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Concentric-geometric coiled tail */}
      <path
        d="M 28,68 C 15,68 12,50 20,40 C 26,32 38,32 42,42 C 45,49 40,58 32,56 C 27,55 26,48 30,46"
        stroke="url(#chameleon-grad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />

      {/* Main Arching body shell */}
      <path
        d="M 28,68 C 30,55 45,35 68,35 C 75,35 84,40 88,48 C 90,52 86,58 80,62 L 65,70 C 50,78 35,76 28,68 Z"
        fill="url(#chameleon-grad)"
        fillOpacity="0.1"
        stroke="url(#chameleon-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* High-Tech Geometric Low-Poly Crest Facets */}
      <polygon 
        points="38,44 48,38 52,48" 
        stroke="url(#chameleon-grad)" 
        strokeWidth="1.2" 
        strokeOpacity="0.4" 
        fill="none" 
      />
      <polygon 
        points="48,38 60,35 58,48" 
        stroke="url(#chameleon-grad)" 
        strokeWidth="1.2" 
        strokeOpacity="0.4" 
        fill="none" 
      />
      <polygon 
        points="60,35 70,36 66,49" 
        stroke="url(#chameleon-grad)" 
        strokeWidth="1.2" 
        strokeOpacity="0.4" 
        fill="none" 
      />
      <polygon 
        points="70,36 78,41 72,52" 
        stroke="url(#chameleon-grad)" 
        strokeWidth="1.2" 
        strokeOpacity="0.4" 
        fill="none" 
      />

      {/* Sentinel Eye Nest (glowing monitoring orbit) */}
      <circle
        cx="72"
        cy="48"
        r="7.5"
        stroke="url(#chameleon-grad)"
        strokeWidth="2"
        fill="var(--app-bg)"
        opacity="0.95"
      />

      {/* Real-time scanning reticle segments */}
      <path
        d="M 62,48 H 58 M 82,48 H 86 M 72,38 V 34 M 72,58 V 62"
        stroke="url(#chameleon-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Inner cybernetic glowing pupil */}
      <circle
        cx="72"
        cy="48"
        r="3"
        fill="url(#eye-grad)"
        filter="url(#chameleon-glow)"
      >
        {animated && (
          <animate
            attributeName="r"
            values="2.2;3.6;2.2"
            dur="3s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* Subtle details */}
      <path
        d="M 38,65 C 45,67 55,67 62,61"
        stroke="url(#chameleon-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}
