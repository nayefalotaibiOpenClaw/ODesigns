import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { Command, RefreshCcw, Boxes, AlertTriangle } from 'lucide-react';

export default function InventoryStockPost() {
  const ratio = useAspectRatio();
  const isTall = ratio === '9:16' || ratio === '3:4';
  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto bg-[#1B4332] text-white font-sans" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Background Texture */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#1B4332] via-[#1B4332] to-[#0D241C]"></div>
      <div className="absolute inset-0 opacity-[0.05]"
           style={{backgroundImage: 'linear-gradient(#B7FF5B 0.5px, transparent 0.5px), linear-gradient(90deg, #B7FF5B 0.5px, transparent 0.5px)', backgroundSize: '24px 24px'}}>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <DraggableWrapper id="logo-inv" className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#B7FF5B] rounded-xl flex items-center justify-center">
                <Command size={24} className="text-[#1B4332]" strokeWidth={2.5} />
             </div>
             <div className="flex flex-col leading-none">
                <span className="text-[#EAF4EE] font-black text-xl tracking-tight">SYLO</span>
                <span className="text-[9px] text-[#52B788] font-bold uppercase tracking-widest mt-1">INVENTORY AI</span>
             </div>
          </DraggableWrapper>
          <DraggableWrapper id="badge-inv" className="px-4 py-1.5 bg-white/10 border border-white/20 rounded-full flex items-center gap-2">
             <RefreshCcw size={12} className="text-[#B7FF5B] animate-spin-slow" />
             <span className="text-[10px] font-black text-[#EAF4EE] tracking-widest uppercase">AUTO-SYNC ON</span>
          </DraggableWrapper>
        </div>

        {/* Headline */}
        <DraggableWrapper id="headline-inv" className="mt-8 text-center z-30" dir="rtl">
           <h2 className="text-5xl font-black leading-tight mb-3 text-[#EAF4EE]">
              <EditableText>وداعاً لنقص</EditableText> <br/>
              <span className="text-[#B7FF5B]"><EditableText>المخزون</EditableText></span>
           </h2>
           <p className="text-[#EAF4EE]/70 font-bold max-w-sm mx-auto text-lg leading-relaxed">
              <EditableText>تحكم كامل بمخزنك، تنبيهات ذكية، وتقارير دقيقة للمواد الأولية</EditableText>
           </p>
        </DraggableWrapper>

        {/* iPhone Mockup (Center) */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
           {/* Ground Shadow */}
           <div className="absolute bottom-4 w-48 h-4 bg-black/40 blur-xl rounded-full"></div>
           
           <div className={`relative z-20 transform translate-y-4 ${isTall ? 'w-[300px] h-[560px]' : 'w-[230px] h-[330px]'}`}>
              
              {/* Hardware Buttons */}
              <div className="absolute -left-[6px] top-16 w-[3px] h-10 bg-[#254d3c] rounded-l-md"></div>
              <div className="absolute -right-[6px] top-24 w-[3px] h-14 bg-[#254d3c] rounded-r-md"></div>

              {/* iPhone Frame */}
              <DraggableWrapper id="mockup-inv" className="absolute inset-0 bg-[#0D241C] rounded-[40px] border-[6px] border-[#254d3c] shadow-2xl overflow-hidden z-20">
                 <div className="absolute inset-0 bg-white">
                    <img src="/3.jpg" alt="Inventory" className="w-full h-full object-cover object-top" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                 </div>
                 {/* Notch */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#0D241C] rounded-b-xl z-20"></div>
              </DraggableWrapper>

              {/* Floating Alert Card */}
              <DraggableWrapper id="alert-inv" className="absolute -left-10 bottom-1/2 bg-white p-3 rounded-2xl shadow-2xl flex items-center gap-3 border-l-4 border-red-500 animate-float-slow z-30">
                 <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                    <AlertTriangle size={18} />
                 </div>
                 <div className="flex flex-col leading-none" dir="rtl">
                    <span className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Alert</span>
                    <span className="text-xs font-black text-[#1B4332]">مخزون منخفض!</span>
                 </div>
              </DraggableWrapper>

              {/* Floating Success Card */}
              <DraggableWrapper id="success-inv" className="absolute -right-8 top-10 bg-white p-3 rounded-2xl shadow-2xl flex items-center gap-3 border-l-4 border-[#B7FF5B] animate-float z-30">
                 <div className="w-8 h-8 bg-[#EAF4EE] rounded-lg flex items-center justify-center text-[#1B4332]">
                    <Boxes size={18} />
                 </div>
                 <div className="flex flex-col leading-none" dir="rtl">
                    <span className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Success</span>
                    <span className="text-xs font-black text-[#1B4332]">قطعة 100+</span>
                 </div>
              </DraggableWrapper>
           </div>
        </div>

      </div>
    </div>
  );
}
