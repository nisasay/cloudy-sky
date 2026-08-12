import React from 'react';

export const WatercolorBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#F2F4FF]">
      {/* Dynamic Base Radial Watercolor Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at top left, #E0E7FF, #F5F3FF, #EDE9FE)',
        }}
      />

      {/* SVG Blur Filter Definition */}
      <svg className="hidden">
        <defs>
          <filter id="watercolor-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="50" result="blur" />
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" result="noise" />
            <feDisplacementMap in="blur" in2="noise" scale="30" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Editorial Soft Watercolor Organic Blobs */}
      <div
        className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full bg-indigo-200/50 mix-blend-multiply opacity-80 animate-pulse"
        style={{ filter: 'url(#watercolor-blur)', animationDuration: '9s' }}
      />
      <div
        className="absolute top-1/4 -right-20 w-[36rem] h-[36rem] rounded-full bg-purple-200/50 mix-blend-multiply opacity-70 animate-pulse"
        style={{ filter: 'url(#watercolor-blur)', animationDuration: '12s' }}
      />
      <div
        className="absolute -bottom-20 left-10 w-[30rem] h-[30rem] rounded-full bg-sky-200/60 mix-blend-multiply opacity-80 animate-pulse"
        style={{ filter: 'url(#watercolor-blur)', animationDuration: '10s' }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-blue-100/60 mix-blend-multiply opacity-60 animate-pulse"
        style={{ filter: 'url(#watercolor-blur)', animationDuration: '14s' }}
      />

      {/* Fine Paper Texture Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />
    </div>
  );
};

