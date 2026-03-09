import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Home, MapPin, Bed, Star, Building2 } from 'lucide-react';

export default function RealEstatePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, white, ${t.primaryLight})` }} />
      <div className="absolute top-0 left-0 w-full h-[50%] opacity-[0.03]"
        style={{ backgroundImage: `radial-gradient(${t.primary} 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8" style={{ color: t.primary }}>
        <PostHeader id="showcase-realestate" subtitle="PROPERTY" badge={<><Home size={12} /> PREMIUM</>} variant="light" />

        <DraggableWrapper id="headline-realestate" className="mt-6 z-30">
          <EditableText as="h2" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-tight`} style={{ color: t.primary }}>
            Find your
          </EditableText>
          <EditableText as="h2" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-tight`} style={{ color: t.accent }}>
            dream home
          </EditableText>
        </DraggableWrapper>

        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-realestate" variant="mockup" className={`relative z-20 ${isTall ? 'w-[280px] h-[540px]' : 'w-[200px] h-[340px]'}`}>
            <IPhoneMockup src="/1.jpg" />
          </DraggableWrapper>

          <FloatingCard id="stat-re-price" icon={<Building2 size={16} style={{ color: t.accent }} />} label="Starting" value="$890K"
            className={`absolute ${isTall ? '-right-4 top-[18%]' : '-right-6 top-[8%]'} z-30`} rotate={-3} borderColor={t.accent} animation="float" />
          <FloatingCard id="stat-re-rating" icon={<Star size={16} style={{ color: t.accentGold }} />} label="Rated" value="4.9/5"
            className={`absolute ${isTall ? '-left-4 top-[40%]' : '-left-6 top-[35%]'} z-30`} rotate={4} borderColor={t.accentGold} animation="float-slow" />
          <FloatingCard id="stat-re-beds" icon={<Bed size={16} style={{ color: t.accent }} />} label="Up to" value="6 Beds"
            className={`absolute ${isTall ? '-right-2 bottom-[22%]' : '-right-4 bottom-[18%]'} z-30`} rotate={-2} animation="float" />
        </div>

        <PostFooter id="showcase-realestate" label="PROPVISTA" text="Find your perfect property" icon={<MapPin size={24} />} variant="light" />
      </div>
    </div>
  );
}
