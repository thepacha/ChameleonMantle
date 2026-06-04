import React from 'react';

interface ChameleonLogoProps {
  className?: string;
  animated?: boolean;
}

export function ChameleonLogo({ className = 'w-48 h-12', animated = true }: ChameleonLogoProps) {
  return (
    <div className={`${className} relative flex items-center justify-center`} id="chameleon-logo-container">
      {/* Bright (Light) Mode Logo */}
      <img
        src="https://pub-3f89eefcccc34790a13b41ee21b7427f.r2.dev/cropped-Chameleon.svg"
        alt="Chameleon Logo Bright"
        className="w-full h-full object-contain block dark:hidden"
        referrerPolicy="no-referrer"
      />
      {/* Dark Mode Logo */}
      <img
        src="https://pub-3f89eefcccc34790a13b41ee21b7427f.r2.dev/cropped-Chameleon%20-%20BLACK%20BACKGROUND.svg"
        alt="Chameleon Logo Dark"
        className="w-full h-full object-contain hidden dark:block"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
