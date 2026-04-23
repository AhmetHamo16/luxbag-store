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
      className={`inline-flex items-center justify-center gap-3 rounded-full border border-[#6b3f18] bg-[linear-gradient(180deg,#8d5725_0%,#6b3f18_100%)] text-[#fff6e9] shadow-[0_14px_28px_rgba(77,41,14,0.22)] ${compact ? 'px-4 py-2 text-[12px] font-medium tracking-[0.03em]' : 'px-5 py-2.5 text-[12px] font-semibold tracking-[0.03em] sm:px-7 sm:py-3 sm:text-[14px]'} ${className}`.trim()}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <span className={`${compact ? 'h-2.5 w-2.5 shadow-[0_0_0_5px_rgba(248,222,165,0.2)]' : 'h-3.5 w-3.5 shadow-[0_0_0_6px_rgba(248,222,165,0.24)] sm:h-4 sm:w-4'} rounded-full bg-[#f0c56e] flex-shrink-0`} />
      <span className="whitespace-nowrap leading-none">{label}</span>
    </div>
  );
};

export default CashOnDeliveryBadge;
