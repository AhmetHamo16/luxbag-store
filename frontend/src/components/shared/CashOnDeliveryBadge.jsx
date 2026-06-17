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
      className={`inline-flex items-center justify-center gap-3 rounded-full border border-[#a66f34] bg-[linear-gradient(180deg,#704018_0%,#4a2812_100%)] text-[#fff4df] shadow-[0_14px_32px_rgba(74,40,18,0.28)] ${compact ? 'px-4 py-2 text-[12px] font-medium tracking-[0.03em]' : 'px-5 py-2.5 text-[12px] font-semibold tracking-[0.03em] sm:px-7 sm:py-3 sm:text-[14px]'} ${className}`.trim()}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <span className={`${compact ? 'h-2.5 w-2.5 shadow-[0_0_0_5px_rgba(244,199,111,0.24)]' : 'h-3.5 w-3.5 shadow-[0_0_0_6px_rgba(244,199,111,0.28)] sm:h-4 sm:w-4'} rounded-full bg-[#f4c76f] flex-shrink-0`} />
      <span className="whitespace-nowrap leading-none">{label}</span>
    </div>
  );
};

export default CashOnDeliveryBadge;
