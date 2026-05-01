import React from 'react';

export const Logo = ({ size = 80 }: { size?: number }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 400 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer black circle with white stroke */}
      <circle cx="200" cy="200" r="198" fill="#000000" />
      <circle cx="200" cy="200" r="192" stroke="white" strokeWidth="2" />
      
      <defs>
        {/* Adjusted paths for better text alignment */}
        <path id="topTextPath" d="M 60,200 A 140,140 0 0 1 340,200" />
        <path id="bottomTextPath" d="M 50,200 A 150,150 0 0 0 350,200" />
      </defs>
      
      {/* Arched text: XYLOURIS */}
      <text fill="white" fontSize="48" fontWeight="800" fontFamily="'Inter', sans-serif" letterSpacing="12">
        <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
          XYLOURIS
        </textPath>
      </text>

      {/* Bottom Arched Text with bronze separators */}
      <text fill="white" fontSize="22" fontWeight="700" fontFamily="'Inter', sans-serif" letterSpacing="6">
        <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle" dominantBaseline="middle">
          FUEL <tspan fill="#C2A382" fontWeight="900">|</tspan> CHARGE <tspan fill="#C2A382" fontWeight="900">|</tspan> COFFEE <tspan fill="#C2A382" fontWeight="900">|</tspan> SHOP
        </textPath>
      </text>

      {/* Central Bronze Oval */}
      <ellipse cx="200" cy="200" rx="68" ry="100" stroke="#C2A382" strokeWidth="4" />
      
      {/* White Diagonal Cross - Fine lines */}
      <line x1="145" y1="125" x2="255" y2="275" stroke="white" strokeWidth="2" />
      <line x1="255" y1="125" x2="145" y2="275" stroke="white" strokeWidth="2" />
      
      {/* Central X mask circle and text */}
      <circle cx="200" cy="200" r="22" fill="#000000" />
      <text x="200" y="212" fill="white" fontSize="36" fontWeight="900" textAnchor="middle" fontFamily="'Inter', sans-serif">X</text>

      {/* Icons - Precisely placed */}
      
      {/* Fuel Pump (Top) */}
      <g transform="translate(188, 118)">
        <rect x="0" y="0" width="18" height="26" rx="2" stroke="white" strokeWidth="2" fill="none"/>
        <rect x="3" y="4" width="12" height="8" stroke="white" strokeWidth="1.5" fill="none"/>
        <circle cx="9" cy="19" r="2.5" fill="white"/>
        <path d="M19 8 C 24 8, 25 12, 25 20 M25 20 L22 20" stroke="white" strokeWidth="1.5" fill="none"/>
      </g>
      
      {/* Coffee Cup (Left) */}
      <g transform="translate(138, 185)">
        <path d="M2 8 L6 30 L22 30 L26 8 Z" stroke="white" strokeWidth="2" fill="none" />
        <path d="M0 8 L28 8" stroke="white" strokeWidth="2" fill="none" />
        <path d="M10 0 L8 8" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="14" cy="19" r="3" fill="white" />
        <ellipse cx="14" cy="19" rx="5" ry="3" stroke="white" strokeWidth="1" fill="none" />
      </g>
      
      {/* Shopping Basket (Right) */}
      <g transform="translate(235, 188)">
        <path d="M0 6 L30 6 L26 24 L4 24 Z" stroke="white" strokeWidth="2" fill="none" />
        <path d="M5 6 C 5 -2, 25 -2, 25 6" stroke="white" strokeWidth="2" fill="none" />
        <line x1="6" y1="6" x2="6" y2="24" stroke="white" strokeWidth="1" />
        <line x1="12" y1="6" x2="12" y2="24" stroke="white" strokeWidth="1" />
        <line x1="18" y1="6" x2="18" y2="24" stroke="white" strokeWidth="1" />
        <line x1="24" y1="6" x2="24" y2="24" stroke="white" strokeWidth="1" />
        <line x1="0" y1="12" x2="30" y2="12" stroke="white" strokeWidth="1" />
        <line x1="0" y1="18" x2="30" y2="18" stroke="white" strokeWidth="1" />
      </g>
      
      {/* EV Charge (Bottom) */}
      <g transform="translate(188, 252)">
        <rect x="0" y="0" width="18" height="26" rx="2" stroke="white" strokeWidth="2" fill="none"/>
        <path d="M9 6 L6 13 L12 13 L9 20" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 6 C 24 6, 26 10, 26 15 L26 22 M26 22 L23 22 M23 21 V23 M29 21 V23" stroke="white" strokeWidth="1.5" fill="none"/>
      </g>
    </svg>
  );
};

