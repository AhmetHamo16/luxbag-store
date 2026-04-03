import React from 'react';
import useLangStore from '../../store/useLangStore';

const AnnouncementBar = ({ content }) => {
  const { language } = useLangStore();
  
  if (!content || !content.enabled) return null;

  const text = content.text?.[language] || content.text?.en;
  
  if (!text) return null;

  return (
    <div className="bg-[#3e2723] text-[#f5f5dc] py-2 overflow-hidden whitespace-nowrap relative border-b border-[#5d4037]">
      <div className="animate-marquee inline-block">
        {/* We duplicate the text to ensure continuous smooth scrolling without empty gaps */}
        <span className="mx-4 font-medium tracking-wider text-sm">{text}</span>
        <span className="mx-4 font-medium tracking-wider text-sm">{text}</span>
        <span className="mx-4 font-medium tracking-wider text-sm">{text}</span>
        <span className="mx-4 font-medium tracking-wider text-sm">{text}</span>
        <span className="mx-4 font-medium tracking-wider text-sm">{text}</span>
        <span className="mx-4 font-medium tracking-wider text-sm">{text}</span>
      </div>
    </div>
  );
};

export default AnnouncementBar;
