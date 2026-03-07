import React from 'react';
import EditableText from './EditableText';
import { Receipt, TrendingUp, TrendingDown, DollarSign, ArrowRight } from 'lucide-react';

export default function AccountingPost() {
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto bg-[#1B4332] text-white font-sans">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1B4332] via-[#1B4332] to-[#0D241C]"></div>
            <div className="absolute inset-0 opacity-5"
                 style={{backgroundImage: 'linear-gradient(#52B788 0.5px, transparent 0.5px), linear-gradient(90deg, #52B788 0.5px, transparent 0.5px)', backgroundSize: '24px 24px'}}>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">

                {/* Header */}
                <div className="text-center mt-6">
                    <EditableText as="h2" className="text-4xl sm:text-5xl font-black mb-2 text-[#EAF4EE] leading-tight">حساباتك واضحة</EditableText>
                    <EditableText as="p" className="text-[#52B788] text-lg sm:text-xl font-bold">أرباح، مصاريف، وتقارير لحظية</EditableText>
                </div>

                {/* Central Visual - Financial Dashboard */}
                <div className="w-full max-w-sm flex flex-col gap-4 mt-4">

                    {/* Revenue & Expenses Row */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Revenue */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <EditableText className="text-xs text-gray-300 font-bold">الإيرادات</EditableText>
                                <div className="w-6 h-6 bg-[#40916C] rounded-md flex items-center justify-center">
                                    <TrendingUp size={14} />
                                </div>
                            </div>
                            <span className="text-2xl font-black text-white">4,820</span>
                            <EditableText className="text-[10px] text-[#52B788] font-bold">KD هذا الشهر</EditableText>
                        </div>

                        {/* Expenses */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <EditableText className="text-xs text-gray-300 font-bold">المصروفات</EditableText>
                                <div className="w-6 h-6 bg-red-500/80 rounded-md flex items-center justify-center">
                                    <TrendingDown size={14} />
                                </div>
                            </div>
                            <span className="text-2xl font-black text-white">1,350</span>
                            <EditableText className="text-[10px] text-red-300 font-bold">KD هذا الشهر</EditableText>
                        </div>
                    </div>

                    {/* Profit Card */}
                    <div className="bg-white text-[#1B4332] rounded-xl p-5 shadow-2xl flex items-center justify-between transform scale-105">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#EAF4EE] rounded-xl flex items-center justify-center">
                                <DollarSign size={24} className="text-[#1B4332]" />
                            </div>
                            <div className="flex flex-col">
                                <EditableText className="text-xs text-gray-500 font-bold">صافي الربح</EditableText>
                                <span className="text-3xl font-black text-[#1B4332]">3,470 <span className="text-sm">KD</span></span>
                            </div>
                        </div>
                        <div className="bg-[#EAF4EE] text-[#40916C] px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                            <TrendingUp size={12} />
                            <span>+18%</span>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <EditableText className="text-xs text-gray-300 font-bold">آخر المعاملات</EditableText>
                            <ArrowRight size={14} className="text-gray-400" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Receipt size={14} className="text-[#52B788]" />
                                    <EditableText className="font-bold text-gray-200">فاتورة #1042</EditableText>
                                </div>
                                <span className="text-[#52B788] font-bold">+85 KD</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Receipt size={14} className="text-red-300" />
                                    <EditableText className="font-bold text-gray-200">مشتريات مواد</EditableText>
                                </div>
                                <span className="text-red-300 font-bold">-220 KD</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="text-center opacity-80 mt-2">
                    <EditableText as="p" className="text-xs font-bold tracking-widest text-[#52B788]">SYLO ACCOUNTING</EditableText>
                </div>

            </div>
      </div>
  );
}
