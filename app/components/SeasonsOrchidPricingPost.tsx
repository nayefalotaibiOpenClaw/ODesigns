import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { PostHeader, PostFooter, PriceBadge, PromoCode } from './shared';
import { ShoppingBag, Check, Gem } from 'lucide-react';

export default function SeasonsOrchidPricingPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>

      {/* Soft decorative blobs */}
      <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full opacity-[0.15] blur-[80px]"
           style={{ backgroundColor: t.accent }} />
      <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full opacity-[0.1] blur-[60px]"
           style={{ backgroundColor: t.accentLime }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="orchid-pricing" subtitle="PRODUCT CATALOG" badge={<><Gem size={12}/> PREMIUM</>} variant="light" />

        {/* Two product cards side by side */}
        <div className="flex-1 flex items-center justify-center gap-5 mt-4">
          {/* Card 1 */}
          <DraggableWrapper id="card-orchid-a" className="flex-1 rounded-3xl overflow-hidden shadow-xl border"
            style={{ backgroundColor: 'white', borderColor: t.accent + '20' }}>
            <div className="p-4 flex flex-col items-center">
              <div className="w-full aspect-square rounded-2xl flex items-center justify-center mb-3 overflow-hidden"
                   style={{ backgroundColor: t.primaryLight }}>
                <img src="/seasons/orchid-1.png" className="w-[90%] h-auto drop-shadow-lg" alt="Classic Orchid" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: t.accent }}>
                <EditableText>كلاسيك</EditableText>
              </p>
              <h3 className="text-lg font-black text-center" style={{ color: t.primary }}>
                <EditableText>أوركيد أبيض</EditableText>
              </h3>
              <p className="text-xs font-bold opacity-50 text-center mt-1" style={{ color: t.primary }}>
                <EditableText>فازة مزخرفة فاخرة</EditableText>
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-2xl font-black" style={{ color: t.accent }}>25</span>
                <span className="text-xs font-bold opacity-60" style={{ color: t.primary }}>KD</span>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {['توصيل مجاني', 'تغليف فاخر'].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Check size={10} style={{ color: t.accent }} />
                    <span className="text-[9px] font-bold" style={{ color: t.primary }}><EditableText>{item}</EditableText></span>
                  </div>
                ))}
              </div>
            </div>
          </DraggableWrapper>

          {/* Card 2 - Featured */}
          <DraggableWrapper id="card-orchid-b" className="flex-1 rounded-3xl overflow-hidden shadow-2xl border-2 relative"
            style={{ backgroundColor: 'white', borderColor: t.accent }}>
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[8px] font-black text-white z-20"
                 style={{ backgroundColor: t.accent }}>
              <EditableText>الأكثر مبيعاً</EditableText>
            </div>
            <div className="p-4 flex flex-col items-center">
              <div className="w-full aspect-square rounded-2xl flex items-center justify-center mb-3 overflow-hidden"
                   style={{ backgroundColor: t.primary + '08' }}>
                <img src="/seasons/orchid-2.png" className="w-[90%] h-auto drop-shadow-lg" alt="Premium Orchid" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: t.accent }}>
                <EditableText>بريميوم</EditableText>
              </p>
              <h3 className="text-lg font-black text-center" style={{ color: t.primary }}>
                <EditableText>أوركيد ملكي</EditableText>
              </h3>
              <p className="text-xs font-bold opacity-50 text-center mt-1" style={{ color: t.primary }}>
                <EditableText>حوض حجري فاخر</EditableText>
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-2xl font-black" style={{ color: t.accent }}>45</span>
                <span className="text-xs font-bold opacity-60" style={{ color: t.primary }}>KD</span>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {['توصيل مجاني', 'تغليف فاخر', 'بطاقة إهداء'].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Check size={10} style={{ color: t.accent }} />
                    <span className="text-[9px] font-bold" style={{ color: t.primary }}><EditableText>{item}</EditableText></span>
                  </div>
                ))}
              </div>
            </div>
          </DraggableWrapper>
        </div>

        {/* Promo code */}
        <div className="flex justify-center mt-4">
          <PromoCode
            id="promo-orchid"
            code="ORCHID20"
            discount="20%"
            description="على جميع الأوركيد"
            variant="coupon"
          />
        </div>

        <PostFooter id="orchid-pricing" label="SEASONS STORE" text="أسعار حصرية لفترة محدودة" variant="light" />
      </div>
    </div>
  );
}
