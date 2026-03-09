import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { PostHeader, PostFooter, PriceBadge } from './shared';
import { Heart, Sparkles } from 'lucide-react';

export default function SeasonsOrchidComparePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>

      {/* Visual split background */}
      <div className="absolute inset-0 grid grid-cols-2">
         <div className="bg-rose-950/50 border-r border-white/10" />
         <div className="bg-rose-900/30" />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="seasons-compare" subtitle="ORCHID VARIETIES" badge={<><Sparkles size={12}/> CHOICE</>} variant="dark" />

        <div className="flex-1 flex items-stretch mt-8 gap-4">
           <div className="flex-1 flex flex-col items-center justify-center relative">
              <DraggableWrapper id="compare-1" className="w-full transition-transform hover:scale-110">
                 <img src="/seasons/orchid-1.png" className="w-full h-auto drop-shadow-2xl" alt="Orchid 1" />
              </DraggableWrapper>
              <div className="mt-4 text-center">
                 <p className="text-xs font-black uppercase tracking-widest opacity-60">Classic</p>
                 <p className="text-lg font-black"><EditableText>الفخامة الكلاسيكية</EditableText></p>
              </div>
              <PriceBadge
                id="price-compare-1"
                price="25"
                currency="KD"
                variant="tag"
                label="كلاسيك"
                className="mt-2"
              />
           </div>

           <div className="flex-1 flex flex-col items-center justify-center relative">
              <DraggableWrapper id="compare-2" className="w-full transition-transform hover:scale-110">
                 <img src="/seasons/orchid-2.png" className="w-full h-auto drop-shadow-2xl" alt="Orchid 2" />
              </DraggableWrapper>
              <div className="mt-4 text-center">
                 <p className="text-xs font-black uppercase tracking-widest opacity-60">Modern</p>
                 <p className="text-lg font-black"><EditableText>الرقي العصري</EditableText></p>
              </div>
              <PriceBadge
                id="price-compare-2"
                price="45"
                currency="KD"
                variant="tag"
                label="بريميوم"
                className="mt-2"
              />
           </div>
        </div>

        <DraggableWrapper id="headline-compare" className="mt-6 text-center" dir="rtl">
          <h2 className="text-4xl font-black leading-tight">
            <EditableText>أيُّهما تُفضل؟</EditableText>
          </h2>
          <p className="text-lg font-bold opacity-70">
            <EditableText>مجموعتنا المختارة من الأوركيد لعام 2024</EditableText>
          </p>
        </DraggableWrapper>

        <PostFooter id="seasons-compare" label="SEASONS COLLECTION" text="خيارك الأمثل لكل مناسبة" icon={<Heart size={24}/>} variant="dark" />
      </div>
    </div>
  );
}
