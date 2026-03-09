import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { PostHeader, PostFooter, PriceBadge, RatingStars, FeatureStrip } from './shared';
import { Crown, Truck, ShieldCheck, Gift } from 'lucide-react';

export default function SeasonsOrchidHeroPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: '#0a0a0a', fontFamily: t.font }}>

      {/* Dramatic radial spotlight */}
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 55%, ${t.accent}18 0%, transparent 55%)` }} />

      {/* Concentric gold rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-[0.07]"
           style={{ width: '500px', height: '500px', borderColor: t.accentGold, borderWidth: '2px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-[0.04]"
           style={{ width: '400px', height: '400px', borderColor: t.accentGold, borderWidth: '1px' }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="orchid-hero" subtitle="ORCHID COLLECTION" badge={<><Crown size={12}/> EXCLUSIVE</>} variant="dark" />

        {/* Product showcase */}
        <div className="flex-1 flex items-center justify-center relative">
          <DraggableWrapper id="product-orchid-hero" className={`relative z-20 ${isTall ? 'w-[420px]' : 'w-[320px]'}`}>
            <img src="/seasons/orchid-1.png" className="w-full h-auto drop-shadow-[0_30px_60px_rgba(190,18,60,0.3)]" alt="Premium Orchid" />
          </DraggableWrapper>

          <PriceBadge
            id="price-orchid-hero"
            price="25"
            currency="KD"
            className="absolute -right-2 top-16"
            rotate={8}
            variant="circle"
          />

          <RatingStars
            id="rating-orchid-hero"
            rating={4.9}
            reviews="١٢٠+ تقييم"
            className="absolute -left-2 top-20"
            rotate={-5}
          />
        </div>

        {/* Feature strip */}
        <FeatureStrip
          id="features-orchid-hero"
          variant="chips"
          features={[
            { icon: <Truck size={12} />, text: 'توصيل مجاني' },
            { icon: <ShieldCheck size={12} />, text: 'ضمان ٣٠ يوم' },
            { icon: <Gift size={12} />, text: 'تغليف فاخر' },
          ]}
          className="mt-2"
        />

        {/* Headline */}
        <DraggableWrapper id="text-orchid-hero" className="text-center mt-4" dir="rtl">
          <p className="text-xs font-black uppercase tracking-[0.3em] mb-2" style={{ color: t.accent }}>
            <EditableText>مجموعة حصرية ٢٠٢٤</EditableText>
          </p>
          <h2 className="text-5xl font-black leading-[1.1] text-white">
            <EditableText>أوركيد الفخامة</EditableText>
          </h2>
        </DraggableWrapper>

        <PostFooter id="orchid-hero" label="SEASONS ORCHID" text="اطلب الآن عبر التطبيق" variant="dark" />
      </div>
    </div>
  );
}
