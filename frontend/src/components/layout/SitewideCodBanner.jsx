import React from 'react';
import CashOnDeliveryBadge from '../shared/CashOnDeliveryBadge';

const SitewideCodBanner = () => {
  return (
    <div className="relative z-[90] border-b border-[#efe4d6] bg-[linear-gradient(180deg,#fffdf9_0%,#fbf4ea_100%)]">
      <div className="mx-auto flex max-w-7xl justify-center px-4 py-3 sm:px-6 sm:py-4">
        <CashOnDeliveryBadge className="min-w-[280px] sm:min-w-[420px]" />
      </div>
    </div>
  );
};

export default SitewideCodBanner;
