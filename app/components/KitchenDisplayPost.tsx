import React from 'react';
import EditableText from './EditableText';
import { ChefHat, Printer, Clock, CheckCircle } from 'lucide-react';

export default function KitchenDisplayPost() {
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto bg-[#EAF4EE] text-[#1B4332] font-sans">
            {/* Background Decor */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#40916C]/10 rounded-bl-full"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#52B788]/10 rounded-tr-full"></div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">
                
                {/* Header */}
                <div className="text-center mt-4">
                    <EditableText as="h2" className="text-4xl sm:text-5xl font-black mb-2 text-[#1B4332]">المطبخ الذكي</EditableText>
                    <EditableText as="p" className="text-[#40916C] text-lg sm:text-xl font-bold">نظّم طلباتك بدون ورق</EditableText>
                </div>

                {/* Central Visual - KDS Cards */}
                <div className="w-full flex flex-col gap-4 items-center">
                    
                    {/* Ticket 1 (Completed) */}
                    <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border-r-4 border-[#40916C] p-4 opacity-60 scale-95 transform translate-y-2">
                        <div className="flex justify-between items-center mb-2 text-gray-400">
                             <span className="font-bold">#1023</span>
                             <span className="text-xs">منذ 12 دقيقة</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 line-through">
                            <span className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs">1</span>
                            <span>برجر دجاج كلاسيك</span>
                        </div>
                    </div>

                    {/* Ticket 2 (Active/Focus) */}
                    <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border-r-8 border-[#1B4332] p-6 transform scale-105 z-20 relative">
                        {/* Status Badge */}
                        <div className="absolute -top-3 -right-3 bg-[#1B4332] text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                            جاري التحضير
                        </div>

                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                             <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-[#1B4332]">#1024</span>
                                <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs font-bold">محلي</span>
                             </div>
                             <div className="flex items-center gap-1 text-[#40916C] font-bold bg-[#EAF4EE] px-2 py-1 rounded">
                                <Clock size={14} />
                                <span className="text-sm">04:32</span>
                             </div>
                        </div>
                        
                        <div className="space-y-3">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 bg-[#1B4332] text-white rounded-lg flex items-center justify-center font-bold">2</span>
                                    <EditableText className="text-lg font-bold text-[#1B4332]">برجر لحم دبل</EditableText>
                                </div>
                                <CheckCircle size={20} className="text-gray-200" />
                             </div>
                             
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 bg-[#1B4332] text-white rounded-lg flex items-center justify-center font-bold">1</span>
                                    <EditableText className="text-lg font-bold text-[#1B4332]">بطاطس بالجبن</EditableText>
                                </div>
                                <CheckCircle size={20} className="text-[#40916C]" fill="#EAF4EE" />
                             </div>

                             <div className="p-2 bg-red-50 rounded text-red-600 text-xs font-bold border border-red-100">
                                 ملاحظة: بدون مخلل للبرجر
                             </div>
                        </div>
                    </div>

                     {/* Ticket 3 (Next) */}
                    <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border-r-4 border-[#52B788] p-4 opacity-80 scale-95 transform -translate-y-2">
                         <div className="flex justify-between items-center mb-2">
                             <span className="font-bold text-[#1B4332]">#1025</span>
                             <span className="text-xs text-gray-500">جديد</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-[#EAF4EE] text-[#1B4332] rounded flex items-center justify-center text-xs font-bold">3</span>
                            <span className="text-sm font-bold text-[#1B4332]">بيبسي وسط</span>
                        </div>
                    </div>

                </div>

                {/* Footer Icon Group */}
                <div className="flex gap-8 opacity-60 mt-4">
                    <div className="flex flex-col items-center gap-1">
                        <Printer size={24} />
                        <EditableText className="text-xs font-bold">بدون طابعة</EditableText>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <ChefHat size={24} />
                        <EditableText className="text-xs font-bold">للطهاة</EditableText>
                    </div>
                </div>

            </div>
      </div>
  );
}
