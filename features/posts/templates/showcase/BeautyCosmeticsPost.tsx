import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sparkles, Heart, Star, ShoppingBag, Droplets } from 'lucide-react';

export default function BeautyCosmeticsPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      {/* Background with product image */}
      <img src="/seasons/3.jpg" className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${t.primaryLight} 30%, transparent 60%, ${t.primaryLight}cc 100%)` }} />

      {/* Sparkles */}
      <div className="absolute top-16 right-16 animate-pulse opacity-30">
        <Sparkles size={20} style={{ color: t.accentGold }} />
      </div>
      <div className="absolute top-1/3 left-12 animate-pulse opacity-20" style={{ animationDelay: '1s' }}>
        <Sparkles size={14} style={{ color: t.accent }} />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col p-8" style={{ color: t.primary }} dir="rtl">
        {/* Header */}
        <DraggableWrapper id="header-beauty" className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: t.accent + '15' }}>
              <Droplets size={16} style={{ color: t.accent }} />
            </div>
            <EditableText className="text-xs font-bold opacity-50">عناية فاخرة</EditableText>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: t.accentGold + '15', color: t.accentGold }}>
            <Sparkles size={10} /> جديد
          </div>
        </DraggableWrapper>

        {/* Headline */}
        <DraggableWrapper id="headline-beauty" className="mt-6 z-30">
          <EditableText as="h2" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-tight`} style={{ color: t.primary }}>
            اكتشفي جمالك
          </EditableText>
          <EditableText as="h2" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-tight`} style={{ color: t.accent }}>
            الطبيعي
          </EditableText>
          <EditableText as="p" className="text-sm font-bold mt-2 opacity-40">مستحضرات عناية طبيعية ١٠٠٪ لبشرة مشرقة</EditableText>
        </DraggableWrapper>

        <div className="flex-1" />

        {/* Product card */}
        <DraggableWrapper id="product-beauty" className="mt-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-100 flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${t.accent}15, ${t.accentGold}15)` }}>
              <span className="text-4xl">✨</span>
            </div>
            <div className="flex-1">
              <EditableText className="font-black text-base" style={{ color: t.primary }}>سيروم الهيالورونيك</EditableText>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5" style={{ color: t.accentGold }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={8} fill="currentColor" />)}
                </div>
                <EditableText className="text-[10px] opacity-40">(2,847)</EditableText>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-black" style={{ color: t.accent }}>24.900</span>
                <EditableText className="text-xs opacity-40 line-through">34.900</EditableText>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: t.accent + '15', color: t.accent }}>-30%</span>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: t.accent }}>
              <Heart size={16} className="text-white" fill="white" />
            </button>
          </div>
        </DraggableWrapper>

        {/* CTA */}
        <DraggableWrapper id="cta-beauty" className="mt-3">
          <div className="rounded-xl py-3 flex items-center justify-center gap-2" style={{ backgroundColor: t.accent }}>
            <ShoppingBag size={14} className="text-white" />
            <EditableText className="font-black text-sm text-white">تسوقي الآن — شحن مجاني</EditableText>
          </div>
        </DraggableWrapper>
      </div>
    </div>
  );
}
