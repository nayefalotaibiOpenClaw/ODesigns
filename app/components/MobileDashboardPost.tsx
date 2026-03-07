import React from 'react';
import EditableText from './EditableText';
import { Command, Sparkles, Smartphone } from 'lucide-react';

export default function MobileDashboardPost() {
  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto bg-[#1B4332] text-white font-sans" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Background with Brand Texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1B4332] to-[#0D241C]"></div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.05]"
           style={{backgroundImage: 'linear-gradient(#EAF4EE 0.5px, transparent 0.5px), linear-gradient(90deg, #EAF4EE 0.5px, transparent 0.5px)', backgroundSize: '30px 30px'}}>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#B7FF5B] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(183,255,91,0.4)]">
                <Command size={24} className="text-[#1B4332]" strokeWidth={3} />
             </div>
             <div className="flex flex-col leading-none">
                <span className="text-[#EAF4EE] font-black text-2xl tracking-tighter">SYLO</span>
             </div>
          </div>
          
          <div className="px-4 py-1.5 bg-white/10 border border-white/20 rounded-full flex items-center gap-2 backdrop-blur-md">
             <Sparkles size={12} className="text-[#B7FF5B]" />
             <span className="text-[10px] font-black text-[#EAF4EE] tracking-widest uppercase">REAL-TIME DATA</span>
          </div>
        </div>

        {/* Headline */}
        <div className="mt-8 text-right" dir="rtl">
           <h2 className="text-5xl sm:text-6xl font-black leading-[1.1] mb-2 text-[#EAF4EE]">
              <EditableText>أرقامك</EditableText> <br/>
              <span className="text-[#B7FF5B]"><EditableText>تحت السيطرة</EditableText></span>
           </h2>
        </div>

        {/* Realistic iPhone Mockup */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
           {/* Ground Shadow */}
           <div className="absolute bottom-4 w-48 h-4 bg-black/40 blur-xl rounded-full"></div>
           
           <div className="relative w-[230px] h-[360px] z-20">
              
              {/* iPhone Hardware Buttons */}
              <div className="absolute -left-[7px] top-24 w-[3px] h-12 bg-[#254d3c] rounded-l-md"></div> {/* Volume */}
              <div className="absolute -left-[7px] top-40 w-[3px] h-12 bg-[#254d3c] rounded-l-md"></div> {/* Volume */}
              <div className="absolute -right-[7px] top-32 w-[3px] h-16 bg-[#254d3c] rounded-r-md"></div> {/* Power */}

              {/* iPhone Frame */}
              <div className="absolute inset-0 bg-[#0D241C] rounded-[42px] border-[7px] border-[#254d3c] shadow-2xl overflow-hidden">
                 {/* Screen Content */}
                 <div className="absolute inset-0 bg-white">
                    <img src="/1.jpg" alt="Dashboard" className="w-full h-full object-cover object-top" />
                    
                    {/* Screen Reflection Overlay (Glass Effect) */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                 </div>

                 {/* Dynamic Island */}
                 <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full flex items-center justify-end px-3 gap-1 z-30">
                    <div className="w-1 h-1 rounded-full bg-blue-500/40"></div>
                    <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                 </div>
              </div>

              {/* Floating Stat Card */}
              <div className="absolute -right-8 top-16 bg-[#EAF4EE] p-3 rounded-2xl shadow-2xl flex items-center gap-3 transform rotate-3 border-2 border-[#B7FF5B]">
                 <div className="w-8 h-8 bg-[#1B4332] rounded-lg flex items-center justify-center text-[#B7FF5B]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
                 </div>
                 <div className="flex flex-col leading-none">
                    <span className="text-[8px] text-gray-500 font-bold uppercase mb-1">Growth</span>
                    <span className="text-sm font-black text-[#1B4332]">+24%</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex justify-between items-end border-t border-white/10 pt-6" dir="rtl">
           <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[#52B788] font-black uppercase tracking-[0.3em]">SYLO BUSINESS INTELLIGENCE</span>
              <EditableText className="text-sm font-bold text-[#EAF4EE]">تابع مشروعك من أي مكان وفي أي وقت</EditableText>
           </div>
           <div className="w-12 h-12 bg-[#B7FF5B] rounded-2xl flex items-center justify-center text-[#1B4332] shadow-[0_0_20px_rgba(183,255,91,0.2)]">
              <Smartphone size={24} />
           </div>
        </div>

      </div>
    </div>
  );
}
