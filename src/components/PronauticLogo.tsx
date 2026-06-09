import React from "react";

interface LogoProps {
  className?: string;
  variant?: "full" | "compact" | "light" | "circular";
}

export function PronauticLogo({ className = "h-14", variant = "full" }: LogoProps) {
  // Circular logo representing the premium official compass badge
  if (variant === "circular") {
    return (
      <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
        {/* Vector representation of curved circular badge with curved path text */}
        <svg 
          viewBox="0 0 160 160" 
          className="w-full h-full" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Defined curved paths for arched typography */}
          <defs>
            {/* Symmetrical downward-sweeping semi-circle arc for bottom text */}
            <path 
              id="circular-text-path" 
              d="M 22,95 A 62,62 0 0,0 138,95" 
              fill="none" 
            />
          </defs>

          {/* 1. Large Circular Red/Orange Ring centered at (80, 72) */}
          <circle 
            cx="80" 
            cy="70" 
            r="44" 
            stroke="#E04F34" 
            strokeWidth="9" 
            fill="none" 
          />

          {/* 2. Beautiful Detailed Yachtsman Compass Star Points centered at (80, 72) */}
          {/* North Point */}
          <path d="M 80 70 L 80 14 L 88 52 Z" fill="#FFFFFF" stroke="#1D3D58" strokeWidth="0.5" />
          <path d="M 80 70 L 80 14 L 72 52 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />

          {/* South Point */}
          <path d="M 80 70 L 80 126 L 72 88 Z" fill="#FFFFFF" stroke="#1D3D58" strokeWidth="0.5" />
          <path d="M 80 70 L 80 126 L 88 88 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />

          {/* East Point */}
          <path d="M 80 70 L 136 70 L 98 78 Z" fill="#FFFFFF" stroke="#1D3D58" strokeWidth="0.5" />
          <path d="M 80 70 L 136 70 L 98 62 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />

          {/* West Point */}
          <path d="M 80 70 L 24 70 L 62 62 Z" fill="#FFFFFF" stroke="#1D3D58" strokeWidth="0.5" />
          <path d="M 80 70 L 24 70 L 62 78 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />

          {/* NE Auxiliary Point */}
          <path d="M 80 70 L 115 35 L 94 54 Z" fill="#FFFFFF" stroke="#1D3D58" strokeWidth="0.5" />
          <path d="M 80 70 L 115 35 L 86 46 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />

          {/* NW Auxiliary Point */}
          <path d="M 80 70 L 45 35 L 74 46 Z" fill="#FFFFFF" stroke="#1D3D58" strokeWidth="0.5" />
          <path d="M 80 70 L 45 35 L 66 54 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />

          {/* SE Auxiliary Point */}
          <path d="M 80 70 L 115 105 L 86 94 Z" fill="#FFFFFF" stroke="#1D3D58" strokeWidth="0.5" />
          <path d="M 80 70 L 115 105 L 94 86 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />

          {/* SW Auxiliary Point */}
          <path d="M 80 70 L 45 105 L 66 86 Z" fill="#FFFFFF" stroke="#1D3D58" strokeWidth="0.5" />
          <path d="M 80 70 L 45 105 L 74 94 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />

          {/* Central Hub Details */}
          <circle cx="80" cy="70" r="9" fill="#122A3D" />
          <circle cx="80" cy="70" r="6" fill="#E04F34" />
          <circle cx="80" cy="70" r="2.5" fill="#FFFFFF" />

          {/* 3. Curved Typography: "PRONAUTIC INICIAL DE ENTRADA / TRAINING CENTRE" */}
          {/* Curved Orange Anchor Label for "PRONAUTIC" spanning across the left sweep */}
          <text className="font-serif select-none fill-[#E04F34] text-[11px] font-black tracking-[0.16em]">
            <textPath href="#circular-text-path" startOffset="3%" textAnchor="start">
              PRONAUTIC
            </textPath>
          </text>

          {/* Curved Blue Anchor Label for "TRAINING CENTRE" spanning across the right sweep */}
          <text className="font-sans select-none fill-[#1D3D58] text-[8.5px] font-black tracking-[0.18em]">
            <textPath href="#circular-text-path" startOffset="51%" textAnchor="start">
              TRAINING CENTRE
            </textPath>
          </text>
        </svg>
      </div>
    );
  }

  // SVG with PRONAUTIC logo and COMPASS icon
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Crisp Compass Rose icon */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-8 h-8 shrink-0 text-[#1D3D58]" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        >
          {/* Outer compass ring */}
          <circle cx="50" cy="50" r="42" className="stroke-[#1D3D58]" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="37" className="stroke-[#E04F34]/30" strokeDasharray="2 2" strokeWidth="1" />
          <circle cx="50" cy="50" r="46" className="stroke-[#1D3D58]/15" strokeWidth="0.5" />
          
          {/* Compass Rose Points */}
          {/* N */}
          <path d="M50 50 L50 15 L54 35 Z" fill="#E04F34" stroke="#E04F34" strokeWidth="0.5" />
          <path d="M50 50 L50 15 L46 35 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />
          
          {/* S */}
          <path d="M50 50 L50 85 L46 65 Z" fill="#E04F34" stroke="#E04F34" strokeWidth="0.5" />
          <path d="M50 50 L50 85 L54 65 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />
          
          {/* E */}
          <path d="M50 50 L85 50 L65 54 Z" fill="#E04F34" stroke="#E04F34" strokeWidth="0.5" />
          <path d="M50 50 L85 50 L65 46 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />
          
          {/* W */}
          <path d="M50 50 L15 50 L35 46 Z" fill="#E04F34" stroke="#E04F34" strokeWidth="0.5" />
          <path d="M50 50 L15 50 L35 54 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />

          {/* NE / NW / SE / SW secondary pointers */}
          <path d="M50 50 L75 25 L65 35 Z" fill="#1D3D58/85" />
          <path d="M50 50 L25 25 L35 35 Z" fill="#1D3D58/85" />
          <path d="M50 50 L75 75 L65 65 Z" fill="#1D3D58/85" />
          <path d="M50 50 L25 75 L35 65 Z" fill="#1D3D58/85" />
          
          {/* Center Hub */}
          <circle cx="50" cy="50" r="5" fill="#E04F34" />
          <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" />
        </svg>
        <div className="flex flex-col">
          <div className="flex items-center text-sm font-black tracking-tight leading-none leading-none">
            <span className="text-[#E04F34] font-serif pr-0.5 font-bold">PR</span>
            <span className="text-[#1D3D58] font-serif font-bold">NAUTIC</span>
          </div>
          <span className="text-[7.5px] text-[#1D3D58] tracking-[0.2em] font-extrabold uppercase leading-none mt-1 font-sans">
            TRAINING CENTRE
          </span>
        </div>
      </div>
    );
  }

  // Full rich logo, matches original image beautifully
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Container holding PR [COMPASS] NAUTIC */}
      <div className="flex items-center justify-center select-none">
        {/* PR */}
        <span className="text-4xl md:text-5xl font-extrabold text-[#E04F34] font-serif tracking-tight pr-1 font-bold">
          PR
        </span>

        {/* Elegant detailed COMPASS ROSE representation for O */}
        <div className="relative w-11 h-11 md:w-14 md:h-14 mx-0.5 flex items-center justify-center">
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full text-[#1D3D58]" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
          >
            {/* Outer rings & Cardinal markings */}
            <circle cx="50" cy="50" r="44" className="stroke-[#E04F34]" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="39" className="stroke-[#1D3D58]" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="34" className="stroke-[#E04F34]/20" strokeWidth="0.5" strokeDasharray="3 3" />
            
            {/* Compass pointers - Sharp 3D style */}
            {/* North Point */}
            <path d="M50 50 L50 12 L55 35 Z" fill="#E04F34" stroke="#E04F34" strokeWidth="0.5" />
            <path d="M50 50 L50 12 L45 35 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />
            
            {/* South Point */}
            <path d="M50 50 L50 88 L45 65 Z" fill="#E04F34" stroke="#E04F34" strokeWidth="0.5" />
            <path d="M50 50 L50 88 L55 65 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />
            
            {/* East Point */}
            <path d="M50 50 L88 50 L65 55 Z" fill="#E04F34" stroke="#E04F34" strokeWidth="0.5" />
            <path d="M50 50 L88 50 L65 45 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />
            
            {/* West Point */}
            <path d="M50 50 L12 50 L35 45 Z" fill="#E04F34" stroke="#E04F34" strokeWidth="0.5" />
            <path d="M50 50 L12 50 L35 55 Z" fill="#1D3D58" stroke="#1D3D58" strokeWidth="0.5" />

            {/* NE / NW / SE / SW smaller auxiliary indices */}
            <path d="M50 50 L76 24 L68 36 Z" fill="#1D3D58" />
            <path d="M50 50 L76 24 L60 28 Z" fill="#E04F34" />
            
            <path d="M50 50 L24 24 L32 36 Z" fill="#1D3D58" />
            <path d="M50 50 L24 24 L40 28 Z" fill="#E04F34" />

            <path d="M50 50 L76 76 L68 64 Z" fill="#1D3D58" />
            <path d="M50 50 L76 76 L60 72 Z" fill="#E04F34" />

            <path d="M50 50 L24 76 L32 64 Z" fill="#1D3D58" />
            <path d="M50 50 L24 76 L40 72 Z" fill="#E04F34" />
            
            {/* Floating details around the center hub */}
            <circle cx="50" cy="50" r="7" fill="#1D3D58" />
            <circle cx="50" cy="50" r="5" fill="#E04F34" />
            <circle cx="50" cy="50" r="2" fill="#FFFFFF" />
          </svg>
        </div>

        {/* NAUTIC */}
        <span className="text-4xl md:text-5xl font-extrabold text-[#1D3D58] font-serif tracking-tight pl-1 font-bold">
          NAUTIC
        </span>
      </div>

      {/* Decorative center divider */}
      <div className="w-56 md:w-64 h-[2px] bg-[#1D3D58] mt-2 mb-1.5 opacity-90 mx-auto" />

      {/* TRAINING CENTRE subheader */}
      <span className="text-[10px] md:text-sm text-[#1D3D58] uppercase font-sans tracking-[0.35em] font-extrabold select-none">
        TRAINING CENTRE
      </span>
    </div>
  );
}
