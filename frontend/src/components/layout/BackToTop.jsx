import React, { useState, useEffect } from 'react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after 300px scroll
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-6 left-6 z-[90] pointer-events-none">
      <button
        onClick={scrollToTop}
        className={`pointer-events-auto w-12 h-12 bg-black text-white dark:bg-gray-800 hover:bg-gold dark:hover:bg-gold hover:-translate-y-1 transition-all duration-300 rounded-full flex items-center justify-center shadow-lg ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
        aria-label="Back to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
      </button>
    </div>
  );
};

export default BackToTop;
