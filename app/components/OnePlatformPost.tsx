import React from 'react';
import EditableText from './EditableText';
import { ShoppingBag, TrendingUp, Users, FileText, Truck, Brain } from 'lucide-react';

export default function OnePlatformPost() {
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto bg-[#EAF4EE] text-[#1B4332] font-sans">
        
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{backgroundImage: 'linear-gradient(#1B4332 1px, transparent 1px), linear-gradient(90deg, #1B4332 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">

                {/* Central Hub */}
                <div className="relative z-20 w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-12 border border-[#40916C]/10">
                     <span className="text-[#1B4332] font-black text-2xl tracking-widest">SYLO</span>
                </div>

                {/* Orbiting Icons */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    
                    {/* Top Center - POS */}
                    <div className="absolute top-[18%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#1B4332] rounded-full flex items-center justify-center shadow-lg text-white animate-bounce-slow">
                            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <EditableText className="text-xs sm:text-sm font-black tracking-wide text-[#1B4332]">الكاشير</EditableText>
                    </div>

                    {/* Top Right - Delivery */}
                    <div className="absolute top-[28%] right-[12%] sm:right-[15%] flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[#40916C] rounded-full flex items-center justify-center shadow-lg text-white animate-pulse-slow">
                            <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                         <EditableText className="text-[10px] sm:text-xs font-black tracking-wide text-[#1B4332]">توصيل</EditableText>
                    </div>

                    {/* Bottom Right - Finance */}
                    <div className="absolute bottom-[28%] right-[12%] sm:right-[15%] flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[#52B788] rounded-full flex items-center justify-center shadow-lg text-white animate-pulse-slow">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                         <EditableText className="text-[10px] sm:text-xs font-black tracking-wide text-[#1B4332]">محاسبة</EditableText>
                    </div>

                    {/* Bottom Center - Analytics */}
                    <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#1B4332] rounded-full flex items-center justify-center shadow-lg text-white animate-bounce-slow">
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                         <EditableText className="text-xs sm:text-sm font-black tracking-wide text-[#1B4332]">تقارير</EditableText>
                    </div>

                    {/* Bottom Left - AI */}
                    <div className="absolute bottom-[28%] left-[12%] sm:left-[15%] flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[#40916C] rounded-full flex items-center justify-center shadow-lg text-white animate-pulse-slow">
                            <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                         <EditableText className="text-[10px] sm:text-xs font-black tracking-wide text-[#1B4332]">ذكاء</EditableText>
                    </div>

                    {/* Top Left - HR */}
                    <div className="absolute top-[28%] left-[12%] sm:left-[15%] flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[#52B788] rounded-full flex items-center justify-center shadow-lg text-white animate-pulse-slow">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                         <EditableText className="text-[10px] sm:text-xs font-black tracking-wide text-[#1B4332]">موظفين</EditableText>
                    </div>

                </div>

                 {/* Connecting Lines (SVG Overlay) */}
                 <svg className="absolute inset-0 w-full h-full z-0 opacity-20 pointer-events-none">
                    <line x1="50%" y1="50%" x2="50%" y2="25%" stroke="#1B4332" strokeWidth="2" /> {/* Center to Top */}
                    <line x1="50%" y1="50%" x2="50%" y2="75%" stroke="#1B4332" strokeWidth="2" /> {/* Center to Bottom */}
                    <line x1="50%" y1="50%" x2="20%" y2="35%" stroke="#1B4332" strokeWidth="2" /> {/* Center to Top Left */}
                    <line x1="50%" y1="50%" x2="80%" y2="35%" stroke="#1B4332" strokeWidth="2" /> {/* Center to Top Right */}
                    <line x1="50%" y1="50%" x2="20%" y2="65%" stroke="#1B4332" strokeWidth="2" /> {/* Center to Bottom Left */}
                    <line x1="50%" y1="50%" x2="80%" y2="65%" stroke="#1B4332" strokeWidth="2" /> {/* Center to Bottom Right */}
                    
                    {/* Dashed Orbit Circle */}
                    <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#1B4332" strokeWidth="2" strokeDasharray="8 8" opacity="0.3" className="animate-spin-slow" style={{transformOrigin: 'center'}} />
                </svg>
            </div>

            {/* Bottom Text */}
             <div className="absolute bottom-6 w-full text-center z-30 font-bold" dir="rtl">
                <EditableText as="h2" className="text-4xl font-black mb-1 tracking-tight text-[#1B4332]">منصة واحدة.</EditableText>
                <EditableText as="p" className="text-[#40916C] text-lg font-bold">إمكانيات لا محدودة.</EditableText>
            </div>

      </div>
  );
}
