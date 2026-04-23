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
      className={`inline-flex items-center justify-center gap-3 rounded-full border border-[#dfbf8d] bg-[#fffdfa] text-[#8a5720] shadow-[0_14px_30px_rgba(139,94,52,0.14)] ${compact ? 'px-4 py-2 text-[12px] font-semibold tracking-[0.06em]' : 'px-7 py-3.5 text-[15px] font-extrabold tracking-[0.08em] sm:px-9 sm:py-4 sm:text-[18px]'} ${className}`.trim()}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <span className={`${compact ? 'h-2.5 w-2.5 shadow-[0_0_0_6px_rgba(225,181,94,0.16)]' : 'h-4.5 w-4.5 shadow-[0_0_0_8px_rgba(225,181,94,0.18)] sm:h-5 sm:w-5'} rounded-full bg-[#e1b55e] flex-shrink-0`} />
      <span className="whitespace-nowrap leading-none">{label}</span>
    </div>
  );
};

export default CashOnDeliveryBadge;
