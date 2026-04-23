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
      className={`inline-flex items-center justify-center gap-3 rounded-full border border-[#e2c79f] bg-[linear-gradient(180deg,#fffdf9_0%,#fcf6ee_100%)] text-[#8b5a27] shadow-[0_10px_22px_rgba(139,94,52,0.1)] ${compact ? 'px-4 py-2 text-[12px] font-medium tracking-[0.03em]' : 'px-5 py-2.5 text-[12px] font-semibold tracking-[0.03em] sm:px-7 sm:py-3 sm:text-[14px]'} ${className}`.trim()}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <span className={`${compact ? 'h-2.5 w-2.5 shadow-[0_0_0_5px_rgba(225,181,94,0.12)]' : 'h-3.5 w-3.5 shadow-[0_0_0_6px_rgba(225,181,94,0.14)] sm:h-4 sm:w-4'} rounded-full bg-[#ddb35f] flex-shrink-0`} />
      <span className="whitespace-nowrap leading-none">{label}</span>
    </div>
  );
};

export default CashOnDeliveryBadge;
