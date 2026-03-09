import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Activity, DollarSign, ArrowUpRight, Zap, Users } from 'lucide-react';

export default function SaaSDashboardPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${t.primaryDark}, ${t.primary} 70%, ${t.accent}22)` }} />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `linear-gradient(${t.primaryLight} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.primaryLight} 0.5px, transparent 0.5px)`, backgroundSize: '40px 40px' }} />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] opacity-[0.06] blur-[120px] rounded-full" style={{ backgroundColor: t.accentLime }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="showcase-saas" subtitle="DASHBOARD" badge={<><Zap size={12} /> LIVE</>} variant="dark" />

        <DraggableWrapper id="headline-saas" className="mt-6 z-30">
          <EditableText as="h2" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-tight tracking-tight`} style={{ color: t.primaryLight }}>
            Your metrics,
          </EditableText>
          <EditableText as="h2" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-tight`} style={{ color: t.accentLime }}>
            one glance.
          </EditableText>
          <EditableText as="p" className="text-sm font-bold mt-2 opacity-40">Real-time analytics that drive decisions</EditableText>
        </DraggableWrapper>

        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-saas" variant="mockup" className={`relative z-20 ${isTall ? 'w-[280px] h-[540px]' : 'w-[200px] h-[340px]'}`}>
            <IPhoneMockup src="/1.jpg" />
          </DraggableWrapper>

          <FloatingCard id="stat-saas-rev" icon={<DollarSign size={16} style={{ color: t.accentLime }} />} label="Revenue" value="$48.2K"
            className={`absolute ${isTall ? '-right-4 top-[15%]' : '-right-6 top-[10%]'} z-30`} rotate={-3} borderColor={t.accentLime} animation="float" />
          <FloatingCard id="stat-saas-users" icon={<Users size={16} style={{ color: t.accentGold }} />} label="Active Users" value="12,847"
            className={`absolute ${isTall ? '-left-4 top-[40%]' : '-left-6 top-[35%]'} z-30`} rotate={4} borderColor={t.accentGold} animation="float-slow" />
          <FloatingCard id="stat-saas-growth" icon={<ArrowUpRight size={16} style={{ color: t.accentLime }} />} label="Growth" value="+23%"
            className={`absolute ${isTall ? '-right-2 bottom-[20%]' : '-right-4 bottom-[15%]'} z-30`} rotate={-2} animation="float" />
        </div>

        <PostFooter id="showcase-saas" label="ANALYTICS CLOUD" text="Real-time business intelligence" icon={<Activity size={24} />} variant="dark" />
      </div>
    </div>
  );
}
