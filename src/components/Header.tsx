import React from 'react';
import { Phone, MapPin } from 'lucide-react';
import { TEXT, THEME } from '../types';

export const Header = () => {
  return (
    <div className="bg-brand-black text-white p-6 pt-10 pb-12 rounded-b-[40px] shadow-xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-brown opacity-10 rounded-full -mr-10 -mt-10" />
      
      <div className="relative z-10 flex flex-col gap-6">
        {/* Top bar with Logo + AVIN tag on the left, and Call Button on the right */}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            {/* Stable, non-interactive logo */}
            <div className="relative flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="AVIN Logo" 
                className="w-14 h-14 rounded-full object-cover shadow-md" 
              />
            </div>
            {/* Stable, non-interactive AVIN tag */}
            <span className="bg-brand-brown text-white font-extrabold text-sm px-4 py-1.5 rounded-xl uppercase tracking-widest shadow-md flex items-center justify-center select-none font-sans">
              AVIN
            </span>
          </div>

          <a href={`tel:${TEXT.phone}`} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm shadow-inner border border-white/5">
            <Phone size={20} className="text-brand-brown" />
          </a>
        </div>

        {/* Business Info Header */}
        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-semibold tracking-widest opacity-60 uppercase">
            Fuel & Coffee
          </h2>
          <h1 className="text-2xl font-bold font-sans tracking-tight leading-tight">
            {TEXT.businessName}
          </h1>
          
          <div className="flex items-center gap-2 text-xs opacity-70 mt-1">
            <MapPin size={14} className="text-brand-brown" />
            <span>{TEXT.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
