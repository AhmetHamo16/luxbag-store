import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const FloatingWhatsApp = () => {
  const [waNumber, setWaNumber] = useState('905057777723'); // Custom overridden fallback

  useEffect(() => {
    const fetchNumber = async () => {
      try {
        const res = await api.get('/content');
        if (res.data?.data?.contactInfo?.whatsapp) {
          setWaNumber(res.data.data.contactInfo.whatsapp);
        } else if (res.data?.contactInfo?.whatsapp) {
          setWaNumber(res.data.contactInfo.whatsapp);
        }
      } catch (err) {
        // Fallback to placeholder on error
        console.error('WhatsApp fetch error ignored', err.message);
      }
    };
    fetchNumber();
  }, []);

  // Ensure digits only for wa.me link
  const cleanNumber = waNumber.replace(/[^0-9]/g, '');

  return (
    <div className="fixed bottom-6 right-6 z-[90] group">
      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-lg">
        Chat with us
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
      
      {/* Floating Button */}
      <a 
        href={`https://wa.me/${cleanNumber}`} 
        target="_blank" 
        rel="noreferrer"
        className="w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] hover:-translate-y-1 transition-all duration-300 relative"
      >
        <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766 0 1.015.266 2.008.772 2.88l-1.01 3.692 3.774-.99a5.727 5.727 0 002.231.45h.001c3.18 0 5.767-2.586 5.767-5.766 0-3.181-2.588-5.766-5.767-5.766zm0 9.773c-.859 0-1.7-.231-2.435-.668l-.174-.103-1.808.474.484-1.763-.113-.18a4.8 4.8 0 01-.734-2.569c0-2.656 2.16-4.815 4.818-4.815 2.656 0 4.816 2.158 4.816 4.815-.001 2.657-2.16 4.815-4.816 4.815zm2.636-3.606c-.144-.072-.852-.42-984-.468-.132-.048-.228-.072-.324.072s-.372.468-.456.564-.168.108-.312.036-.607-.224-1.157-.714c-.428-.382-.716-.854-.8-1.022-.084-.168-.009-.259.063-.331.065-.065.144-.168.216-.252.072-.084.096-.144.144-.24a.455.455 0 00-.024-.432c-.048-.096-.324-.78-.444-1.068-.117-.281-.236-.243-.324-.248h-.276c-.096 0-.252.036-.384.18s-.504.492-.504 1.2.516 1.392.588 1.488c.072.096 1.016 1.55 2.46 2.174.344.148.613.237.822.303.345.11.659.094.907.057.279-.042.852-.348.972-.684.12-.336.12-.624.084-.684-.038-.059-.133-.083-.277-.155z"></path></svg>
      </a>
    </div>
  );
};

export default FloatingWhatsApp;
