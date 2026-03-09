import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ShoppingBag, Clock, Star, MapPin, Flame } from 'lucide-react';

export default function FoodDeliveryPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      {/* Full background image */}
      <img src="/4.jpg" className="absolute inset-0 w-full h-full object-cover" alt="" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)' }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white" dir="rtl">
        {/* Header */}
        <DraggableWrapper id="header-food" className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: t.accentOrange }}>
              <Flame size={16} style={{ color: '#fff' }} />
            </div>
            <EditableText className="text-xs font-bold opacity-70">توصيل سريع</EditableText>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 backdrop-blur-sm" style={{ color: t.accentLime }}>
            <Clock size={10} /> <EditableText>25 دقيقة</EditableText>
          </div>
        </DraggableWrapper>

        {/* Spacer pushes content down */}
        <div className="flex-1" />

        {/* Content at bottom over image */}
        <DraggableWrapper id="headline-food" className="z-30">
          <EditableText as="h2" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-tight`} style={{ color: '#fff' }}>
            اطلب وجبتك
          </EditableText>
          <EditableText as="h2" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-tight`} style={{ color: t.accentOrange }}>
            المفضّلة الآن
          </EditableText>
          <EditableText as="p" className="text-base font-bold mt-3 opacity-60">أشهى الأطباق توصلك لباب بيتك</EditableText>
        </DraggableWrapper>

        {/* Stats row */}
        <DraggableWrapper id="stats-food" className="mt-6 flex gap-3">
          {[
            { icon: <Star size={14} style={{ color: t.accentGold }} />, value: '4.9', label: 'تقييم' },
            { icon: <Clock size={14} style={{ color: t.accentLime }} />, value: '25 د', label: 'توصيل' },
            { icon: <MapPin size={14} style={{ color: t.accentOrange }} />, value: '0%', label: 'عمولة' },
          ].map((stat, i) => (
            <div key={i} className="flex-1 rounded-xl p-3 border border-white/10 backdrop-blur-sm text-center" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-center gap-1 mb-1">{stat.icon}<span className="text-lg font-black">{stat.value}</span></div>
              <EditableText className="text-[10px] font-bold opacity-40">{stat.label}</EditableText>
            </div>
          ))}
        </DraggableWrapper>

        {/* CTA */}
        <DraggableWrapper id="cta-food" className="mt-4">
          <div className="rounded-xl py-3 flex items-center justify-center gap-2" style={{ backgroundColor: t.accentOrange }}>
            <ShoppingBag size={16} className="text-white" />
            <EditableText className="font-black text-sm text-white">اطلب الآن — توصيل مجاني</EditableText>
          </div>
        </DraggableWrapper>
      </div>
    </div>
  );
}
