import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { PostHeader, PostFooter, TestimonialBubble, RatingStars } from './shared';
import { Quote, Sparkles } from 'lucide-react';

export default function SeasonsOrchidStoryPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>

      {/* Cinematic gradient */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(180deg, ${t.primaryDark} 0%, ${t.primary} 40%, ${t.primaryDark} 100%)`
      }} />

      {/* Soft glow center */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-[0.08] blur-[100px] rounded-full"
           style={{ backgroundColor: t.accentLime }} />

      {/* Thin line accents */}
      <div className="absolute top-[25%] left-0 right-0 h-[1px] opacity-[0.06]" style={{ backgroundColor: t.accentLime }} />
      <div className="absolute bottom-[25%] left-0 right-0 h-[1px] opacity-[0.06]" style={{ backgroundColor: t.accentLime }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="orchid-story" subtitle="OUR STORY" badge={<><Sparkles size={12}/> ARTISAN</>} variant="dark" />

        {/* Quote */}
        <DraggableWrapper id="quote-section" className="mt-6 text-center" dir="rtl">
          <Quote size={28} className="mx-auto mb-2 opacity-25" style={{ color: t.accentLime }} />
          <p className="text-xl font-black leading-relaxed opacity-90">
            <EditableText>كل أوركيد في سيزونز يُختار يدوياً من أجود المزارع العالمية، ويُنسّق بعناية ليصلك وكأنه تحفة فنية</EditableText>
          </p>
        </DraggableWrapper>

        {/* Both products cinematic */}
        <div className="flex-1 flex items-end justify-center gap-8 mt-4 relative">
          <TestimonialBubble
            id="review-story-1"
            text="جودة استثنائية وتنسيق لا يُوصف"
            author="أحمد"
            rating={5}
            className="absolute -top-2 -right-2"
            rotate={3}
            variant="card"
          />

          <DraggableWrapper id="story-orchid-1" className={`${isTall ? 'w-[200px]' : 'w-[160px]'} relative`}>
            <div className="absolute -inset-4 rounded-full opacity-[0.1] blur-[30px]" style={{ backgroundColor: t.accentLime }} />
            <img src="/seasons/orchid-1.png" className="w-full h-auto relative drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" alt="Orchid Classic" />
            <p className="text-center text-[10px] font-black uppercase tracking-widest mt-2 opacity-40">
              <EditableText>Classic</EditableText>
            </p>
          </DraggableWrapper>

          <DraggableWrapper id="story-orchid-2" className={`${isTall ? 'w-[200px]' : 'w-[160px]'} relative`}>
            <div className="absolute -inset-4 rounded-full opacity-[0.1] blur-[30px]" style={{ backgroundColor: t.accent }} />
            <img src="/seasons/orchid-2.png" className="w-full h-auto relative drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" alt="Orchid Royal" />
            <p className="text-center text-[10px] font-black uppercase tracking-widest mt-2 opacity-40">
              <EditableText>Royal</EditableText>
            </p>
          </DraggableWrapper>

          <RatingStars
            id="rating-story"
            rating={4.9}
            reviews="٢٠٠+"
            className="absolute -bottom-1 left-0"
            variant="minimal"
          />
        </div>

        <PostFooter id="orchid-story" label="SEASONS ARTISAN" text="جودة لا تُقارن منذ ٢٠١٨" variant="dark" />
      </div>
    </div>
  );
}
