import { useState, useEffect } from 'react';

export default function useDarkMode() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    }
    return 'light';
  });

  const colorTheme = theme === 'dark' ? 'light' : 'dark';

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(colorTheme);
    root.classList.add(theme);
    root.style.colorScheme = theme;

    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, [theme, colorTheme]);

  return [colorTheme, setTheme];
}
