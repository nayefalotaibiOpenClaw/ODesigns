import React from 'react';
import EditableText from './EditableText';
import { Palmtree, Sun, Plus, Apple, Play } from 'lucide-react';

// You might need to add this font to your layout or global CSS:
// @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

export default function SummerOfferPost() {
  return (
      /* Instagram Post Container (1080x1080 equivalent aspect ratio) - Responsive Wrapper */
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto">
        <div 
            className="absolute inset-0 bg-[#EAF4EE] flex flex-col items-center pt-8 font-sans text-[#1B4332]"
            style={{ fontFamily: "'Cairo', sans-serif" }}
        >
            {/* --- Top Decor: Summer Vibes --- */}
            <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
            
            <div className="relative z-10 text-center mb-4 w-full px-2">
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-2">
                <Palmtree className="w-8 h-8 sm:w-10 sm:h-10 text-[#40916C] rotate-[-15deg] mt-4" strokeWidth={2.5} />
                <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-[#1B4332] leading-[1.1] text-center">
                عـــرض
                <br />
                <span className="relative inline-block">
                    الصيــف
                    <Sun className="absolute -top-6 -left-8 sm:-top-8 sm:-left-10 w-10 h-10 sm:w-14 sm:h-14 text-[#F4A261] animate-spin-slow" fill="#F4A261" stroke="none" />
                </span>
                </h1>
                <Palmtree className="w-8 h-8 sm:w-10 sm:h-10 text-[#40916C] rotate-[15deg] mt-4" strokeWidth={2.5} />
            </div>
            </div>

            {/* --- Pricing Pill --- */}
            <div className="relative z-10 flex items-center gap-4 sm:gap-6 mb-6 mt-2 scale-90 sm:scale-100">
                {/* Old Price */}
                <div className="relative pt-2">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-400 line-through decoration-4 decoration-red-400/60">400 KD</span>
                </div>

                {/* New Price Tag */}
                <div className="bg-[#1B4332] text-white px-8 sm:px-10 py-2 rounded-full shadow-xl transform -rotate-2 flex items-center gap-2 sm:gap-3 border-4 border-white/10">
                    <span className="text-5xl sm:text-6xl font-black tracking-tighter pt-2">199</span>
                    <div className="flex flex-col items-start justify-center leading-none gap-1 pt-1">
                        <span className="text-xl sm:text-2xl font-bold">KD</span>
                        <span className="text-xs sm:text-sm opacity-90 font-medium whitespace-nowrap">بالسنة</span>
                    </div>
                </div>
            </div>

            {/* --- Features --- */}
            <div className="flex items-center justify-center w-full gap-2 sm:gap-4 text-lg sm:text-2xl font-bold mb-6 text-[#1B4332] px-2 flex-wrap sm:flex-nowrap">
                <EditableText className="whitespace-nowrap">موقع الكتروني</EditableText>
                <div className="bg-[#40916C]/10 rounded-full p-1 shrink-0">
                    <Plus className="w-4 h-4 sm:w-6 sm:h-6 text-[#40916C]" strokeWidth={4} />
                </div>
                <EditableText className="whitespace-nowrap">نظام نقطة البيع</EditableText>
            </div>

            {/* --- Device Mockups (CSS Only) --- */}
            <div className="flex items-end justify-center mt-auto relative w-full px-4 pb-0 h-[180px] sm:h-[220px]">
                
                {/* POS Screen (Left) - Using Screenshot */}
                <div className="relative z-20 transform translate-x-8 sm:translate-x-12 translate-y-4 scale-100 sm:scale-110">
                    <div className="w-36 h-28 sm:w-48 sm:h-36 bg-gray-900 rounded-t-lg border-[6px] border-gray-800 shadow-2xl overflow-hidden relative">
                        {/* Screen Content - Image */}
                        <div className="w-full h-full bg-white relative">
                            <img 
                                src="/pos-screen.jpg" 
                                alt="POS Interface" 
                                className="w-full h-full object-cover object-top"
                            />
                            {/* Overlay to simulate screen glow/reflection */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                    <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gray-800 mx-auto rounded-b-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"></div>
                    <div className="w-16 sm:w-24 h-2 bg-black/20 mx-auto rounded-full mt-1 blur-sm"></div>
                </div>

                {/* Laptop (Right) - Using Screenshot as Dashboard */}
                <div className="relative z-10 transform -translate-x-4 sm:-translate-x-6 scale-100 sm:scale-110">
                    {/* Lid */}
                    <div className="w-56 h-32 sm:w-72 sm:h-44 bg-gray-800 rounded-t-xl border-[6px] border-gray-700 shadow-2xl overflow-hidden relative group">
                        {/* Screen Content - Image (Simulating Dashboard View) */}
                        <div className="w-full h-full bg-white relative">
                            <img 
                                src="/pos-screen.jpg" 
                                alt="Dashboard Interface" 
                                className="w-full h-full object-cover object-left-top"
                            />
                            {/* Overlay to differentiate slightly */}
                            <div className="absolute inset-0 bg-blue-900/10 pointer-events-none"></div>
                        </div>
                    </div>
                    {/* Base */}
                    <div className="w-64 sm:w-80 h-3 sm:h-4 bg-gray-700 rounded-b-xl mx-auto shadow-xl relative border-t border-gray-600">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-1 sm:h-1.5 bg-gray-600 rounded-b-md"></div>
                    </div>
                </div>

            </div>

            {/* --- App Store Badges (Bottom Right Floating) --- */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex flex-col gap-1.5 sm:gap-2 z-30 scale-75 origin-bottom-right sm:scale-100">
                <div className="bg-black/90 text-white px-3 py-1.5 rounded-md flex items-center gap-2 w-[130px] border border-white/20 shadow-lg backdrop-blur-sm">
                    <Apple size={18} fill="white" className="shrink-0" />
                    <div className="flex flex-col leading-none">
                        <span className="text-[9px] font-light opacity-90">Download on the</span>
                        <span className="text-[11px] font-bold tracking-wide">App Store</span>
                    </div>
                </div>
                <div className="bg-black/90 text-white px-3 py-1.5 rounded-md flex items-center gap-2 w-[130px] border border-white/20 shadow-lg backdrop-blur-sm">
                    <Play size={18} fill="white" className="shrink-0" />
                    <div className="flex flex-col leading-none">
                        <span className="text-[9px] font-light opacity-90">GET IT ON</span>
                        <span className="text-[11px] font-bold tracking-wide">Google Play</span>
                    </div>
                </div>
            </div>

            {/* --- Queue Branding (Bottom Left) --- */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-30">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1B4332] rounded-full flex items-center justify-center shadow-lg border-2 border-[#EAF4EE]">
                    <span className="text-white font-bold text-xs sm:text-sm">Q</span>
                </div>
            </div>

        </div>
      </div>
  );
}
