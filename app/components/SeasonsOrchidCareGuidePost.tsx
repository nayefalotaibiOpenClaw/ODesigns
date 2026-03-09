import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { PostHeader, PostFooter } from './shared';
import { Droplets, Sun, Thermometer, Leaf } from 'lucide-react';

export default function SeasonsOrchidCareGuidePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  const tips = [
    { icon: <Droplets size={18} />, title: 'الري', desc: 'مرة أسبوعياً فقط' },
    { icon: <Sun size={18} />, title: 'الإضاءة', desc: 'ضوء غير مباشر' },
    { icon: <Thermometer size={18} />, title: 'الحرارة', desc: '١٨° - ٢٥° مئوية' },
    { icon: <Leaf size={18} />, title: 'التسميد', desc: 'مرة شهرياً' },
  ];

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>

      {/* Background gradient */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${t.primary} 0%, ${t.primaryDark} 100%)` }} />

      {/* Decorative dots */}
      <div className="absolute inset-0 opacity-[0.04]"
           style={{ backgroundImage: `radial-gradient(${t.primaryLight} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="orchid-care" subtitle="PLANT CARE" badge={<><Leaf size={12}/> GUIDE</>} variant="dark" />

        <DraggableWrapper id="headline-care" className="text-center mt-4" dir="rtl">
          <h2 className="text-4xl font-black leading-tight text-white">
            <EditableText>كيف تعتني</EditableText><br/>
            <span style={{ color: t.accentLime }}><EditableText>بأوركيدك؟</EditableText></span>
          </h2>
        </DraggableWrapper>

        {/* Product + tips layout */}
        <div className="flex-1 flex items-center gap-5 mt-4">
          {/* Orchid image */}
          <DraggableWrapper id="img-care-orchid" className={`${isTall ? 'w-[200px]' : 'w-[180px]'} shrink-0`}>
            <img src="/seasons/orchid-1.png" className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]" alt="Orchid" />
          </DraggableWrapper>

          {/* Tips grid */}
          <div className="flex-1 grid grid-cols-1 gap-3">
            {tips.map((tip, i) => (
              <DraggableWrapper key={i} id={`tip-${i}`}
                className="flex items-center gap-3 p-3 rounded-2xl backdrop-blur-sm"
                style={{ backgroundColor: t.primaryLight + '10', border: `1px solid ${t.primaryLight}15` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                     style={{ backgroundColor: t.accent + '30', color: t.accentLime }}>
                  {tip.icon}
                </div>
                <div className="text-right flex-1" dir="rtl">
                  <p className="text-sm font-black text-white"><EditableText>{tip.title}</EditableText></p>
                  <p className="text-xs font-bold opacity-50 text-white"><EditableText>{tip.desc}</EditableText></p>
                </div>
              </DraggableWrapper>
            ))}
          </div>
        </div>

        <PostFooter id="orchid-care" label="SEASONS TIPS" text="نباتك يستحق أفضل عناية" variant="dark" />
      </div>
    </div>
  );
}
