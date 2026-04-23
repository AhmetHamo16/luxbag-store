import React from 'react';
import CashOnDeliveryBadge from '../shared/CashOnDeliveryBadge';

const SitewideCodBanner = () => {
  return (
    <div className="relative z-[90] border-b border-[#efe4d6] bg-[linear-gradient(180deg,#fffdf9_0%,#fbf4ea_100%)]">
      <div className="mx-auto flex max-w-7xl justify-center px-4 py-3 sm:px-6">
        <CashOnDeliveryBadge className="min-w-[240px] justify-center px-6 py-3 text-[12px] font-bold tracking-[0.24em] sm:min-w-[320px] sm:px-8" />
      </div>
    </div>
  );
};

export default SitewideCodBanner;
