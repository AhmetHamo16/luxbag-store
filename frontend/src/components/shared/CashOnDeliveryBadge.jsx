import React from 'react';
import useLangStore from '../../store/useLangStore';

const badgeCopy = {
  en: 'Cash on delivery available',
  ar: 'الدفع عند الباب متوفر',
  tr: 'Kapida odeme mevcuttur',
};

const CashOnDeliveryBadge = ({ className = '', compact = false }) => {
  const { language } = useLangStore();
  const label = badgeCopy[language] || badgeCopy.en;

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border border-[#e2c69d] bg-[#fffdf9] text-[#8b5e34] shadow-[0_10px_24px_rgba(139,94,52,0.12)] ${compact ? 'px-4 py-2 text-[11px] font-semibold tracking-[0.08em]' : 'px-6 py-3 text-[12px] font-bold tracking-[0.24em]'} ${className}`.trim()}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <span className={`${compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} rounded-full bg-[#e1b55e] shadow-[0_0_0_6px_rgba(225,181,94,0.18)]`} />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
};

export default CashOnDeliveryBadge;
