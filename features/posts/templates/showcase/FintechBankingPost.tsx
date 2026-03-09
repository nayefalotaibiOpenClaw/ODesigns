import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Send, Shield, Wallet } from 'lucide-react';

export default function FintechBankingPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${t.primaryDark} 0%, ${t.primary} 100%)` }} />
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: `linear-gradient(${t.accentLime} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.accentLime} 0.5px, transparent 0.5px)`, backgroundSize: '50px 50px' }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-[0.06] blur-[120px] rounded-full" style={{ backgroundColor: t.accentLime }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white" dir="rtl">
        {/* Header */}
        <DraggableWrapper id="header-fintech" className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: t.accentLime }}>
              <Wallet size={16} style={{ color: t.primaryDark }} />
            </div>
            <EditableText className="text-xs font-bold opacity-50">محفظتي الذكية</EditableText>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: t.accentLime }}>
            <Shield size={10} /> آمن
          </div>
        </DraggableWrapper>

        {/* Balance */}
        <DraggableWrapper id="balance-fintech" className="mt-8 text-center">
          <EditableText className="text-xs font-bold opacity-40 uppercase tracking-widest">الرصيد المتاح</EditableText>
          <div className="mt-2">
            <span className={`${isTall ? 'text-7xl' : 'text-6xl'} font-black`} style={{ color: t.primaryLight }}>4,280</span>
            <EditableText className="text-2xl font-bold opacity-40 mr-2">د.ك</EditableText>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2" style={{ color: t.accentLime }}>
            <ArrowUpRight size={14} />
            <EditableText className="text-sm font-bold">+12.4% هذا الشهر</EditableText>
          </div>
        </DraggableWrapper>

        {/* Credit Card visual */}
        <DraggableWrapper id="card-fintech" className="mt-6 flex justify-center">
          <div className={`w-full max-w-xs rounded-2xl p-5 relative overflow-hidden ${isTall ? 'h-52' : 'h-44'}`} style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accentLight})` }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-xl bg-white" />
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="flex items-center justify-between z-10 relative">
              <CreditCard size={24} />
              <EditableText className="text-xs font-bold tracking-widest opacity-70">VISA</EditableText>
            </div>
            <div className="mt-6 z-10 relative">
              <span className="text-lg font-bold tracking-[0.2em] opacity-80">•••• •••• •••• 4829</span>
            </div>
            <div className="flex justify-between items-end mt-4 z-10 relative">
              <div>
                <EditableText className="text-[8px] font-bold opacity-50 uppercase">صاحب البطاقة</EditableText>
                <EditableText className="text-sm font-bold">سارة أحمد</EditableText>
              </div>
              <div>
                <EditableText className="text-[8px] font-bold opacity-50 uppercase">صالحة حتى</EditableText>
                <span className="text-sm font-bold">09/28</span>
              </div>
            </div>
          </div>
        </DraggableWrapper>

        {/* Quick Actions + Transactions */}
        <DraggableWrapper id="actions-fintech" className="mt-auto space-y-3">
          <div className="flex gap-3 justify-center">
            {[
              { icon: <Send size={16} />, label: 'تحويل' },
              { icon: <ArrowDownLeft size={16} />, label: 'استلام' },
              { icon: <CreditCard size={16} />, label: 'دفع' },
            ].map((action, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  {action.icon}
                </div>
                <EditableText className="text-[9px] font-bold opacity-40">{action.label}</EditableText>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-3 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            {[
              { name: 'مطعم سيلو', amount: '-12.500', type: 'out' },
              { name: 'راتب شهري', amount: '+2,400', type: 'in' },
            ].map((tx, i) => (
              <div key={i} className={`flex items-center justify-between py-2 ${i === 0 ? 'border-b border-white/5' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: tx.type === 'in' ? t.accentLime + '20' : t.accentOrange + '20' }}>
                    {tx.type === 'in' ? <ArrowDownLeft size={10} style={{ color: t.accentLime }} /> : <ArrowUpRight size={10} style={{ color: t.accentOrange }} />}
                  </div>
                  <EditableText className="text-xs font-bold">{tx.name}</EditableText>
                </div>
                <span className="text-xs font-black" style={{ color: tx.type === 'in' ? t.accentLime : t.accentOrange }}>{tx.amount} د.ك</span>
              </div>
            ))}
          </div>
        </DraggableWrapper>
      </div>
    </div>
  );
}
