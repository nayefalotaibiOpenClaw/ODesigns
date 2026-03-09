import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { PostHeader, PostFooter, TestimonialBubble, ProductLabel } from './shared';
import { Gift, Heart } from 'lucide-react';

export default function SeasonsOrchidGiftPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>

      {/* Split diagonal */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(135deg, ${t.primaryLight} 50%, ${t.primary} 50%)`
      }} />

      {/* Soft corner glow */}
      <div className="absolute top-0 right-0 w-[250px] h-[250px] opacity-[0.06]"
           style={{ background: `radial-gradient(circle at top right, ${t.accent}, transparent)` }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="orchid-gift" subtitle="GIFT IDEA" badge={<><Gift size={12}/> PERFECT GIFT</>} variant="light" />

        <DraggableWrapper id="headline-gift" className="text-right mt-4 z-30" dir="rtl">
          <h2 className="text-4xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>هدية تُقال</EditableText><br/>
            <span style={{ color: t.accent }}><EditableText>من غير كلام</EditableText></span>
          </h2>
        </DraggableWrapper>

        {/* Center product */}
        <div className="flex-1 flex items-center justify-center relative mt-2">
          <div className="absolute inset-x-12 bottom-0 top-8 rounded-3xl border-2 border-dashed opacity-15"
               style={{ borderColor: t.accent }} />

          <DraggableWrapper id="product-gift-orchid" className={`relative z-20 ${isTall ? 'w-[380px]' : 'w-[300px]'}`}>
            <img src="/seasons/orchid-2.png" className="w-full h-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.25)]" alt="Gift Orchid" />
          </DraggableWrapper>

          <ProductLabel
            id="label-gift-type"
            title="أوركيد ملكي"
            subtitle="حوض حجري فاخر"
            badge="PREMIUM"
            className="absolute -left-2 top-8"
            rotate={-6}
            variant="elegant"
          />

          <TestimonialBubble
            id="testimonial-gift"
            text="أجمل هدية وصلتني! التغليف فخم والأوركيد رائع"
            author="نورة ⭐️"
            rating={5}
            className="absolute -right-2 bottom-16"
            rotate={4}
            variant="bubble"
          />
        </div>

        {/* Occasion tags */}
        <DraggableWrapper id="tags-gift" className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          {['عيد ميلاد', 'تهنئة', 'شكر', 'حب'].map((tag, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-[10px] font-black"
                  style={{ backgroundColor: i % 2 === 0 ? t.accent + '15' : (t.accentGold || t.accent) + '15', color: i % 2 === 0 ? t.accent : t.primary }}>
              <EditableText>{tag}</EditableText>
            </span>
          ))}
        </DraggableWrapper>

        <PostFooter id="orchid-gift" label="SEASONS GIFTS" text="أهدِ لحظة جميلة" icon={<Heart size={24} fill="currentColor"/>} variant="dark" />
      </div>
    </div>
  );
}
