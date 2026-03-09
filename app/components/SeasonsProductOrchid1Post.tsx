import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { PostHeader, PostFooter, PriceBadge, ProductLabel } from './shared';
import { Sparkles } from 'lucide-react';

export default function SeasonsProductOrchid1Post() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>

      {/* Dot pattern bg */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{backgroundImage: `radial-gradient(${t.accentLime} 1px, transparent 1px)`, backgroundSize: '40px 40px'}} />

      {/* Glow behind product */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-[0.15] blur-[100px] rounded-full"
           style={{ backgroundColor: t.accentLime }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-orchid-1" subtitle="PRODUCT SPOTLIGHT" badge={<><Sparkles size={12}/> BEST SELLER</>} variant="dark" />

        <div className="flex-1 flex items-center justify-center relative">
          <DraggableWrapper id="product-orchid-1" className={`relative z-20 ${isTall ? 'w-[450px]' : 'w-[350px]'} transition-transform hover:scale-105`}>
             <img src="/seasons/orchid-1.png" className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" alt="Premium Orchid" />
          </DraggableWrapper>

          <PriceBadge
            id="price-orchid-1"
            price="25"
            currency="KD"
            className="absolute -right-4 top-20"
            rotate={8}
            variant="circle"
          />

          <ProductLabel
            id="label-orchid-1"
            title="كلاسيك أوركيد"
            subtitle="فازة بيضاء مزخرفة"
            badge="NEW"
            className="absolute -left-2 bottom-24"
            rotate={-5}
            variant="banner"
          />
        </div>

        <DraggableWrapper id="text-orchid-1" className="text-center mt-4" dir="rtl">
          <h2 className="text-5xl font-black leading-tight text-white mb-2">
            <EditableText>أوركيد سيزونز</EditableText>
          </h2>
          <p className="text-xl font-bold" style={{ color: t.accentLime }}>
            <EditableText>فخامة تدوم طويلاً في منزلك</EditableText>
          </p>
        </DraggableWrapper>

        <PostFooter id="seasons-orchid-1" label="SEASONS PREMIUM" text="اطلبها الآن وتصلك بتنسيق فاخر" variant="dark" />
      </div>
    </div>
  );
}
