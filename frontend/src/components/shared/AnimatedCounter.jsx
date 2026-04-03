import React, { useState, useEffect } from 'react';

const AnimatedCounter = ({ target, text, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [target, duration]);

  // Format with commas if large number
  const formattedCount = count >= 1000 ? count.toLocaleString() : count;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <span className="text-4xl md:text-5xl font-serif text-brand mb-3 drop-shadow-sm">
        {formattedCount}{target >= 15 ? '+' : ''}
      </span>
      <span className="text-xs md:text-sm font-bold tracking-widest uppercase text-gray-500 text-center">
        {text}
      </span>
    </div>
  );
};

export default AnimatedCounter;
