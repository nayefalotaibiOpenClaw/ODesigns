import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Plane, MapPin, Calendar, Star, ArrowRight, Globe } from 'lucide-react';

export default function TravelBookingPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${t.primaryLight}, white 40%, ${t.primaryLight}80)` }} />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px]" style={{ backgroundColor: t.accent }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8" style={{ color: t.primary }}>
        {/* Header */}
        <DraggableWrapper id="header-travel" className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: t.primary }}>
              <Globe size={16} style={{ color: t.primaryLight }} />
            </div>
            <EditableText className="text-xs font-bold opacity-50 uppercase tracking-widest">Wanderlust</EditableText>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: t.accent + '15', color: t.accent }}>
            <Plane size={10} /> Explore
          </div>
        </DraggableWrapper>

        {/* Headline */}
        <DraggableWrapper id="headline-travel" className="mt-6">
          <EditableText as="h2" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-tight`} style={{ color: t.primary }}>
            Your next
          </EditableText>
          <EditableText as="h2" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-tight`} style={{ color: t.accent }}>
            adventure awaits
          </EditableText>
          <EditableText as="p" className="text-sm font-bold mt-2 opacity-40">Discover handpicked destinations worldwide</EditableText>
        </DraggableWrapper>

        {/* Destination Cards */}
        <DraggableWrapper id="cards-travel" className="mt-auto space-y-3">
          {/* Featured */}
          <div className="rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-100">
            <div className={`${isTall ? 'h-40' : 'h-28'} relative`} style={{ background: `linear-gradient(135deg, ${t.accent}30, ${t.accentOrange}30)` }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`${isTall ? 'text-7xl' : 'text-5xl'}`}>🏔️</span>
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-[9px] font-bold bg-white/90 backdrop-blur-sm flex items-center gap-1" style={{ color: t.accentGold }}>
                <Star size={8} fill="currentColor" /> Top Rated
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <EditableText className="font-black text-base" style={{ color: t.primary }}>Swiss Alps Retreat</EditableText>
                <div className="flex items-center gap-1 mt-1 opacity-40">
                  <MapPin size={10} /><EditableText className="text-xs font-bold">Zermatt, Switzerland</EditableText>
                </div>
              </div>
              <div className="text-left">
                <span className="text-xl font-black" style={{ color: t.accent }}>$890</span>
                <EditableText className="text-[10px] opacity-40 block">per person</EditableText>
              </div>
            </div>
          </div>

          {/* Mini Cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '🏝️', name: 'Maldives', price: '$1,200', days: '7 days' },
              { emoji: '🗼', name: 'Tokyo', price: '$650', days: '5 days' },
            ].map((dest, i) => (
              <div key={i} className="bg-white rounded-xl p-3 shadow-lg border border-gray-100 flex items-center gap-3">
                <span className="text-2xl">{dest.emoji}</span>
                <div className="flex-1 min-w-0">
                  <EditableText className="text-xs font-black" style={{ color: t.primary }}>{dest.name}</EditableText>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Calendar size={8} style={{ color: t.accent }} />
                    <span className="text-[9px] font-bold" style={{ color: t.accent }}>{dest.days}</span>
                    <span className="text-[9px] opacity-30">•</span>
                    <span className="text-[9px] font-black" style={{ color: t.primary }}>{dest.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-xl py-3 flex items-center justify-center gap-2" style={{ backgroundColor: t.primary }}>
            <EditableText className="font-black text-sm" style={{ color: t.primaryLight }}>Book Your Trip</EditableText>
            <ArrowRight size={14} style={{ color: t.primaryLight }} />
          </div>
        </DraggableWrapper>
      </div>
    </div>
  );
}
