import React from 'react';
import EditableText from './EditableText';
import { MapPin, Store, ArrowLeftRight, Eye } from 'lucide-react';

export default function MultiBranchPost() {
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto bg-[#F9FAFB] text-[#1B4332] font-sans">

            {/* Background Map Dots */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                 style={{backgroundImage: 'radial-gradient(#1B4332 1px, transparent 1px)', backgroundSize: '16px 16px'}}>
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#52B788]/10 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#40916C]/10 rounded-tr-full"></div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">

                {/* Header */}
                <div className="text-center mt-4">
                    <h2 className="text-4xl sm:text-5xl font-black mb-2 text-[#1B4332] leading-tight">كل فروعك<br/><EditableText className="text-[#40916C]">بنظرة وحدة</EditableText></h2>
                    <EditableText as="p" className="text-gray-500 text-lg font-bold">تحكّم من مكان واحد</EditableText>
                </div>

                {/* Central Visual - Branch Cards */}
                <div className="w-full max-w-sm relative mt-2">

                    {/* Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-20">
                        <line x1="50%" y1="10%" x2="25%" y2="45%" stroke="#1B4332" strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="50%" y1="10%" x2="75%" y2="45%" stroke="#1B4332" strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="50%" y1="10%" x2="50%" y2="70%" stroke="#1B4332" strokeWidth="2" strokeDasharray="4 4" />
                    </svg>

                    {/* Main HQ Badge */}
                    <div className="flex justify-center mb-6 relative z-10">
                        <div className="bg-[#1B4332] text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 border-2 border-[#52B788]/30">
                            <Eye size={20} />
                            <EditableText className="font-black text-lg">لوحة التحكم</EditableText>
                        </div>
                    </div>

                    {/* Branch Cards Grid */}
                    <div className="grid grid-cols-2 gap-3 relative z-10">

                        {/* Branch 1 */}
                        <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col gap-2 border-t-4 border-[#1B4332]">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#EAF4EE] rounded-lg flex items-center justify-center">
                                    <Store size={16} className="text-[#1B4332]" />
                                </div>
                                <EditableText className="font-black text-sm text-[#1B4332]">الفرع الرئيسي</EditableText>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                                <MapPin size={10} />
                                <EditableText>السالمية</EditableText>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-lg font-black text-[#1B4332]">KD 920</span>
                                <span className="text-[10px] bg-[#EAF4EE] text-[#40916C] px-1.5 py-0.5 rounded font-bold">مفتوح</span>
                            </div>
                        </div>

                        {/* Branch 2 */}
                        <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col gap-2 border-t-4 border-[#40916C]">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#EAF4EE] rounded-lg flex items-center justify-center">
                                    <Store size={16} className="text-[#40916C]" />
                                </div>
                                <EditableText className="font-black text-sm text-[#1B4332]">فرع الأفنيوز</EditableText>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                                <MapPin size={10} />
                                <EditableText>الري</EditableText>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-lg font-black text-[#1B4332]">KD 1,150</span>
                                <span className="text-[10px] bg-[#EAF4EE] text-[#40916C] px-1.5 py-0.5 rounded font-bold">مفتوح</span>
                            </div>
                        </div>

                        {/* Branch 3 - Spans full width */}
                        <div className="col-span-2 bg-white rounded-xl shadow-lg p-4 flex items-center justify-between border-t-4 border-[#52B788]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#EAF4EE] rounded-lg flex items-center justify-center">
                                    <Store size={16} className="text-[#52B788]" />
                                </div>
                                <div className="flex flex-col">
                                    <EditableText className="font-black text-sm text-[#1B4332]">فرع الجهراء</EditableText>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                                        <MapPin size={10} />
                                        <EditableText>الجهراء</EditableText>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-black text-[#1B4332]">KD 680</span>
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold">مغلق</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 bg-[#EAF4EE] px-4 py-2 rounded-full text-[#1B4332] text-sm font-bold mt-4 shadow-sm">
                    <ArrowLeftRight size={16} />
                    <EditableText>تنقّل بين الفروع بضغطة</EditableText>
                </div>

            </div>
      </div>
  );
}
