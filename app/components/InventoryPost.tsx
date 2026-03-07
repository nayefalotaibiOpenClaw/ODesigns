import React from 'react';
import EditableText from './EditableText';
import { Package, AlertTriangle, ArrowDownUp, CheckCircle } from 'lucide-react';

export default function InventoryPost() {
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto bg-[#EAF4EE] text-[#1B4332] font-sans">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#52B788]/10 rounded-br-full"></div>
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-[#40916C]/10 rounded-tl-full"></div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">

                {/* Header */}
                <div className="text-center mt-4">
                    <EditableText as="h2" className="text-4xl sm:text-5xl font-black mb-2 text-[#1B4332]">مخزونك تحت السيطرة</EditableText>
                    <EditableText as="p" className="text-[#40916C] text-lg sm:text-xl font-bold">تتبّع كل صنف بلحظته</EditableText>
                </div>

                {/* Central Visual - Inventory Cards */}
                <div className="w-full max-w-sm flex flex-col gap-3 relative mt-4">

                    {/* Item 1 - Low Stock Warning */}
                    <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between border-r-4 border-orange-400">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle size={20} className="text-orange-500" />
                            </div>
                            <div className="flex flex-col">
                                <EditableText className="font-black text-[#1B4332]">دجاج طازج</EditableText>
                                <EditableText className="text-xs text-orange-500 font-bold">مخزون منخفض</EditableText>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-black text-orange-500">3</span>
                            <EditableText className="text-[10px] text-gray-400 font-bold">كرتون</EditableText>
                        </div>
                    </div>

                    {/* Item 2 - Good Stock */}
                    <div className="bg-white rounded-xl shadow-2xl p-5 flex items-center justify-between border-r-8 border-[#40916C] transform scale-105 z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#EAF4EE] rounded-lg flex items-center justify-center">
                                <Package size={20} className="text-[#1B4332]" />
                            </div>
                            <div className="flex flex-col">
                                <EditableText className="font-black text-[#1B4332]">خبز برجر</EditableText>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <CheckCircle size={10} className="text-[#40916C]" />
                                    <EditableText className="text-xs text-[#40916C] font-bold">متوفر</EditableText>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-black text-[#1B4332]">48</span>
                            <EditableText className="text-[10px] text-gray-400 font-bold">كرتون</EditableText>
                        </div>
                    </div>

                    {/* Item 3 - Out of Stock */}
                    <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between border-r-4 border-red-400 opacity-70">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                                <Package size={20} className="text-red-400" />
                            </div>
                            <div className="flex flex-col">
                                <EditableText className="font-black text-[#1B4332] line-through">صوص سبايسي</EditableText>
                                <EditableText className="text-xs text-red-500 font-bold">نفذ - طلب تلقائي</EditableText>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-black text-red-400">0</span>
                            <EditableText className="text-[10px] text-gray-400 font-bold">علبة</EditableText>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="flex gap-6 mt-4 opacity-70">
                    <div className="flex flex-col items-center gap-1">
                        <ArrowDownUp size={20} className="text-[#1B4332]" />
                        <EditableText className="text-[10px] font-bold">جرد تلقائي</EditableText>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <AlertTriangle size={20} className="text-[#1B4332]" />
                        <EditableText className="text-[10px] font-bold">تنبيهات ذكية</EditableText>
                    </div>
                </div>

            </div>
      </div>
  );
}
