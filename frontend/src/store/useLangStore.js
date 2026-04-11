import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const supportedLanguages = ['en', 'ar', 'tr'];

const applyDocumentLanguage = (lang) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
};

const detectPreferredLanguage = () => {
  if (typeof navigator === 'undefined') return 'en';

  const browserLanguages = Array.isArray(navigator.languages) && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language];

  for (const language of browserLanguages) {
    const normalized = String(language || '').toLowerCase();
    if (normalized.startsWith('ar')) return 'ar';
    if (normalized.startsWith('tr')) return 'tr';
    if (normalized.startsWith('en')) return 'en';
  }

  return 'en';
};

const useLangStore = create(
  persist(
    (set) => ({
      language: detectPreferredLanguage(),
      setLanguage: (lang) => {
        const safeLanguage = supportedLanguages.includes(lang) ? lang : 'en';
        set({ language: safeLanguage });
        applyDocumentLanguage(safeLanguage);
      },
    }),
    {
      name: 'melora-lang-store',
      onRehydrateStorage: () => (state) => {
        const safeLanguage = supportedLanguages.includes(state?.language) ? state.language : detectPreferredLanguage();
        if (state?.language !== safeLanguage) {
          state?.setLanguage?.(safeLanguage);
          return;
        }
        applyDocumentLanguage(safeLanguage);
      },
    }
  )
);

export default useLangStore;
