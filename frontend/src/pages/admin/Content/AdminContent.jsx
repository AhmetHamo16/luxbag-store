import React, { useState, useEffect } from 'react';
import { contentService } from '../../../services/contentService';
import Loader from '../../../components/shared/Loader';
import useTranslation from '../../../hooks/useTranslation';
import useLangStore from '../../../store/useLangStore';
import toast from 'react-hot-toast';

const uiMap = {
  en: { success: 'Content updated successfully.', failed: 'Failed to update content blocks.' },
  ar: { success: 'تم تحديث المحتوى بنجاح.', failed: 'تعذر تحديث عناصر المحتوى.' },
  tr: { success: 'Icerik basariyla guncellendi.', failed: 'Icerik bloklari guncellenemedi.' }
};

const AdminContent = () => {
  const { t } = useTranslation('admin');
  const { language } = useLangStore();
  const ui = uiMap[language] || uiMap.en;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState('en');

  const [formData, setFormData] = useState({
    heroBanner: {
      title: { en: '', ar: '', tr: '' },
      subtitle: { en: '', ar: '', tr: '' },
      buttonText: { en: '', ar: '', tr: '' }
    },
    aboutUs: { en: '', ar: '', tr: '' },
    contactInfo: {
      phone: '',
      email: '',
      whatsapp: '',
      address: { en: '', ar: '', tr: '' }
    },
    homeSections: {
      newArrivals: { en: '', ar: '', tr: '' },
      featured: { en: '', ar: '', tr: '' }
    },
    productPage: {
      authenticText: { en: '', ar: '', tr: '' },
      authenticDesc: { en: '', ar: '', tr: '' },
      shippingText: { en: '', ar: '', tr: '' },
      shippingDesc: { en: '', ar: '', tr: '' },
      featuresText: { en: '', ar: '', tr: '' },
      featuresDesc: { en: '', ar: '', tr: '' },
      deliveryText: { en: '', ar: '', tr: '' },
      deliveryDesc: { en: '', ar: '', tr: '' }
    },
    footerText: { en: '', ar: '', tr: '' },
    announcementBar: {
      text: { en: '', ar: '', tr: '' },
      enabled: false
    }
  });

  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await contentService.getContent();
        if (res.data) {
          setFormData({
            heroBanner: res.data.heroBanner || formData.heroBanner,
            aboutUs: res.data.aboutUs || formData.aboutUs,
            contactInfo: res.data.contactInfo || formData.contactInfo,
            homeSections: res.data.homeSections || formData.homeSections,
            productPage: res.data.productPage || formData.productPage,
            footerText: res.data.footerText || formData.footerText,
            announcementBar: res.data.announcementBar || formData.announcementBar
          });
          if (res.data.heroBanner?.backgroundImage) {
            setHeroImagePreview(res.data.heroBanner.backgroundImage);
          }
        }
      } catch {
        console.error("Failed to load CMS content.");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHeroChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      heroBanner: {
        ...prev.heroBanner,
        [field]: {
          ...prev.heroBanner[field],
          [activeLang]: value
        }
      }
    }));
  };

  const handleContactChange = (field, value, isLocalized = false) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: isLocalized ? { ...prev.contactInfo[field], [activeLang]: value } : value
      }
    }));
  };

  const handleAboutChange = (value) => {
    setFormData(prev => ({
      ...prev,
      aboutUs: { ...prev.aboutUs, [activeLang]: value }
    }));
  };

  const handleNestedChange = (section, field, value, isLocalized = true) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: isLocalized ? { ...prev[section][field], [activeLang]: value } : value
      }
    }));
  };

  const handleSimpleLocalizedChange = (section, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [activeLang]: value }
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeroImageFile(file);
      setHeroImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      
      // Append deep localized objects as JSON strings for Multer
      payload.append('heroBanner', JSON.stringify(formData.heroBanner));
      payload.append('aboutUs', JSON.stringify(formData.aboutUs));
      payload.append('contactInfo', JSON.stringify(formData.contactInfo));
      payload.append('homeSections', JSON.stringify(formData.homeSections));
      payload.append('productPage', JSON.stringify(formData.productPage));
      payload.append('footerText', JSON.stringify(formData.footerText));
      payload.append('announcementBar', JSON.stringify(formData.announcementBar));

      if (heroImageFile) {
        payload.append('heroImage', heroImageFile);
      }

      const res = await contentService.updateContent(payload);
      if (res.data?.heroBanner?.backgroundImage) {
        setHeroImagePreview(res.data.heroBanner.backgroundImage);
        setHeroImageFile(null);
      }
      toast.success(ui.success);
    } catch (err) {
      toast.error(ui.failed);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif text-black">{t?.content?.title || 'Content Management'}</h1>
        
        {/* Language Tabs */}
        <div className="flex bg-gray-100 rounded p-1">
          {['en', 'ar', 'tr'].map(lang => (
            <button
              key={lang}
              onClick={(e) => { e.preventDefault(); setActiveLang(lang); }}
              className={`px-4 py-1 text-sm font-medium rounded ${activeLang === lang ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'}`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8 pb-10">
        
        {/* Hero Banner Section */}
        <section className="bg-white p-6 md:p-8 shadow-sm border border-gray-100 rounded">
          <h2 className="text-lg font-medium border-b pb-2 mb-6">Hero Banner Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title ({activeLang.toUpperCase()})</label>
                <input required type="text" value={formData.heroBanner.title[activeLang]} onChange={(e) => handleHeroChange('title', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle ({activeLang.toUpperCase()})</label>
                <input required type="text" value={formData.heroBanner.subtitle[activeLang]} onChange={(e) => handleHeroChange('subtitle', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Button Text ({activeLang.toUpperCase()})</label>
                <input required type="text" value={formData.heroBanner.buttonText[activeLang]} onChange={(e) => handleHeroChange('buttonText', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Background Image</label>
              <div className="border border-dashed border-gray-300 rounded p-4 text-center cursor-pointer hover:bg-gray-50 relative h-48 flex flex-col items-center justify-center">
                <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {heroImagePreview ? (
                  <img loading="lazy" src={heroImagePreview} alt="Hero Preview" className="h-full w-full object-cover rounded opacity-80" />
                ) : (
                  <div className="text-sm text-gray-500">Click or drag to upload hero banner</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="bg-white p-6 md:p-8 shadow-sm border border-gray-100 rounded">
          <h2 className="text-lg font-medium border-b pb-2 mb-6">About Us ({activeLang.toUpperCase()})</h2>
          <textarea
            required
            rows="5"
            value={formData.aboutUs[activeLang]}
            onChange={(e) => handleAboutChange(e.target.value)}
            className="w-full border p-3 focus:outline-none focus:border-black text-sm"
            placeholder="Write your brand story here..."
          />
        </section>

        {/* Contact Info Section */}
        <section className="bg-white p-6 md:p-8 shadow-sm border border-gray-100 rounded">
          <h2 className="text-lg font-medium border-b pb-2 mb-6">Global Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Support Email</label>
              <input type="email" value={formData.contactInfo.email} onChange={(e) => handleContactChange('email', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input type="text" value={formData.contactInfo.phone} onChange={(e) => handleContactChange('phone', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp Line</label>
              <input type="text" value={formData.contactInfo.whatsapp} onChange={(e) => handleContactChange('whatsapp', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Physical Address ({activeLang.toUpperCase()})</label>
              <input type="text" value={formData.contactInfo.address[activeLang]} onChange={(e) => handleContactChange('address', e.target.value, true)} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
            </div>
          </div>
        </section>

        {/* Announcement Bar Section */}
        <section className="bg-white p-6 md:p-8 shadow-sm border border-gray-100 rounded">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-lg font-medium">Daily Deals Announcement Bar</h2>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={formData.announcementBar.enabled} onChange={(e) => handleNestedChange('announcementBar', 'enabled', e.target.checked, false)} className="w-4 h-4 text-black cursor-pointer" />
              <span className="text-sm font-medium">Enable Ticker</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Scrolling Text ({activeLang.toUpperCase()})</label>
            <input type="text" value={formData.announcementBar.text[activeLang]} onChange={(e) => handleNestedChange('announcementBar', 'text', e.target.value)} placeholder="e.g. 🔥 20% OFF ALL BAGS 🔥" className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
          </div>
        </section>

        {/* Home Sections Config */}
        <section className="bg-white p-6 md:p-8 shadow-sm border border-gray-100 rounded">
          <h2 className="text-lg font-medium border-b pb-2 mb-6">Homepage Section Titles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">New Arrivals Title ({activeLang.toUpperCase()})</label>
              <input type="text" value={formData.homeSections.newArrivals[activeLang]} onChange={(e) => handleNestedChange('homeSections', 'newArrivals', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Featured Collections Title ({activeLang.toUpperCase()})</label>
              <input type="text" value={formData.homeSections.featured[activeLang]} onChange={(e) => handleNestedChange('homeSections', 'featured', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
            </div>
          </div>
        </section>

        {/* Product Page Constants */}
        <section className="bg-white p-6 md:p-8 shadow-sm border border-gray-100 rounded">
          <h2 className="text-lg font-medium border-b pb-2 mb-6">Product Page Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Authentic Guarantee Title ({activeLang.toUpperCase()})</label>
                <input type="text" value={formData.productPage.authenticText[activeLang]} onChange={(e) => handleNestedChange('productPage', 'authenticText', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Authentic Guarantee Desc ({activeLang.toUpperCase()})</label>
                <input type="text" value={formData.productPage.authenticDesc[activeLang]} onChange={(e) => handleNestedChange('productPage', 'authenticDesc', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Shipping Title ({activeLang.toUpperCase()})</label>
                <input type="text" value={formData.productPage.shippingText[activeLang]} onChange={(e) => handleNestedChange('productPage', 'shippingText', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shipping Desc ({activeLang.toUpperCase()})</label>
                <input type="text" value={formData.productPage.shippingDesc[activeLang]} onChange={(e) => handleNestedChange('productPage', 'shippingDesc', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Features Title ({activeLang.toUpperCase()})</label>
              <input type="text" value={formData.productPage.featuresText[activeLang]} onChange={(e) => handleNestedChange('productPage', 'featuresText', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm mb-4" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Features Description ({activeLang.toUpperCase()})</label>
              <textarea rows="3" value={formData.productPage.featuresDesc[activeLang]} onChange={(e) => handleNestedChange('productPage', 'featuresDesc', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm mb-4" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery & Returns Tab Title ({activeLang.toUpperCase()})</label>
              <input type="text" value={formData.productPage.deliveryText[activeLang]} onChange={(e) => handleNestedChange('productPage', 'deliveryText', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm mb-4" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery & Returns Description ({activeLang.toUpperCase()})</label>
              <textarea rows="3" value={formData.productPage.deliveryDesc[activeLang]} onChange={(e) => handleNestedChange('productPage', 'deliveryDesc', e.target.value)} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
            </div>
          </div>
        </section>

        {/* Footer Text Section */}
        <section className="bg-white p-6 md:p-8 shadow-sm border border-gray-100 rounded">
          <h2 className="text-lg font-medium border-b pb-2 mb-6">Footer Text ({activeLang.toUpperCase()})</h2>
          <textarea
            rows="2"
            value={formData.footerText[activeLang]}
            onChange={(e) => handleSimpleLocalizedChange('footerText', e.target.value)}
            className="w-full border p-3 focus:outline-none focus:border-black text-sm"
          />
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="bg-black text-white px-8 py-3 font-medium text-sm rounded hover:bg-gold transition-colors disabled:opacity-50">
            {saving ? 'Saving Changes...' : t?.common?.save || 'Publish Content'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AdminContent;
