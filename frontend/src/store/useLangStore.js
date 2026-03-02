import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLangStore = create(
  persist(
    (set) => ({
      language: 'en', // 'en', 'ar', 'tr'
      setLanguage: (lang) => {
        set({ language: lang });
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
      },
    }),
    {
      name: 'melora-lang-store',
    }
  )
);

export default useLangStore;
