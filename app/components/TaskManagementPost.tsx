import React from 'react';
import EditableText from './EditableText';
import { ClipboardCheck, CheckCircle2, User, Clock } from 'lucide-react';

export default function TaskManagementPost() {
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto bg-[#1B4332] text-white font-sans">
            {/* Background Pattern */}
             <div className="absolute inset-0 opacity-10" 
                  style={{backgroundImage: 'radial-gradient(#52B788 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
             </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center p-8">
                
                {/* Header */}
                <div className="text-center mt-4 mb-6">
                    <EditableText as="h2" className="text-4xl sm:text-5xl font-black mb-1 leading-tight text-[#EAF4EE]">المهام واضحة</EditableText>
                    <EditableText as="p" className="text-[#52B788] text-lg sm:text-xl font-bold">لا تضيّع وقت فريقك</EditableText>
                </div>

                {/* Central Visual - Task List */}
                <div className="w-full max-w-sm flex flex-col gap-3 relative">
                    
                    {/* Task 1 (Done) */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center justify-between opacity-60">
                        <div className="flex items-center gap-3">
                             <div className="w-6 h-6 bg-[#52B788] rounded-full flex items-center justify-center text-[#1B4332]">
                                 <CheckCircle2 size={16} />
                             </div>
                             <EditableText className="text-sm font-bold line-through text-gray-300">جرد المخزون الصباحي</EditableText>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white/50 flex items-center justify-center text-blue-800 text-xs font-bold">
                            MK
                        </div>
                    </div>

                    {/* Task 2 (Active) */}
                    <div className="bg-white shadow-xl transform scale-105 p-5 rounded-xl flex flex-col gap-3 border-r-8 border-[#40916C] z-20">
                         <div className="flex justify-between items-start">
                             <div className="flex flex-col">
                                 <EditableText className="text-xs text-[#40916C] font-black uppercase mb-1">أولوية عالية</EditableText>
                                 <EditableText as="h3" className="text-lg font-black text-[#1B4332] leading-tight">تجهيز طلبية المورد</EditableText>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-yellow-200 border-2 border-white flex items-center justify-center text-yellow-800 text-xs font-bold shadow-md">
                                SA
                             </div>
                         </div>
                         
                         <div className="flex items-center justify-between text-xs text-gray-500 font-bold border-t border-gray-100 pt-3 mt-1">
                             <div className="flex items-center gap-1.5">
                                 <Clock size={14} />
                                 <span>الموعد: 2:00 PM</span>
                             </div>
                             <div className="bg-[#EAF4EE] px-2 py-0.5 rounded text-[#1B4332]">
                                 جاري العمل
                             </div>
                         </div>
                    </div>

                    {/* Task 3 (Pending) */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center justify-between opacity-80 mt-1">
                        <div className="flex items-center gap-3">
                             <div className="w-6 h-6 border-2 border-white/30 rounded-full"></div>
                             <EditableText className="text-sm font-bold text-white">تنظيف منطقة الكاشير</EditableText>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-red-200 border-2 border-white/50 flex items-center justify-center text-red-800 text-xs font-bold">
                            AA
                        </div>
                    </div>

                    {/* Floating Icons */}
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-[#52B788] p-2 rounded-full shadow-lg transform rotate-12">
                        <ClipboardCheck className="text-[#1B4332]" size={24} />
                    </div>

                </div>

            </div>
      </div>
  );
}
