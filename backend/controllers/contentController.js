const Content = require('../models/Content');

// @desc    Get Global Content blocks
// @route   GET /api/content
// @access  Public
exports.getContent = async (req, res) => {
  try {
    let content = await Content.findOne();
    if (!content) {
      // Auto-initialize Default CMS instance if none exists
      content = await Content.create({
        heroBanner: {
          title: { en: 'Welcome to Melora', ar: 'مرحباً بكم في ميلورا', tr: 'Melora\'ya Hoşgeldiniz' },
          subtitle: { en: 'Luxury redefined.', ar: 'إعادة تعريف الفخامة.', tr: 'Lüks yeniden tanımlandı.' },
          buttonText: { en: 'Shop Now', ar: 'تسوق الآن', tr: 'Şimdi Alışveriş Yap' }
        },
        aboutUs: { en: 'We are a premier fashion outlet.', ar: 'نحن منفذ أزياء رائد.', tr: 'Biz önde gelen bir moda mağazasıyız.' },
        contactInfo: {
          phone: '+1 800 MELORA',
          email: 'hello@melora.com',
          whatsapp: '+1 800 555 1234',
          address: { en: '123 Fashion Ave, NY', ar: '123 شارع الموضة، نيويورك', tr: '123 Moda Cad, NY' }
        },
        homeSections: {
          newArrivals: { en: 'New Arrivals', ar: 'وصل حديثاً', tr: 'Yeni Gelenler' },
          featured: { en: 'Featured Collections', ar: 'تشكيلات مميزة', tr: 'Öne Çıkan Koleksiyonlar' }
        },
        productPage: {
          authenticText: { en: 'AUTHENTIC GUARANTEED 100%', ar: 'أصلي ومضمون 100%', tr: '%100 ORİJİNAL GARANTİLİ' },
          authenticDesc: { en: 'Every item is meticulously authenticated by our luxury experts.', ar: 'كل قطعة يتم التحقق من أصالتها بدقة من قبل خبراء الفخامة لدينا.', tr: 'Her ürün lüks uzmanlarımız tarafından titizlikle doğrulanır.' },
          shippingText: { en: 'FREE EXPRESS SHIPPING', ar: 'شحن سريع مجاني', tr: 'ÜCRETSİZ HIZLI KARGO' },
          shippingDesc: { en: 'Enjoy complimentary express delivery on all orders over $200.', ar: 'استمتع بتوصيل سريع مجاني لجميع الطلبات التي تزيد عن 200 دولار.', tr: '200$ üzeri tüm siparişlerde ücretsiz hızlı kargo ayrıcalığı yaşayın.' },
          deliveryText: { en: 'DELIVERY & RETURNS', ar: 'التوصيل والإرجاع', tr: 'Teslimat ve İade' }
        },
        footerText: { en: 'Dedicated to bringing you the finest luxury handbags globally.', ar: 'مكرسون لنقدم لكِ أرقى حقائب اليد الفاخرة عالمياً.', tr: 'Size küresel olarak en iyi lüks el çantalarını sunmaya adanmıştır.' },
        announcementBar: {
          text: { en: '🔥 20% OFF all bags today only 🔥', ar: '🔥 خصم 20% على جميع الحقائب اليوم فقط 🔥', tr: '🔥 Bugün tüm çantalarda %20 indirim 🔥' },
          enabled: false
        }
      });
    }
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Global Content
// @route   PUT /api/content
// @access  Private/Admin
exports.updateContent = async (req, res) => {
  try {
    let content = await Content.findOne();
    const payload = req.body;

    // Detect if Multer mapped a file hook to req.file (Hero Image)
    if (req.file) {
      if (!payload.heroBanner) payload.heroBanner = {};
      payload.heroBanner.backgroundImage = req.file.path;
    }

    if (!content) {
      content = await Content.create(payload);
    } else {
      // Deep merge since this contains nested localization maps
      // If a nested layer is sent as JSON string, parse it.
      const parsedBody = {};
      for (const [key, value] of Object.entries(payload)) {
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
          try {
            parsedBody[key] = JSON.parse(value);
          } catch(e) {
            parsedBody[key] = value;
          }
        } else {
          parsedBody[key] = value;
        }
      }

      // We manually merge Hero Banner, About, Contact info to prevent wiping out nested properties implicitly
      if (parsedBody.heroBanner) {
         content.heroBanner = { ...content.heroBanner, ...parsedBody.heroBanner };
      }
      if (parsedBody.aboutUs) {
         content.aboutUs = { ...content.aboutUs, ...parsedBody.aboutUs };
      }
      if (parsedBody.contactInfo) {
         content.contactInfo = { ...content.contactInfo, ...parsedBody.contactInfo };
      }
      if (parsedBody.homeSections) {
         content.homeSections = { ...content.homeSections, ...parsedBody.homeSections };
      }
      if (parsedBody.productPage) {
         content.productPage = { ...content.productPage, ...parsedBody.productPage };
      }
      if (parsedBody.footerText) {
         content.footerText = { ...content.footerText, ...parsedBody.footerText };
      }
      if (parsedBody.announcementBar) {
         content.announcementBar = { ...content.announcementBar, ...parsedBody.announcementBar };
      }

      await content.save();
    }
    
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
