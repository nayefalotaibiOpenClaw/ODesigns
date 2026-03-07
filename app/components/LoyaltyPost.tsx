import React from 'react';
import EditableText from './EditableText';
import { Gift, Heart, Star, QrCode } from 'lucide-react';

export default function LoyaltyPost() {
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto bg-[#F9FAFB] text-[#1B4332] font-sans">
            {/* Background Pattern */}
             <div className="absolute inset-0 bg-gradient-to-tr from-[#EAF4EE] via-white to-[#FDE68A]/10"></div>
             
             {/* Floating Stars */}
             <div className="absolute top-12 left-12 animate-pulse-slow">
                 <Star fill="#FCD34D" stroke="none" size={24} />
             </div>
             <div className="absolute bottom-24 right-12 animate-pulse-slow delay-300">
                 <Star fill="#FCD34D" stroke="none" size={16} />
             </div>
             <div className="absolute top-1/4 right-1/3 animate-pulse-slow delay-150">
                 <Star fill="#FCD34D" stroke="none" size={12} />
             </div>


            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">
                
                {/* Header */}
                <div className="text-center mt-6">
                    <EditableText as="h2" className="text-4xl sm:text-5xl font-black mb-1 leading-tight text-[#1B4332]">حبّهم يرجع لك</EditableText>
                    <EditableText as="p" className="text-[#40916C] text-lg sm:text-xl font-bold">نظام ولاء متكامل لعملائك</EditableText>
                </div>

                {/* Central Visual - Points Card */}
                <div className="w-full max-w-sm flex items-center justify-center relative mt-6 transform rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
                    
                    {/* Loyalty Card */}
                    <div className="w-full bg-[#1B4332] rounded-2xl p-6 shadow-2xl relative overflow-hidden text-white flex flex-col justify-between h-56">
                        
                        {/* Card Glow */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#52B788] rounded-full blur-3xl opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/40 to-transparent"></div>

                        {/* Top Row */}
                        <div className="flex justify-between items-start z-10">
                            <div className="flex flex-col">
                                <EditableText className="text-[10px] uppercase font-bold tracking-widest text-[#52B788]">Sylo Rewards</EditableText>
                                <EditableText as="h3" className="text-2xl font-black tracking-tight">VIP Member</EditableText>
                            </div>
                            <QrCode size={40} className="bg-white p-1 rounded-md text-black" />
                        </div>

                        {/* Points Display */}
                        <div className="text-center z-10 my-2">
                             <div className="inline-flex items-baseline gap-1">
                                <span className="text-5xl font-black text-[#FCD34D] drop-shadow-md">1,250</span>
                                <EditableText className="text-sm font-bold text-gray-300">نقطة</EditableText>
                             </div>
                             <div className="w-full bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
                                 <div className="w-3/4 h-full bg-[#FCD34D] rounded-full shadow-[0_0_10px_#FCD34D]"></div>
                             </div>
                             <EditableText as="p" className="text-[10px] mt-1 text-gray-300">باقي 250 نقطة للحصول على قهوة مجانية</EditableText>
                        </div>

                        {/* Bottom Row */}
                        <div className="flex justify-between items-end z-10 text-xs font-bold text-gray-400">
                            <span>SARA A.</span>
                            <div className="flex items-center gap-1 text-[#FCD34D]">
                                <Gift size={14} />
                                <EditableText>3 مكافآت</EditableText>
                            </div>
                        </div>

                    </div>

                    {/* Floating Heart */}
                    <div className="absolute -top-6 -right-6 bg-white p-3 rounded-full shadow-lg border-4 border-[#FCD34D] transform rotate-12">
                         <Heart fill="#EF4444" stroke="none" size={24} className="animate-beat" />
                    </div>

                </div>

            </div>
      </div>
  );
}
