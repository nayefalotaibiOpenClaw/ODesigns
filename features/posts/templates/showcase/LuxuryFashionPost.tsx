import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Crown, ArrowRight, Sparkles, Diamond } from 'lucide-react';

export default function LuxuryFashionPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: '#0a0a0a', fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(170deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)' }} />
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'radial-gradient(#fff 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] opacity-[0.04] blur-[100px] rounded-full" style={{ backgroundColor: t.accentGold }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        {/* Header */}
        <DraggableWrapper id="header-luxury" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center" style={{ borderColor: t.accentGold + '40' }}>
              <Diamond size={14} style={{ color: t.accentGold }} />
            </div>
            <EditableText className="text-xs font-bold uppercase tracking-[0.3em] opacity-40">Maison Élégance</EditableText>
          </div>
          <div className="px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ borderColor: t.accentGold + '30', color: t.accentGold }}>
            <Crown size={10} className="inline mr-1" /> SS 2026
          </div>
        </DraggableWrapper>

        {/* Central Typography */}
        <DraggableWrapper id="headline-luxury" className="flex-1 flex flex-col items-center justify-center text-center">
          <EditableText className="text-[10px] font-bold uppercase tracking-[0.5em] mb-6" style={{ color: t.accentGold }}>New Collection</EditableText>
          <EditableText as="h2" className={`${isTall ? 'text-8xl' : 'text-7xl'} font-black leading-[0.85] tracking-tight`} style={{ color: '#fff' }}>
            DEFINE
          </EditableText>
          <EditableText as="h2" className={`${isTall ? 'text-8xl' : 'text-7xl'} font-black leading-[0.85] tracking-tight italic`} style={{ color: t.accentGold }}>
            YOUR
          </EditableText>
          <EditableText as="h2" className={`${isTall ? 'text-8xl' : 'text-7xl'} font-black leading-[0.85] tracking-tight`} style={{ color: '#fff' }}>
            STYLE
          </EditableText>
          <div className="w-16 h-[1px] mt-8 mb-4" style={{ backgroundColor: t.accentGold + '40' }} />
          <EditableText as="p" className="text-sm font-medium opacity-30 max-w-xs leading-relaxed">
            Curated luxury pieces that transcend seasons. Handcrafted with precision.
          </EditableText>
        </DraggableWrapper>

        {/* Bottom product cards */}
        <DraggableWrapper id="cards-luxury" className="flex gap-3">
          {[
            { label: 'Silk Blazer', price: '$2,400', tag: 'Bestseller' },
            { label: 'Leather Bag', price: '$1,800', tag: 'New' },
            { label: 'Cashmere', price: '$950', tag: 'Limited' },
          ].map((item, i) => (
            <div key={i} className="flex-1 rounded-xl p-3 border" style={{ borderColor: t.accentGold + '15', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center" style={{ backgroundColor: t.accentGold + '08' }}>
                <Sparkles size={20} style={{ color: t.accentGold + '40' }} />
              </div>
              <EditableText className="text-[10px] font-bold opacity-50">{item.label}</EditableText>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-black" style={{ color: t.accentGold }}>{item.price}</span>
                <span className="text-[8px] font-bold uppercase opacity-30">{item.tag}</span>
              </div>
            </div>
          ))}
        </DraggableWrapper>

        {/* CTA */}
        <DraggableWrapper id="cta-luxury" className="mt-4">
          <div className="rounded-xl py-3 flex items-center justify-center gap-2" style={{ backgroundColor: t.accentGold }}>
            <EditableText className="font-black text-sm" style={{ color: '#0a0a0a' }}>Shop Collection</EditableText>
            <ArrowRight size={14} style={{ color: '#0a0a0a' }} />
          </div>
        </DraggableWrapper>
      </div>
    </div>
  );
}
