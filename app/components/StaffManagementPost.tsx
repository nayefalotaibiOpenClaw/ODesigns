import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { Command, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function StaffManagementPost() {
  const ratio = useAspectRatio();
  const isTall = ratio === '9:16' || ratio === '3:4';
  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto bg-[#EAF4EE] text-[#1B4332] font-sans" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Background with Subtle Pattern */}
      <div className="absolute inset-0 bg-[#EAF4EE]"></div>
      <div className="absolute inset-0 opacity-[0.03]"
           style={{backgroundImage: 'linear-gradient(#1B4332 1px, transparent 1px), linear-gradient(90deg, #1B4332 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <DraggableWrapper id="logo-staff" className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#1B4332] rounded-xl flex items-center justify-center shadow-lg">
                <Command size={24} className="text-[#B7FF5B]" strokeWidth={2.5} />
             </div>
             <div className="flex flex-col leading-none">
                <span className="text-[#1B4332] font-black text-xl tracking-tight">SYLO</span>
                <span className="text-[9px] text-[#40916C] font-bold uppercase tracking-widest mt-1">TEAM HUB</span>
             </div>
          </DraggableWrapper>
          <DraggableWrapper id="badge-staff" className="px-4 py-1.5 bg-[#1B4332] rounded-full flex items-center gap-2 shadow-md">
             <div className="w-1.5 h-1.5 rounded-full bg-[#B7FF5B] animate-pulse"></div>
             <span className="text-[9px] font-black text-white tracking-widest uppercase">LIVE TRACKING</span>
          </DraggableWrapper>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col mt-6">
           {/* Headline Area - Draggable */}
           <DraggableWrapper id="headline-staff" className="text-right mb-6" dir="rtl">
              <h2 className="text-5xl font-black leading-tight text-[#1B4332]">
                 <EditableText>فريقك..</EditableText> <br/>
                 <span className="text-[#40916C]"><EditableText>بنظرة وحدة</EditableText></span>
              </h2>
              <p className="text-[#1B4332]/60 font-bold mt-1 text-lg">
                 <EditableText>نظام متكامل لمتابعة حضور وانصراف الموظفين</EditableText>
              </p>
           </DraggableWrapper>

           {/* Visual Section */}
           <div className="flex-1 flex items-center gap-6">
              {/* iPhone Mockup (Left) - Draggable */}
              <DraggableWrapper id="mockup-staff" className={`relative shrink-0 transform -rotate-2 z-20 ${isTall ? 'w-[280px] h-[540px]' : 'w-[210px] h-[320px]'}`}>
                 {/* Shadows */}
                 <div className="absolute -bottom-2 w-full h-4 bg-black/10 blur-xl rounded-full"></div>
                 
                 {/* Hardware Buttons */}
                 <div className="absolute -left-[6px] top-16 w-[2px] h-10 bg-[#1B4332]/20 rounded-l-md"></div>
                 <div className="absolute -right-[6px] top-24 w-[2px] h-14 bg-[#1B4332]/20 rounded-r-md"></div>

                 <div className="relative h-full w-full rounded-[40px] border-[6px] border-[#1B4332] overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-white">
                        <img src="/2.jpg" alt="Staff List" className="w-full h-full object-cover object-top" />
                        {/* Glass Reflections */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                    </div>
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#1B4332] rounded-b-xl z-20"></div>
                 </div>
              </DraggableWrapper>

              {/* Feature Cards Column - Individual Draggable Cards */}
              <div className="flex flex-col gap-3 w-full" dir="rtl">
                 {[
                    { id: 'card-staff-1', icon: Clock, text: "ساعات العمل بدقة" },
                    { id: 'card-staff-2', icon: ShieldCheck, text: "تقارير الحضور والغياب" },
                    { id: 'card-staff-3', icon: Zap, text: "إدارة الإجازات فوراً" }
                 ].map((item, i) => (
                    <DraggableWrapper key={item.id} id={item.id} className="bg-white border-2 border-[#1B4332]/5 p-3 rounded-2xl flex items-center gap-3 shadow-sm transform transition-transform hover:translate-x-[-4px]">
                       <div className="w-10 h-10 bg-[#EAF4EE] rounded-xl flex items-center justify-center text-[#1B4332]">
                          <item.icon size={20} />
                       </div>
                       <EditableText className="text-sm font-black text-[#1B4332]">{item.text}</EditableText>
                    </DraggableWrapper>
                 ))}
              </div>
           </div>
        </div>

        {/* Brand Label */}
        <DraggableWrapper id="label-staff" className="mt-4 pt-4 border-t border-[#1B4332]/10 text-center">
           <span className="text-[10px] font-black text-[#40916C] tracking-[0.3em] uppercase">TEAM MANAGEMENT REDEFINED</span>
        </DraggableWrapper>

      </div>
    </div>
  );
}
