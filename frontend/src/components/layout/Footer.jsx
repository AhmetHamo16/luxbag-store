import React from 'react';
import { Link } from 'react-router-dom';
import useTranslation from '../../hooks/useTranslation';
import { contentService } from '../../services/contentService';
import useLangStore from '../../store/useLangStore';

const Footer = () => {
  const { t } = useTranslation('footer');
  const { language } = useLangStore();
  const [content, setContent] = React.useState(null);
  const copy = {
    en: {
      shopAll: 'Shop All',
      classicCollection: 'Classic Collection',
      ourStory: 'Our Story',
      customerCare: 'Customer Care',
      faq: 'FAQ',
      shippingReturns: 'Shipping & Returns',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      newsletter: 'Newsletter',
      newsletterText: 'Subscribe to receive exclusive offers, early access to new collections, and styling tips.',
      emailPlaceholder: 'Your email address',
      join: 'Join',
    },
    ar: {
      shopAll: 'تسوقي الكل',
      classicCollection: 'مجموعة الكلاسيك',
      ourStory: 'قصتنا',
      customerCare: 'خدمة العملاء',
      faq: 'الأسئلة الشائعة',
      shippingReturns: 'الشحن والاسترجاع',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الخدمة',
      newsletter: 'النشرة البريدية',
      newsletterText: 'اشتركي للحصول على العروض الحصرية والوصول المبكر إلى التشكيلات الجديدة ونصائح الأناقة.',
      emailPlaceholder: 'بريدك الإلكتروني',
      join: 'اشتراك',
    },
    tr: {
      shopAll: 'Tum Urunler',
      classicCollection: 'Klasik Koleksiyon',
      ourStory: 'Hikayemiz',
      customerCare: 'Musteri Hizmetleri',
      faq: 'Sik Sorulan Sorular',
      shippingReturns: 'Kargo ve Iade',
      privacy: 'Gizlilik Politikasi',
      terms: 'Hizmet Sartlari',
      newsletter: 'Bulten',
      newsletterText: 'Ozel teklifler, yeni koleksiyonlara erken erisim ve stil onerileri icin abone olun.',
      emailPlaceholder: 'E-posta adresiniz',
      join: 'Katil',
    },
  }[language] || {
    shopAll: 'Shop All',
    classicCollection: 'Classic Collection',
    ourStory: 'Our Story',
    customerCare: 'Customer Care',
    faq: 'FAQ',
    shippingReturns: 'Shipping & Returns',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    newsletter: 'Newsletter',
    newsletterText: 'Subscribe to receive exclusive offers, early access to new collections, and styling tips.',
    emailPlaceholder: 'Your email address',
    join: 'Join',
  };

  React.useEffect(() => {
    contentService.getContent().then(res => setContent(res.data)).catch(() => {});
  }, []);

  return (
    <footer className="bg-[var(--footer-bg)] text-beige pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <img loading="lazy" src="/logo.png" className="h-16 object-contain" alt="Melora Logo" />
            </Link>
            <p className="text-beige/70 text-sm leading-relaxed mb-6">
              {content?.aboutUs?.[language] || t.aboutText || 'Discover luxury handbags crafted with uncompromising quality and timeless elegance.'}
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-serif text-white tracking-widest uppercase mb-6">{t.quickLinks || 'Explore'}</h3>
            <ul className="space-y-4 text-sm text-beige/70">
              <li><Link to="/shop" className="hover:text-gold transition-colors duration-300">{copy.shopAll}</Link></li>
              <li><Link to="/categories" className="hover:text-gold transition-colors duration-300">{copy.classicCollection}</Link></li>
              <li><Link to="/about" className="hover:text-gold transition-colors duration-300">{copy.ourStory}</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors duration-300">{t.contact || 'Contact'}</Link></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-serif text-white tracking-widest uppercase mb-6">{copy.customerCare}</h3>
            <ul className="space-y-4 text-sm text-beige/70">
              <li><Link to="/faq" className="hover:text-gold transition-colors duration-300">{copy.faq}</Link></li>
              <li><Link to="/shipping" className="hover:text-gold transition-colors duration-300">{copy.shippingReturns}</Link></li>
              <li><Link to="/privacy" className="hover:text-gold transition-colors duration-300">{copy.privacy}</Link></li>
              <li><Link to="/terms" className="hover:text-gold transition-colors duration-300">{copy.terms}</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-serif text-white tracking-widest uppercase mb-6">{copy.newsletter}</h3>
            <p className="text-beige/70 text-sm mb-4 leading-relaxed">{copy.newsletterText}</p>
            <form className="flex flex-col space-y-4 relative">
              <input 
                type="email" 
                placeholder={copy.emailPlaceholder}
                className="bg-transparent border-b border-beige/30 text-white px-0 py-2 focus:outline-none focus:border-gold transition-colors text-sm w-full placeholder-beige/40"
              />
              <button 
                type="submit" 
                className="absolute right-0 top-1 text-gold hover:text-white transition-colors uppercase text-xs tracking-widest font-bold"
              >
                {copy.join}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom Line */}
        <div className="border-t border-beige/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-beige/50 text-center md:text-left">
          <p className="mb-4 md:mb-0">
            {content?.footerText?.[language] || `© ${new Date().getFullYear()} Melora. All rights reserved.`}
          </p>
          <div className="flex space-x-6">
            <a href="https://wa.me/905057777723" target="_blank" rel="noopener noreferrer" className="text-beige/70 hover:text-[#25D366] transition-colors duration-300" aria-label="WhatsApp">
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766 0 1.015.266 2.008.772 2.88l-1.01 3.692 3.774-.99a5.727 5.727 0 002.231.45h.001c3.18 0 5.767-2.586 5.767-5.766 0-3.181-2.588-5.766-5.767-5.766zm0 9.773c-.859 0-1.7-.231-2.435-.668l-.174-.103-1.808.474.484-1.763-.113-.18a4.8 4.8 0 01-.734-2.569c0-2.656 2.16-4.815 4.818-4.815 2.656 0 4.816 2.158 4.816 4.815-.001 2.657-2.16 4.815-4.816 4.815zm2.636-3.606c-.144-.072-.852-.42-984-.468-.132-.048-.228-.072-.324.072s-.372.468-.456.564-.168.108-.312.036-.607-.224-1.157-.714c-.428-.382-.716-.854-.8-1.022-.084-.168-.009-.259.063-.331.065-.065.144-.168.216-.252.072-.084.096-.144.144-.24a.455.455 0 00-.024-.432c-.048-.096-.324-.78-.444-1.068-.117-.281-.236-.243-.324-.248h-.276c-.096 0-.252.036-.384.18s-.504.492-.504 1.2.516 1.392.588 1.488c.072.096 1.016 1.55 2.46 2.174.344.148.613.237.822.303.345.11.659.094.907.057.279-.042.852-.348.972-.684.12-.336.12-.624.084-.684-.038-.059-.133-.083-.277-.155z"></path></svg>
            </a>
            <a href="https://www.instagram.com/melora_cantasi?igsh=MmgzbWhoajk2eHps" target="_blank" rel="noopener noreferrer" className="text-beige/70 hover:text-[#E1306C] transition-colors duration-300" aria-label="Instagram">
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@meloraantas?_r=1&_t=ZS-94txKQpbGVB" target="_blank" rel="noopener noreferrer" className="text-beige/70 hover:text-white transition-colors duration-300" aria-label="TikTok">
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.16-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.83 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
