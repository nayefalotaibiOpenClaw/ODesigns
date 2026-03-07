import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from './shared';
import { Leaf, Sparkles } from 'lucide-react';

export default function WasteReductionPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      {/* Background decoration */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${t.primary}, ${t.primaryDark})` }} />
      
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-[0.15] blur-[120px] rounded-full"
           style={{ backgroundColor: t.accentLime }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="waste-reduction" subtitle="INVENTORY AI" badge={<><Leaf size={12}/> ECO-SMART</>} variant="dark" />

        <DraggableWrapper id="headline-waste" className="mt-8 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>قلل الهدر..</EditableText> <br/>
            <span style={{ color: t.accentLime }}><EditableText>ضاعف الأرباح</EditableText></span>
          </h2>
          <p className="text-lg font-bold mt-2 opacity-70" style={{ color: t.primaryLight }}>
            <EditableText>ذكاء اصطناعي يحلل استهلاكك ويمنع الخسائر قبل حدوثها</EditableText>
          </p>
        </DraggableWrapper>

        {/* Mockup area */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-waste" className={`relative z-20 transition-all duration-500 ${isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'}`}>
            <IPhoneMockup src="/3.jpg" />
          </DraggableWrapper>
          
          <FloatingCard 
            id="stat-waste" 
            icon={<Sparkles size={16} style={{ color: t.accentLime }}/>} 
            label="Waste Reduction" 
            value="-35%" 
            className="absolute -right-4 top-1/4 z-30" 
            rotate={5}
            borderColor={t.accentLime}
          />

          <FloatingCard 
            id="stat-savings" 
            icon={<Leaf size={16} style={{ color: t.accentLight }}/>} 
            label="Cost Saved" 
            value="+12% Profit" 
            className="absolute -left-8 bottom-1/4 z-30" 
            rotate={-3}
          />
        </div>

        <PostFooter id="waste" label="SYLO AI OPERATIONS" text="إدارة مخزون ذكية ومستدامة" variant="dark" />
      </div>
    </div>
  );
}
