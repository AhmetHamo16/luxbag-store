import React from 'react';
import { Link } from 'react-router-dom';
import useLangStore from '../../store/useLangStore';

const NotFound = () => {
  const language = useLangStore(state => state.language);
  const t = {
    en: { subtitle: "Page Not Found", msg: "We're sorry, the page you are looking for doesn't exist or has been moved. Let's get you back to our exquisite collection.", back: "Go Back to Shop" },
    ar: { subtitle: "الصفحة غير موجودة", msg: "عذرًا، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. دعنا نعود بك إلى تشكيلتنا الرائعة.", back: "العودة للتسوق" },
    tr: { subtitle: "Sayfa Bulunamadı", msg: "Üzgünüz, aradığınız sayfa mevcut değil veya taşınmış. Sizi zarif koleksiyonumuza geri götürelim.", back: "Mağazaya Dön" }
  }[language] || { subtitle: "Page Not Found", msg: "We're sorry...", back: "Go Back to Shop" };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-beige text-center">
      <img src="/logo.png" alt="Melora Logo" loading="lazy" className="h-20 mb-10 object-contain opacity-50" />
      <h1 className="text-7xl md:text-9xl font-serif text-brand mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-serif text-brand mb-6">{t.subtitle}</h2>
      <p className="text-gray-600 max-w-md mx-auto mb-10 leading-relaxed">
        {t.msg}
      </p>
      <Link to="/shop" className="bg-brand text-beige px-10 py-4 uppercase tracking-widest text-sm font-bold hover:bg-gold transition-colors shadow-lg">
        {t.back}
      </Link>
    </div>
  );
};

export default NotFound;
