import React, { useState } from 'react';
import useLangStore from '../../store/useLangStore';

const Contact = () => {
  const language = useLangStore(state => state.language);
  const t = {
    en: {
      title: "Contact Us",
      subtitle: "We would love to hear from you. Reach out with any questions or inquiries.",
      storeInfo: "Store Information",
      addressTitle: "Address",
      address: "123 Luxury Avenue, Fashion District\nNew York, NY 10001",
      phoneTitle: "Phone",
      chatWa: "Chat on WhatsApp",
      emailTitle: "Email",
      hoursTitle: "Working Hours",
      hours: "Mon - Fri: 9:00 AM - 8:00 PM\nSat - Sun: 10:00 AM - 6:00 PM",
      formTitle: "Send a Message",
      formSubtitle: "Fill out the form below and we will contact you as soon as possible.",
      nameLabel: "Your Name",
      emailLabel: "Email Address",
      subjectLabel: "Subject",
      msgLabel: "Message",
      send: "Send Message",
      sending: "Sending...",
      successMsg: "Message sent successfully! We will get back to you shortly."
    },
    ar: {
      title: "اتصل بنا",
      subtitle: "نود أن نسمع منك. تواصل معنا لأي أسئلة أو استفسارات.",
      storeInfo: "معلومات المتجر",
      addressTitle: "العنوان",
      address: "123 شارع الفخامة، منطقة الموضة\nنيويورك، نيويورك 10001",
      phoneTitle: "الهاتف",
      chatWa: "تحدث معنا عبر WhatsApp",
      emailTitle: "البريد الإلكتروني",
      hoursTitle: "ساعات العمل",
      hours: "من الاثنين إلى الجمعة: 9:00 صباحًا - 8:00 مساءً\nالسبت والأحد: 10:00 صباحًا - 6:00 مساءً",
      formTitle: "إرسال رسالة",
      formSubtitle: "املأ النموذج أدناه وسنتصل بك في أقرب وقت ممكن.",
      nameLabel: "اسمك",
      emailLabel: "عنوان البريد الإلكتروني",
      subjectLabel: "الموضوع",
      msgLabel: "الرسالة",
      send: "إرسال الرسالة",
      sending: "جاري الإرسال...",
      successMsg: "تم إرسال الرسالة بنجاح! سنرد عليك قريبًا."
    },
    tr: {
      title: "Bize Ulaşın",
      subtitle: "Sizden haber almaktan memnuniyet duyarız. Her türlü soru ve talebiniz için bize ulaşın.",
      storeInfo: "Mağaza Bilgileri",
      addressTitle: "Adres",
      address: "123 Lüks Caddesi, Moda Bölgesi\nNew York, NY 10001",
      phoneTitle: "Telefon",
      chatWa: "WhatsApp'tan Yazın",
      emailTitle: "E-posta",
      hoursTitle: "Çalışma Saatleri",
      hours: "Pzt - Cum: 09:00 - 20:00\nCmt - Paz: 10:00 - 18:00",
      formTitle: "Mesaj Gönder",
      formSubtitle: "Aşağıdaki formu doldurun, en kısa sürede sizinle iletişime geçelim.",
      nameLabel: "Adınız",
      emailLabel: "E-posta Adresi",
      subjectLabel: "Konu",
      msgLabel: "Mesaj",
      send: "Mesajı Gönder",
      sending: "Gönderiliyor...",
      successMsg: "Mesaj başarıyla gönderildi! Kısa süre içinde size dönüş yapacağız."
    }
  }[language] || t.en;
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus(t.sending);
    setTimeout(() => {
      setStatus(t.successMsg);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      {/* Header */}
      <section className="py-16 bg-beige text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-serif text-brand mb-4">{t.title}</h1>
          <p className="text-[var(--text-secondary)]">{t.subtitle}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-16">
            
            {/* Store Info */}
            <div className="w-full md:w-1/3">
              <h2 className="text-2xl font-serif text-brand mb-6">{t.storeInfo}</h2>
              <div className="space-y-6 text-[var(--text-secondary)]">
                <div>
                  <h4 className="font-medium text-brand mb-1">{t.addressTitle}</h4>
                  <p className="whitespace-pre-line">{t.address}</p>
                </div>
                <div>
                  <h4 className="font-medium text-brand mb-1">{t.phoneTitle}</h4>
                  <a href="https://wa.me/905057777723" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 mt-2 rounded-full text-sm font-medium transition-colors">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    {t.chatWa}
                  </a>
                </div>
                <div>
                  <h4 className="font-medium text-brand mb-1">{t.emailTitle}</h4>
                  <p>support@meloraluxury.com</p>
                </div>
                <div>
                  <h4 className="font-medium text-brand mb-1">{t.hoursTitle}</h4>
                  <p className="whitespace-pre-line">{t.hours}</p>
                </div>
                <div>
                  <h4 className="font-medium text-brand mb-1 mt-6">Follow Us</h4>
                  <div className="flex space-x-4 mt-2">
                    <a href="https://wa.me/905057777723" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#25D366] transition-colors duration-300" aria-label="WhatsApp">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766 0 1.015.266 2.008.772 2.88l-1.01 3.692 3.774-.99a5.727 5.727 0 002.231.45h.001c3.18 0 5.767-2.586 5.767-5.766 0-3.181-2.588-5.766-5.767-5.766zm0 9.773c-.859 0-1.7-.231-2.435-.668l-.174-.103-1.808.474.484-1.763-.113-.18a4.8 4.8 0 01-.734-2.569c0-2.656 2.16-4.815 4.818-4.815 2.656 0 4.816 2.158 4.816 4.815-.001 2.657-2.16 4.815-4.816 4.815zm2.636-3.606c-.144-.072-.852-.42-984-.468-.132-.048-.228-.072-.324.072s-.372.468-.456.564-.168.108-.312.036-.607-.224-1.157-.714c-.428-.382-.716-.854-.8-1.022-.084-.168-.009-.259.063-.331.065-.065.144-.168.216-.252.072-.084.096-.144.144-.24a.455.455 0 00-.024-.432c-.048-.096-.324-.78-.444-1.068-.117-.281-.236-.243-.324-.248h-.276c-.096 0-.252.036-.384.18s-.504.492-.504 1.2.516 1.392.588 1.488c.072.096 1.016 1.55 2.46 2.174.344.148.613.237.822.303.345.11.659.094.907.057.279-.042.852-.348.972-.684.12-.336.12-.624.084-.684-.038-.059-.133-.083-.277-.155z"></path></svg>
                    </a>
                    <a href="https://www.instagram.com/melora_cantasi?igsh=MmgzbWhoajk2eHps" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E1306C] transition-colors duration-300" aria-label="Instagram">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </a>
                    <a href="https://www.tiktok.com/@meloraantas?_r=1&_t=ZS-94txKQpbGVB" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[var(--text-primary)] transition-colors duration-300" aria-label="TikTok">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.16-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.83 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="w-full md:w-2/3 rounded-sm border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 md:p-12 transition-colors">
              <h2 className="text-2xl font-serif text-brand mb-2">{t.formTitle}</h2>
              <p className="text-[var(--text-secondary)] text-sm mb-8">{t.formSubtitle}</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t.nameLabel}</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-[var(--border-color)] bg-[var(--bg-card)] p-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-brand" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t.emailLabel}</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-[var(--border-color)] bg-[var(--bg-card)] p-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-brand" placeholder="jane@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t.subjectLabel}</label>
                  <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full border border-[var(--border-color)] bg-[var(--bg-card)] p-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-brand" placeholder="Order Inquiry" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t.msgLabel}</label>
                  <textarea required rows="6" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full border border-[var(--border-color)] bg-[var(--bg-card)] p-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-brand" placeholder=""></textarea>
                </div>
                <button type="submit" className="w-full bg-brand text-beige py-4 uppercase tracking-widest text-sm font-bold hover:bg-gold transition-colors">
                  {t.send}
                </button>
                {status && (
                  <div className={`p-4 text-sm font-medium text-center ${status.includes('success') ? 'text-green-700 bg-green-50' : 'text-brand'}`}>
                    {status}
                  </div>
                )}
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
