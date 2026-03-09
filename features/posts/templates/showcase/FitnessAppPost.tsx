import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Flame, Timer, Trophy, TrendingUp, Dumbbell, Heart } from 'lucide-react';

export default function FitnessAppPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${t.primaryDark}, ${t.primary})` }} />
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: `radial-gradient(${t.accentLime} 1px, transparent 1px)`, backgroundSize: '25px 25px' }} />
      <div className="absolute top-0 left-0 w-[350px] h-[350px] opacity-[0.08] blur-[100px] rounded-full" style={{ backgroundColor: t.accentLime }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white" dir="rtl">
        {/* Header */}
        <DraggableWrapper id="header-fitness" className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: t.accentLime }}>
              <Dumbbell size={16} style={{ color: t.primaryDark }} />
            </div>
            <EditableText className="text-xs font-bold opacity-60">تطبيق اللياقة</EditableText>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: t.accentLime }}>
            <Heart size={10} /> مباشر
          </div>
        </DraggableWrapper>

        {/* Headline */}
        <DraggableWrapper id="headline-fitness" className="mt-6 z-30">
          <EditableText as="h2" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-tight`} style={{ color: t.primaryLight }}>
            تمرينك اليوم
          </EditableText>
          <EditableText as="h2" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-tight`} style={{ color: t.accentLime }}>
            أقوى من أمس
          </EditableText>
        </DraggableWrapper>

        {/* CSS-only progress ring + floating cards */}
        <DraggableWrapper id="visual-fitness" className="mt-6 flex-1 flex items-center justify-center">
          <div className="relative">
            <div className={`${isTall ? 'w-52 h-52' : 'w-40 h-40'} rounded-full border-[8px] border-white/10 flex items-center justify-center relative`}>
              <div className="absolute inset-0 rounded-full" style={{
                borderWidth: '8px', borderStyle: 'solid',
                borderColor: `${t.accentLime} ${t.accentLime} ${t.accentLime} transparent`,
                borderRadius: '50%', transform: 'rotate(-45deg)',
              }} />
              <div className="text-center">
                <span className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black`} style={{ color: t.accentLime }}>78%</span>
                <EditableText className="text-[10px] font-bold opacity-50 block">الهدف اليومي</EditableText>
              </div>
            </div>

            <div className="absolute -top-4 -right-16 rounded-xl p-3 border border-white/10 backdrop-blur-sm transform rotate-3" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <Flame size={14} style={{ color: t.accentOrange }} />
              <span className="text-lg font-black block mt-1">542</span>
              <EditableText className="text-[8px] font-bold opacity-40">سعرة</EditableText>
            </div>

            <div className="absolute -bottom-4 -left-16 rounded-xl p-3 border border-white/10 backdrop-blur-sm transform -rotate-3" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <Timer size={14} style={{ color: t.accentLime }} />
              <span className="text-lg font-black block mt-1">47</span>
              <EditableText className="text-[8px] font-bold opacity-40">دقيقة</EditableText>
            </div>
          </div>
        </DraggableWrapper>

        {/* Weekly bar chart */}
        <DraggableWrapper id="weekly-fitness" className="mt-auto">
          <div className="rounded-xl p-4 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-between mb-3">
              <EditableText className="text-xs font-bold opacity-50">تقدم الأسبوع</EditableText>
              <div className="flex items-center gap-1" style={{ color: t.accentLime }}>
                <TrendingUp size={12} /><span className="text-xs font-bold">+15%</span>
              </div>
            </div>
            <div className="flex gap-1.5 items-end h-10">
              {[60, 80, 45, 90, 70, 100, 50].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-sm" style={{ height: `${h}%`, backgroundColor: i === 5 ? t.accentLime : 'rgba(255,255,255,0.15)' }} />
                  <span className="text-[7px] font-bold opacity-30">{['سب', 'أح', 'إث', 'ثل', 'أر', 'خم', 'جم'][i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            {[
              { icon: <Flame size={14} />, label: '542 سعرة' },
              { icon: <Trophy size={14} />, label: '3 إنجازات' },
              { icon: <Timer size={14} />, label: '47 دقيقة' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 opacity-40">
                {item.icon}
                <EditableText className="text-[10px] font-bold">{item.label}</EditableText>
              </div>
            ))}
          </div>
        </DraggableWrapper>
      </div>
    </div>
  );
}
