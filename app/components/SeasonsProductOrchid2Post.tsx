import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { PostHeader, PostFooter, RatingStars, ProductLabel } from './shared';
import { Star } from 'lucide-react';

export default function SeasonsProductOrchid2Post() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: '#fff', fontFamily: t.font }}>

      {/* Soft background gradient */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #FFF1F2 0%, white 100%)` }} />

      {/* Decorative circle */}
      <div className="absolute -top-20 -left-20 w-[300px] h-[300px] opacity-[0.1] rounded-full"
           style={{ backgroundColor: t.accent }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-orchid-2" subtitle="ELEGANT COLLECTION" badge={<><Star size={12}/> LIMITED</>} variant="light" />

        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="product-orchid-2" className={`relative z-20 ${isTall ? 'w-[450px]' : 'w-[350px]'}`}>
             <img src="/seasons/orchid-2.png" className="w-full h-auto drop-shadow-2xl" alt="Elegant Orchid" />
          </DraggableWrapper>

          <RatingStars
            id="rating-orchid-2"
            rating={4.9}
            reviews="١٥٠+"
            className="absolute -left-2 bottom-28"
            rotate={-4}
            variant="card"
          />

          <ProductLabel
            id="label-orchid-2"
            title="نخب أول"
            subtitle="أجود الأنواع"
            badge="QUALITY"
            className="absolute -right-2 top-16"
            rotate={5}
            variant="bold"
          />
        </div>

        <DraggableWrapper id="text-orchid-2" className="text-right" dir="rtl">
          <h2 className="text-4xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>جمال الطبيعة</EditableText><br/>
            <span style={{ color: t.accent }}><EditableText>في فازة واحدة</EditableText></span>
          </h2>
          <p className="text-lg font-bold opacity-60 mt-2" style={{ color: t.primary }}>
            <EditableText>أوركيد أبيض نقي يضفي بهجة على مكانك</EditableText>
          </p>
        </DraggableWrapper>

        <PostFooter id="seasons-orchid-2" label="SEASONS ELEGANCE" text="الجمال البسيط هو الأجمل دائماً" variant="light" />
      </div>
    </div>
  );
}
