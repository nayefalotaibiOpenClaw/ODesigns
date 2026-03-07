import React from 'react';
import EditableText from './EditableText';
import { WifiOff, CheckCircle, Zap } from 'lucide-react';

export default function OfflineModePost() {
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto">
        <div 
            className="absolute inset-0 bg-[#EAF4EE] flex flex-col items-center justify-between p-8 font-sans text-[#1B4332]"
            style={{ fontFamily: "'Cairo', sans-serif" }}
        >
            {/* Top Badge */}
            <div className="w-full flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className="bg-[#1B4332] text-white w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs">S</div>
                    <span className="font-bold text-lg tracking-wide">Sylo</span>
                 </div>
                 <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-red-200">
                    <WifiOff size={14} />
                    <EditableText className="pt-0.5">بدون إنترنت</EditableText>
                 </div>
            </div>

            {/* Central Visual */}
            <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                {/* Pulse Effect */}
                <div className="absolute w-64 h-64 bg-[#40916C]/10 rounded-full blur-3xl animate-pulse"></div>
                
                <div className="relative z-10 flex flex-col items-center gap-6 w-full text-center">
                    <h1 className="text-6xl font-black leading-tight text-[#1B4332]">
                        انقطع النت؟ <br/>
                        <EditableText className="text-[#40916C]">ولا يهمك.</EditableText>
                    </h1>
                    
                    <div className="bg-white shadow-xl border border-[#1B4332]/10 p-6 rounded-2xl w-full max-w-sm">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                             <span className="text-gray-500 text-sm font-bold">حالة الاتصال</span>
                             <span className="text-red-500 text-sm font-bold bg-red-50 px-2 py-0.5 rounded">مفصول</span>
                        </div>
                        <div className="space-y-3" dir="rtl">
                             <div className="flex items-center gap-3 text-[#1B4332]">
                                <CheckCircle size={20} className="text-[#40916C]" fill="#EAF4EE" />
                                <EditableText className="font-bold">تسجيل المبيعات</EditableText>
                             </div>
                             <div className="flex items-center gap-3 text-[#1B4332]">
                                <CheckCircle size={20} className="text-[#40916C]" fill="#EAF4EE" />
                                <EditableText className="font-bold">حفظ الطلبات (طابور)</EditableText>
                             </div>
                             <div className="flex items-center gap-3 text-[#1B4332]">
                                <CheckCircle size={20} className="text-[#40916C]" fill="#EAF4EE" />
                                <EditableText className="font-bold">طباعة الفواتير</EditableText>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full text-center mt-4">
                <EditableText as="p" className="text-[#1B4332]/70 text-lg font-bold mb-2">بيعك مستمر حتى لو النت فصل</EditableText>
                <div className="flex justify-center items-center gap-2 text-[#1B4332] text-sm font-bold bg-white/50 py-1 px-4 rounded-full mx-auto w-fit">
                    <Zap size={16} fill="#F4A261" className="text-[#F4A261]" />
                    <EditableText>نظام كاشير يعمل دائماً</EditableText>
                </div>
            </div>
        </div>
      </div>
  );
}
