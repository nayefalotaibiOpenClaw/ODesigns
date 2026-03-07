import React from 'react';
import EditableText from './EditableText';
import { MousePointer2, TrendingUp, BarChart3, PieChart } from 'lucide-react';

export default function AnalyticsPost() {
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto bg-[#1B4332] text-white font-sans">
            {/* Background Grid */}
             <div className="absolute inset-0 bg-gradient-to-br from-[#1B4332] to-[#0D241C]"></div>
             <div className="absolute inset-0 opacity-10" 
                  style={{backgroundImage: 'radial-gradient(#52B788 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
             </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">
                
                {/* Header */}
                <div className="text-center mt-6">
                    <EditableText as="h2" className="text-4xl sm:text-5xl font-black mb-2 tracking-tight text-[#EAF4EE]">أرقامك بذكاء</EditableText>
                    <EditableText as="p" className="text-[#52B788] text-lg sm:text-xl font-bold">كل بياناتك في شاشة واحدة</EditableText>
                </div>

                {/* Central Visual - Dashboard UI */}
                <div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                    
                    {/* Top Stat Row */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                            <EditableText className="text-xs text-gray-300 font-bold mb-1">المبيعات اليومية</EditableText>
                            <span className="text-3xl font-black text-white">KD 1,420</span>
                        </div>
                        <div className="bg-[#40916C] text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                            <TrendingUp size={12} />
                            <span>+12%</span>
                        </div>
                    </div>

                    {/* Chart Area (CSS Only) */}
                    <div className="h-24 w-full flex items-end gap-2 mb-6">
                        <div className="flex-1 bg-white/10 rounded-t-sm h-[40%] animate-pulse-slow delay-100"></div>
                        <div className="flex-1 bg-white/20 rounded-t-sm h-[60%] animate-pulse-slow delay-200"></div>
                        <div className="flex-1 bg-white/10 rounded-t-sm h-[30%] animate-pulse-slow delay-300"></div>
                        <div className="flex-1 bg-white/30 rounded-t-sm h-[80%] animate-pulse-slow delay-100"></div>
                        <div className="flex-1 bg-[#52B788] rounded-t-sm h-[100%] shadow-[0_0_15px_rgba(82,183,136,0.5)] animate-pulse-slow"></div>
                        <div className="flex-1 bg-white/20 rounded-t-sm h-[50%] animate-pulse-slow delay-200"></div>
                        <div className="flex-1 bg-white/10 rounded-t-sm h-[20%] animate-pulse-slow delay-300"></div>
                    </div>

                    {/* Bottom Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/20 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                            <div className="w-8 h-8 bg-[#40916C] rounded-lg flex items-center justify-center">
                                <BarChart3 size={16} />
                            </div>
                            <div className="flex flex-col">
                                <EditableText className="text-[10px] text-gray-300 font-bold">الأكثر مبيعاً</EditableText>
                                <span className="text-sm font-bold">برجر</span>
                            </div>
                        </div>
                        <div className="bg-black/20 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                            <div className="w-8 h-8 bg-purple-500/80 rounded-lg flex items-center justify-center">
                                <PieChart size={16} />
                            </div>
                            <div className="flex flex-col">
                                <EditableText className="text-[10px] text-gray-300 font-bold">طرق الدفع</EditableText>
                                <span className="text-sm font-bold">K-NET</span>
                            </div>
                        </div>
                    </div>

                    {/* Mouse Cursor Overlay */}
                    <div className="absolute -bottom-4 -right-4 bg-white text-[#1B4332] p-2 rounded-full shadow-lg transform rotate-[-12deg]">
                        <MousePointer2 size={24} fill="#1B4332" />
                    </div>

                </div>

                {/* Footer Text */}
                <div className="text-center opacity-80 mt-4">
                    <EditableText as="p" className="text-xs font-bold tracking-widest text-[#52B788]">SYLO ANALYTICS</EditableText>
                </div>

            </div>
      </div>
  );
}
