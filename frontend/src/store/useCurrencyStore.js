import { create } from 'zustand';
import { settingsService } from '../services/settingsService';

const currencyMap = {
  USD: '$',
  TRY: '\u20BA',
  SAR: '\u0631.\u0633'
};

const localeMap = {
  USD: 'en-US',
  TRY: 'tr-TR',
  SAR: 'ar-SA'
};

const defaultCurrency = 'TRY';
const defaultSymbol = currencyMap[defaultCurrency];

const useCurrencyStore = create((set, get) => ({
  currency: defaultCurrency,
  symbol: defaultSymbol,
  isLoading: false,

  fetchCurrency: async () => {
    set({ isLoading: true });
    try {
      const res = await settingsService.getSettings();
      const cur = res.data?.currency || defaultCurrency;
      set({
        currency: cur,
        symbol: currencyMap[cur] || defaultSymbol,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch currency:', error);
      set({
        currency: defaultCurrency,
        symbol: defaultSymbol,
        isLoading: false
      });
    }
  },

  formatPrice: (price) => {
    const { symbol, currency } = get();
    const numericValue = Number(price || 0);
    const locale = localeMap[currency] || 'tr-TR';
    const formattedNumber = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericValue);
    return `${symbol}${formattedNumber}`;
  }
}));

export default useCurrencyStore;
