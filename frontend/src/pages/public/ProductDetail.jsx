import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Loader from '../../components/shared/Loader';
import { productService } from '../../services/productService';
import useCartStore from '../../store/cartStore';
import useLangStore from '../../store/useLangStore';
import { translations } from '../../i18n/translations';
import useCurrencyStore from '../../store/useCurrencyStore';
import { reviewService } from '../../services/reviewService';
import useAuthStore from '../../store/authStore';
import ProductCard from '../../components/product/ProductCard';
import toast from 'react-hot-toast';
import { contentService } from '../../services/contentService';
import { getAvailableStock, getStockLevel, isAvailableForPurchase } from '../../utils/stock';
import { resolveAssetUrl as sharedResolveAssetUrl } from '../../utils/assets';

const ProductDetail = () => {
  const { id } = useParams(); // URL param acts as slug/id
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore(state => state.addItem);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const { language } = useLangStore();
  const formatPrice = useCurrencyStore(state => state.formatPrice);
  const [recentItems, setRecentItems] = useState([]);
  const imageCount = product?.images?.length || 0;
  const t = translations[language].product;
  const localizedName = product?.name?.[language] || product?.name?.en || product?.name?.ar || product?.name?.tr || 'Unknown';
  const resolveAssetUrl = useCallback(
    (value) => sharedResolveAssetUrl(value, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200'),
    []
  );
  const stockMessages = {
    en: {
      backSoon: 'This design is currently unavailable, but it will be back very soon.',
      notifyTone: 'Thank you for your patience. We are preparing a fresh restock for you.',
      warehouse: 'Available in warehouse:',
    },
    ar: {
      backSoon: 'هذا التصميم غير متوفر حاليًا، لكنه سيعود في أقرب وقت.',
      notifyTone: 'شكرًا لصبرك، نحن نجهز إعادة التوفر لك بأجمل صورة.',
      warehouse: 'المتوفر في المستودع:',
    },
    tr: {
      backSoon: 'Bu tasarim su an tukendi, ancak cok yakinda yeniden stokta olacak.',
      notifyTone: 'Sabiriniz icin tesekkurler. Yeni stok hazirlaniyor.',
      warehouse: 'Depodaki adet:',
    }
  }[language] || {
    backSoon: 'This design is currently unavailable, but it will be back very soon.',
    notifyTone: 'Thank you for your patience. We are preparing a fresh restock for you.',
    warehouse: 'Available in warehouse:',
  };
  if (language === 'ar') {
    stockMessages.backSoon = 'هذا التصميم غير متوفر حاليًا، لكنه سيعود قريبًا جدًا.';
    stockMessages.notifyTone = 'شكرًا لصبرك، نحن نجهز إعادة التوفر لك بأجمل صورة.';
    stockMessages.warehouse = 'المتوفر في المستودع:';
  }

  if (language === 'ar') {
    stockMessages.backSoon = 'هذا التصميم غير متوفر حاليًا، لكنه سيعود قريبًا جدًا.';
    stockMessages.notifyTone = 'شكرًا لصبرك، نحن نجهز إعادة التوفر لك بأجمل صورة.';
    stockMessages.warehouse = 'المتوفر في المستودع:';
  }

  const piecesIncluded = Number(product?.specs?.piecesIncluded || 1);
  const productFacts = {
    en: {
      includedPieces: piecesIncluded > 1 ? `${piecesIncluded} coordinated pieces` : 'Single signature piece',
      material: product?.specs?.material || 'Premium crafted finish',
      dimensions: product?.specs?.dimensions?.width ? `${product.specs.dimensions.width} x ${product.specs.dimensions.height || '-'} x ${product.specs.dimensions.depth || '-'} cm` : 'Boutique-sized silhouette',
      piecesLabel: 'Set Details',
      materialLabel: 'Material',
      dimensionsLabel: 'Dimensions',
    },
    ar: {
      includedPieces: piecesIncluded > 1 ? `${piecesIncluded} قطع متناسقة` : 'قطعة أساسية واحدة',
      material: product?.specs?.material || 'خامة فاخرة بتشطيب راقٍ',
      dimensions: product?.specs?.dimensions?.width ? `${product.specs.dimensions.width} × ${product.specs.dimensions.height || '-'} × ${product.specs.dimensions.depth || '-'} سم` : 'حجم أنيق للمشاوير والسهرة',
      piecesLabel: 'تفاصيل الطقم',
      materialLabel: 'الخامة',
      dimensionsLabel: 'الأبعاد',
    },
    tr: {
      includedPieces: piecesIncluded > 1 ? `${piecesIncluded} uyumlu parca` : 'Tek imza parca',
      material: product?.specs?.material || 'Premium iscilikli yuzey',
      dimensions: product?.specs?.dimensions?.width ? `${product.specs.dimensions.width} x ${product.specs.dimensions.height || '-'} x ${product.specs.dimensions.depth || '-'} cm` : 'Zarif butik form',
      piecesLabel: 'Set Detayi',
      materialLabel: 'Malzeme',
      dimensionsLabel: 'Olculer',
    }
  }[language] || {
    includedPieces: piecesIncluded > 1 ? `${piecesIncluded} coordinated pieces` : 'Single signature piece',
    material: product?.specs?.material || 'Premium crafted finish',
    dimensions: product?.specs?.dimensions?.width ? `${product.specs.dimensions.width} x ${product.specs.dimensions.height || '-'} x ${product.specs.dimensions.depth || '-'} cm` : 'Boutique-sized silhouette',
    piecesLabel: 'Set Details',
    materialLabel: 'Material',
    dimensionsLabel: 'Dimensions',
  };
  if (language === 'ar') {
    productFacts.includedPieces = piecesIncluded > 1 ? `${piecesIncluded} قطع متناسقة` : 'قطعة أساسية واحدة';
    productFacts.material = product?.specs?.material || 'خامة فاخرة بتشطيب راقٍ';
    productFacts.dimensions = product?.specs?.dimensions?.width ? `${product.specs.dimensions.width} × ${product.specs.dimensions.height || '-'} × ${product.specs.dimensions.depth || '-'} سم` : 'حجم أنيق للمشاوير والسهرات';
    productFacts.piecesLabel = 'تفاصيل الطقم';
    productFacts.materialLabel = 'الخامة';
    productFacts.dimensionsLabel = 'الأبعاد';
  }

  if (language === 'ar') {
    productFacts.includedPieces = piecesIncluded > 1 ? `${piecesIncluded} قطع متناسقة` : 'قطعة أساسية واحدة';
    productFacts.material = product?.specs?.material || 'خامة فاخرة بتشطيب راقٍ';
    productFacts.dimensions = product?.specs?.dimensions?.width ? `${product.specs.dimensions.width} × ${product.specs.dimensions.height || '-'} × ${product.specs.dimensions.depth || '-'} سم` : 'حجم أنيق للمشاوير والسهرات';
    productFacts.piecesLabel = 'تفاصيل الطقم';
    productFacts.materialLabel = 'الخامة';
    productFacts.dimensionsLabel = 'الأبعاد';
  }

  const ui = {
    en: {
      notFound: 'Product Not Found',
      home: 'Home',
      shop: 'Shop',
      detailView: 'View Detail',
      openGallery: 'Open the full gallery',
      reset: 'Reset',
      copied: 'Link copied to clipboard!',
      share: 'Share',
      whatsapp: 'WhatsApp',
      offerEnds: 'Offer Ends In:',
      selectVariant: 'Select Size & Color',
      sizeGuide: 'Size Guide',
      orderViaWhatsapp: 'Order via WhatsApp',
      related: 'You May Also Like',
      recentlyViewed: 'Recently Viewed',
      reviews: 'Customer Reviews',
      verifiedBuyer: 'Verified Buyer',
      noReviews: 'No reviews yet. Be the first to review this product!',
      writeReview: 'Write a Review',
      rating: 'Rating',
      yourReview: 'Your Review',
      reviewPlaceholder: 'Share your thoughts about this product...',
      submitting: 'Submitting...',
      submitReview: 'Submit Review',
      loginToReview: 'Log in to write a review',
      fitGuide: 'Fit & Size Guide',
      dimensionsCm: 'Dimensions (cm)',
      strapDrop: 'Strap Drop (cm)',
      measurementsNote: '* Measurements are approximate and may vary slightly by model.',
      size: 'Size',
      fit: 'Fit',
      reviewSuccess: 'Review submitted successfully!',
      reviewError: 'Failed to submit review',
      addSuccess: 'Added to cart',
      orderMessage: `Hello, I would like to order: ${localizedName} for ${formatPrice(selectedVariant?.salePrice || selectedVariant?.price || product?.salePrice || product?.price || 0)}`,
      shareMessage: `Hey, check out this bag: ${typeof window !== 'undefined' ? window.location.href : ''}`,
    },
    ar: {
      notFound: 'المنتج غير موجود',
      home: 'الرئيسية',
      shop: 'المتجر',
      detailView: 'عرض التفاصيل',
      openGallery: 'افتحي المعرض الكامل',
      reset: 'إعادة الضبط',
      copied: 'تم نسخ الرابط',
      share: 'مشاركة',
      whatsapp: 'واتساب',
      offerEnds: 'ينتهي العرض خلال:',
      selectVariant: 'اختاري المقاس واللون',
      sizeGuide: 'دليل المقاسات',
      orderViaWhatsapp: 'اطلبي عبر واتساب',
      related: 'قد يعجبك أيضًا',
      recentlyViewed: 'شوهدت مؤخرًا',
      reviews: 'آراء العملاء',
      verifiedBuyer: 'مشتري موثق',
      noReviews: 'لا توجد تقييمات بعد. كوني أول من يراجع هذا المنتج!',
      writeReview: 'اكتبي تقييمًا',
      rating: 'التقييم',
      yourReview: 'تقييمك',
      reviewPlaceholder: 'شاركي رأيك حول هذا المنتج...',
      submitting: 'جارٍ الإرسال...',
      submitReview: 'إرسال التقييم',
      loginToReview: 'سجلي الدخول لكتابة تقييم',
      fitGuide: 'دليل المقاس',
      dimensionsCm: 'الأبعاد (سم)',
      strapDrop: 'طول الحمالة (سم)',
      measurementsNote: '* المقاسات تقريبية وقد تختلف قليلًا حسب الموديل.',
      size: 'المقاس',
      fit: 'الملاءمة',
      reviewSuccess: 'تم إرسال التقييم بنجاح!',
      reviewError: 'فشل إرسال التقييم',
      addSuccess: 'تمت الإضافة إلى السلة',
      orderMessage: `مرحبًا، أود طلب: ${localizedName} بسعر ${formatPrice(selectedVariant?.salePrice || selectedVariant?.price || product?.salePrice || product?.price || 0)}`,
      shareMessage: `مرحبًا، شاهدي هذه الحقيبة: ${typeof window !== 'undefined' ? window.location.href : ''}`,
    },
    tr: {
      notFound: 'Urun bulunamadi',
      home: 'Ana Sayfa',
      shop: 'Magaza',
      detailView: 'Detayi Gor',
      openGallery: 'Tum galeriyi ac',
      reset: 'Sifirla',
      copied: 'Baglanti kopyalandi',
      share: 'Paylas',
      whatsapp: 'WhatsApp',
      offerEnds: 'Teklifin bitmesine:',
      selectVariant: 'Boyut ve Renk Sec',
      sizeGuide: 'Beden Rehberi',
      orderViaWhatsapp: 'WhatsApp ile Siparis Ver',
      related: 'Bunlari da begenebilirsiniz',
      recentlyViewed: 'Son Goruntulenenler',
      reviews: 'Musteri Yorumlari',
      verifiedBuyer: 'Dogrulanmis Alici',
      noReviews: 'Henuz yorum yok. Bu urune ilk yorumu siz yapin!',
      writeReview: 'Yorum Yaz',
      rating: 'Puan',
      yourReview: 'Yorumunuz',
      reviewPlaceholder: 'Bu urun hakkindaki dusuncelerinizi paylasin...',
      submitting: 'Gonderiliyor...',
      submitReview: 'Yorumu Gonder',
      loginToReview: 'Yorum yazmak icin giris yapin',
      fitGuide: 'Olcu Rehberi',
      dimensionsCm: 'Olculer (cm)',
      strapDrop: 'Aski Uzunlugu (cm)',
      measurementsNote: '* Olculer yaklasiktir ve modele gore kucuk farkliliklar gosterebilir.',
      size: 'Boyut',
      fit: 'Kullanim',
      reviewSuccess: 'Yorum basariyla gonderildi!',
      reviewError: 'Yorum gonderilemedi',
      addSuccess: 'Sepete eklendi',
      orderMessage: `Merhaba, su urunu siparis vermek istiyorum: ${localizedName} - ${formatPrice(selectedVariant?.salePrice || selectedVariant?.price || product?.salePrice || product?.price || 0)}`,
      shareMessage: `Merhaba, bu cantaya bak: ${typeof window !== 'undefined' ? window.location.href : ''}`,
    }
  }[language] || {
    notFound: 'Product Not Found',
    home: 'Home',
    shop: 'Shop',
    detailView: 'View Detail',
    openGallery: 'Open the full gallery',
    reset: 'Reset',
    copied: 'Link copied to clipboard!',
    share: 'Share',
    whatsapp: 'WhatsApp',
    offerEnds: 'Offer Ends In:',
    selectVariant: 'Select Size & Color',
    sizeGuide: 'Size Guide',
    orderViaWhatsapp: 'Order via WhatsApp',
    related: 'You May Also Like',
    recentlyViewed: 'Recently Viewed',
    reviews: 'Customer Reviews',
    verifiedBuyer: 'Verified Buyer',
    noReviews: 'No reviews yet. Be the first to review this product!',
    writeReview: 'Write a Review',
    rating: 'Rating',
    yourReview: 'Your Review',
    reviewPlaceholder: 'Share your thoughts about this product...',
    submitting: 'Submitting...',
    submitReview: 'Submit Review',
    loginToReview: 'Log in to write a review',
    fitGuide: 'Fit & Size Guide',
    dimensionsCm: 'Dimensions (cm)',
    strapDrop: 'Strap Drop (cm)',
    measurementsNote: '* Measurements are approximate and may vary slightly by model.',
    size: 'Size',
    fit: 'Fit',
    reviewSuccess: 'Review submitted successfully!',
    reviewError: 'Failed to submit review',
    addSuccess: 'Added to cart',
    orderMessage: `Hello, I would like to order: ${localizedName} for ${formatPrice(selectedVariant?.salePrice || selectedVariant?.price || product?.salePrice || product?.price || 0)}`,
    shareMessage: `Hey, check out this bag: ${typeof window !== 'undefined' ? window.location.href : ''}`,
  };
  if (language === 'ar') {
    Object.assign(ui, {
      notFound: 'المنتج غير موجود',
      home: 'الرئيسية',
      shop: 'المتجر',
      detailView: 'عرض التفاصيل',
      openGallery: 'افتحي المعرض الكامل',
      reset: 'إعادة الضبط',
      copied: 'تم نسخ الرابط',
      share: 'مشاركة',
      whatsapp: 'واتساب',
      offerEnds: 'ينتهي العرض خلال:',
      selectVariant: 'اختاري المقاس واللون',
      sizeGuide: 'دليل المقاسات',
      orderViaWhatsapp: 'اطلبي عبر واتساب',
      related: 'قد يعجبك أيضًا',
      recentlyViewed: 'شاهدت مؤخرًا',
      reviews: 'آراء العملاء',
      verifiedBuyer: 'مشتري موثق',
      noReviews: 'لا توجد تقييمات بعد. كوني أول من يراجع هذا المنتج.',
      writeReview: 'اكتبي تقييمًا',
      rating: 'التقييم',
      yourReview: 'تقييمك',
      reviewPlaceholder: 'شاركي رأيك حول هذا المنتج...',
      submitting: 'جارٍ الإرسال...',
      submitReview: 'إرسال التقييم',
      loginToReview: 'سجلي الدخول لكتابة تقييم',
      fitGuide: 'دليل المقاس',
      dimensionsCm: 'الأبعاد (سم)',
      strapDrop: 'طول الحمالة (سم)',
      measurementsNote: '* المقاسات تقريبية وقد تختلف قليلًا حسب الموديل.',
      size: 'المقاس',
      fit: 'الملاءمة',
      reviewSuccess: 'تم إرسال التقييم بنجاح!',
      reviewError: 'فشل إرسال التقييم',
      addSuccess: 'تمت الإضافة إلى السلة',
      orderMessage: `مرحبًا، أود طلب: ${localizedName} بسعر ${formatPrice(selectedVariant?.salePrice || selectedVariant?.price || product?.salePrice || product?.price || 0)}`,
      shareMessage: `مرحبًا، شاهدي هذه الحقيبة: ${typeof window !== 'undefined' ? window.location.href : ''}`,
    });
  }

  const trustCopy = {
    en: {
      authenticTitle: '100% Authentic Guaranteed',
      authenticDesc: 'Every Melora handbag passes strict quality control and originality verification.',
      shippingTitle: 'Free Express Shipping',
      shippingDesc: 'Enjoy complimentary local delivery on all orders over ₺500.',
      featuresTitle: 'Key Features',
      featuresDesc: 'Premium materials with a refined finish made for daily elegance.',
      deliveryTitle: 'Delivery & Returns',
      deliveryDesc: 'Fast delivery and a smooth return process for a more confident shopping experience.',
    },
    ar: {
      authenticTitle: 'ضمان الأصالة 100%',
      authenticDesc: 'كل حقيبة من Melora تمر بمراحل تدقيق جودة وتحقيق من الأصالة.',
      shippingTitle: 'شحن سريع مجاني',
      shippingDesc: 'استمتعي بشحن محلي مجاني للطلبات التي تزيد عن 500 ليرة تركية.',
      featuresTitle: 'أبرز المميزات',
      featuresDesc: 'خامات فاخرة وتشطيب راقٍ مصمم للاستخدام اليومي بأناقة.',
      deliveryTitle: 'التوصيل والإرجاع',
      deliveryDesc: 'توصيل سريع وإرجاع سلس لتجربة شراء أكثر راحة.',
    },
    tr: {
      authenticTitle: 'Yuzde 100 Orijinallik Garantisi',
      authenticDesc: 'Her Melora canta, kalite kontrol ve orijinallik dogrulamasindan gecer.',
      shippingTitle: 'Ucretsiz Hizli Kargo',
      shippingDesc: '500 TL uzeri tum siparislerde ucretsiz yerel teslimatin keyfini cikarın.',
      featuresTitle: 'One Cikan Ozellikler',
      featuresDesc: 'Gunluk zarafet icin rafine yuzeyli premium malzemeler.',
      deliveryTitle: 'Teslimat ve Iade',
      deliveryDesc: 'Daha guvenli bir alisveris deneyimi icin hizli teslimat ve kolay iade sureci.',
    },
  }[language] || {
    authenticTitle: '100% Authentic Guaranteed',
    authenticDesc: 'Every Melora handbag passes strict quality control and originality verification.',
    shippingTitle: 'Free Express Shipping',
    shippingDesc: 'Enjoy complimentary local delivery on all orders over ₺500.',
    featuresTitle: 'Key Features',
    featuresDesc: 'Premium materials with a refined finish made for daily elegance.',
    deliveryTitle: 'Delivery & Returns',
    deliveryDesc: 'Fast delivery and a smooth return process for a more confident shopping experience.',
  };

  if (language === 'ar') {
    Object.assign(trustCopy, {
      authenticTitle: 'ضمان الأصالة 100%',
      authenticDesc: 'كل حقيبة من Melora تمر بمراحل تدقيق جودة وتحقيق من الأصالة.',
      shippingTitle: 'شحن سريع مجاني',
      shippingDesc: 'استمتعي بشحن محلي مجاني للطلبات التي تزيد عن 500 ليرة تركية.',
      featuresTitle: 'أبرز المميزات',
      featuresDesc: 'خامات فاخرة وتشطيب راقٍ مصمم للاستخدام اليومي بأناقة.',
      deliveryTitle: 'التوصيل والإرجاع',
      deliveryDesc: 'توصيل سريع وإرجاع سلس لتجربة شراء أكثر راحة.',
    });
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        const [data, contentRes] = await Promise.all([
          isObjectId ? productService.getProductById(id) : productService.getProductBySlug(id),
          contentService.getContent()
        ]);
          
        const prodData = data.data;
        setProduct(prodData);
        setContent(contentRes.data);
        if (prodData.images && prodData.images.length > 0) {
          setMainImageIndex(0);
        }
        if (prodData.variants && prodData.variants.length > 0) {
          setSelectedVariant(prodData.variants[0]);
        }
        
        if (prodData.category) {
          const catId = typeof prodData.category === 'object' ? prodData.category._id : prodData.category;
          productService.getProducts({ category: catId, limit: 5 }).then(res => {
             setRelatedProducts(res.data.filter(p => p._id !== prodData._id).slice(0, 4));
          }).catch(console.error);
        }

        try {
          const revRes = await reviewService.getReviewsByProduct(prodData._id);
          setReviews(revRes.data || []);
        } catch (e) {
          console.error("Failed to load reviews", e);
        }
        
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    setLightboxZoom(1);
  }, [mainImageIndex, product?._id]);

  const increment = () => {
    const maxAvailable = getAvailableStock(product, selectedVariant);
    if (product && quantity < maxAvailable) setQuantity(prev => prev + 1);
  };
  
  const decrement = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  // SEO & Dynamic Meta Tags
  useEffect(() => {
    if (product) {
      const prodName = product.name?.en || 'Melora Bag';
      document.title = `${prodName} | Melora`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', (product.description?.en || '').substring(0, 160));
      } else {
        const desc = document.createElement('meta');
        desc.name = "description";
        desc.content = (product.description?.en || '').substring(0, 160);
        document.head.appendChild(desc);
      }

      // JSON-LD Structured Data
      let script = document.querySelector('#product-jsonld');
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'product-jsonld';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": prodName,
        "image": product.images ? product.images.map((i) => resolveAssetUrl(i)) : [],
        "description": product.description?.en || '',
        "offers": {
          "@type": "Offer",
          "priceCurrency": "TRY",
          "price": product.salePrice || product.price,
          "availability": getAvailableStock(product) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      });

      // Save to Recently Viewed
      try {
        const recent = JSON.parse(localStorage.getItem('melora_recent') || '[]');
        const existingIdx = recent.findIndex(r => r._id === product._id || r.id === product._id);
        if (existingIdx > -1) recent.splice(existingIdx, 1);
        recent.unshift({
          _id: product._id,
          slug: product.slug || product._id,
          name: product.name,
          images: product.images,
          price: product.price,
          salePrice: product.salePrice
        });
        if (recent.length > 10) recent.pop();
        localStorage.setItem('melora_recent', JSON.stringify(recent));
        setRecentItems(recent.filter(r => r._id !== product._id && r.slug !== product.slug));
      } catch(e) { console.error('Recent sync error', e) }
    }

    return () => {
      document.title = "Melora | Luxury Handbags";
      const ld = document.querySelector('#product-jsonld');
      if (ld) ld.remove();
    };
  }, [product, resolveAssetUrl]);

  if (loading) return <Loader />;
  if (!product) return <div className="text-center py-20 text-xl font-serif">{ui.notFound}</div>;

  // Extract multilingual fields
  const name = product.name?.[language] || product.name?.en || 'Unknown';
  const description = product.description?.[language] || product.description?.en || '';
  const availableStock = getAvailableStock(product, selectedVariant);
  const stockLevel = getStockLevel(availableStock);
  const canPurchase = isAvailableForPurchase(product, selectedVariant);
  const currentPrice = selectedVariant?.salePrice || selectedVariant?.price || product.salePrice || product.price;
  const quickBenefits = {
    en: ['Boutique selection', 'Fast support', 'Secure ordering'],
    ar: ['اختيار بوتيكي', 'دعم سريع', 'طلب آمن'],
    tr: ['Butik secim', 'Hizli destek', 'Guvenli siparis'],
  }[language] || ['Boutique selection', 'Fast support', 'Secure ordering'];


  const handleAddToCart = () => {
    if (!canPurchase) {
      toast.error(stockMessages.backSoon);
      return;
    }

    const itemToAdd = selectedVariant 
      ? { ...product, selectedColor: selectedVariant.color, size: selectedVariant.size, price: selectedVariant.salePrice || selectedVariant.price || product.salePrice || product.price, _variantId: selectedVariant._id } 
      : { ...product, price: product.salePrice || product.price };
      
    addItem(itemToAdd, quantity);
    toast.success(ui.addSuccess, { duration: 2000 });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setReviewSubmitting(true);
      await reviewService.addReview({
        product: product._id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment
      });
      toast.success(ui.reviewSuccess);
      setReviewForm({ rating: 5, comment: '' });
      const revRes = await reviewService.getReviewsByProduct(product._id);
      setReviews(revRes.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || ui.reviewError);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-28 pt-10 sm:px-6 sm:py-16 lg:px-8">
      
      {/* Breadcrumb */}
      <nav className="text-sm mb-8 text-gray-500 flex items-center gap-2">
        <Link to="/" className="hover:text-black transition-colors">{ui.home}</Link>
        <span>&gt;</span>
        <Link to="/shop" className="hover:text-black transition-colors">{ui.shop}</Link>
        <span>&gt;</span>
        <span className="text-black truncate">{name}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
        
        {/* Image Gallery */}
        <div className="w-full md:w-1/2 flex flex-col-reverse md:flex-row gap-4 relative">
          <div className="flex md:flex-col gap-4 overflow-x-auto md:w-24 shrink-0 custom-scrollbar">
            {product.images?.map((img, idx) => {
              const src = resolveAssetUrl(img);
              return (
              <button 
                key={idx} 
                onClick={() => setMainImageIndex(idx)}
                className={`overflow-hidden rounded-[22px] border bg-[#f8f1e8] shadow-sm transition-all duration-300 relative h-24 md:h-[110px] ${mainImageIndex === idx ? 'border-gold opacity-100 scale-[1.02] shadow-[0_16px_30px_rgba(78,48,24,0.14)]' : 'border-[#eadcc8] opacity-75 hover:opacity-100 hover:border-[#d9c0a2]'}`}
              >
                <img loading="lazy" src={src} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover object-center" />
              </button>
            )})}
          </div>
          
          <div 
            className="flex-1 bg-[radial-gradient(circle_at_top,#fffdf9_0%,#f7efe5_55%,#efe2d2_100%)] aspect-[4/5] relative overflow-hidden group cursor-zoom-in rounded-[34px] border border-[#eadcc8] shadow-[0_25px_55px_rgba(66,42,18,0.09)]"
            onClick={() => setIsLightboxOpen(true)}
          >
            {product.images?.map((img, idx) => {
              const src = resolveAssetUrl(img);
              return (
                <img 
                  key={idx}
                  src={src} 
                  loading={idx === 0 ? "eager" : "lazy"} 
                  className={`absolute inset-0 h-full w-full object-contain p-6 md:p-8 transition-all duration-500 ease-out group-hover:scale-[1.015] ${mainImageIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`} 
                  alt={`${name} view ${idx + 1}`} 
                />
              )
            })}
            
            {/* Image Counter Overlay */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-medium px-3 py-1 rounded-full z-20 backdrop-blur-sm pointer-events-none">
              {mainImageIndex + 1} / {product.images?.length || 1}
            </div>
            {imageCount > 1 && (
              <div className="absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between px-3 md:hidden">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMainImageIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/88 text-[#2f2117] shadow-[0_10px_24px_rgba(47,33,23,0.16)] backdrop-blur-sm"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMainImageIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/88 text-[#2f2117] shadow-[0_10px_24px_rgba(47,33,23,0.16)] backdrop-blur-sm"
                  aria-label="Next image"
                >
                  ›
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/80 bg-[#fffaf4]/92 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#2c1d12] shadow-[0_14px_34px_rgba(66,42,18,0.16)] backdrop-blur-md transition hover:bg-white md:px-4 md:text-[11px] md:tracking-[0.28em]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="5.5" strokeWidth="1.8" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.5 15.5L20 20" />
              </svg>
              {ui.detailView}
            </button>
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/35 via-black/0 to-transparent px-5 pb-5 pt-12 text-right text-[11px] font-medium tracking-[0.24em] text-white/90 opacity-100 md:opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {ui.openGallery}
            </div>
          </div>
        </div>

        {/* Fullscreen Lightbox */}
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[220] bg-black/95 flex items-center justify-center backdrop-blur-sm">
            <button 
              onClick={() => {
                setIsLightboxOpen(false);
                setLightboxZoom(1);
              }}
              className="absolute top-6 right-6 text-white text-4xl hover:text-gold transition-colors z-[230] focus:outline-none"
            >
              &times;
            </button>
            <div className="absolute top-6 left-6 z-[230] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxZoom((prev) => Math.max(1, Number((prev - 0.25).toFixed(2))))}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-2xl text-white backdrop-blur-md transition hover:bg-white/20"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setLightboxZoom((prev) => Math.min(3, Number((prev + 0.25).toFixed(2))))}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-2xl text-white backdrop-blur-md transition hover:bg-white/20"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setLightboxZoom(1)}
                className="rounded-full bg-white/12 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md transition hover:bg-white/20"
              >
                {ui.reset}
              </button>
            </div>
            <div className="relative w-full h-full max-w-5xl max-h-screen flex items-center justify-center p-4">
              <img loading="lazy" 
                src={resolveAssetUrl(product.images?.[mainImageIndex])} 
                className="max-w-full max-h-[90vh] object-contain select-none transition-transform duration-300"
                style={{ transform: `scale(${lightboxZoom})` }}
                alt={name}
              />
              {/* Prev Button */}
              {product.images?.length > 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setMainImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1); }}
                  className="absolute left-3 top-1/2 z-[230] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all hover:bg-white/25 focus:outline-none md:left-8 md:h-12 md:w-12"
                >
                  &#10094;
                </button>
              )}
              {/* Next Button */}
              {product.images?.length > 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setMainImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1); }}
                  className="absolute right-3 top-1/2 z-[230] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all hover:bg-white/25 focus:outline-none md:right-8 md:h-12 md:w-12"
                >
                  &#10095;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Product Details */}
        <div className="w-full md:w-1/2 flex flex-col justify-center rounded-[30px] border border-[#eadcc8] bg-white/78 p-4 shadow-[0_18px_40px_rgba(66,42,18,0.05)] backdrop-blur-sm sm:p-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none">
          <h1 className="mb-3 text-[1.85rem] leading-tight font-serif text-black sm:mb-4 sm:text-4xl">{name}</h1>
          
          {/* Star Rating Display */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex text-gold">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < Math.round(product.rating || 0) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              ))}
            </div>
            <span className="text-xs font-medium text-gray-500">({product.reviewCount || 0} reviews)</span>
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="rounded-[1.35rem] border border-[#ead9c5] bg-[#fffaf3] px-4 py-3 text-xl font-medium text-black shadow-[0_12px_28px_rgba(66,42,18,0.07)] sm:rounded-full sm:px-5 sm:text-2xl">
              {formatPrice(currentPrice)}
            </div>
            <div className={`rounded-[1.2rem] border px-4 py-2 text-[11px] font-semibold tracking-[0.14em] sm:rounded-full sm:text-xs sm:tracking-[0.18em] ${canPurchase ? 'border-[#cfe2d0] bg-[#f2faf3] text-[#2f6b38]' : 'border-[#e8c8bc] bg-[#fff4ef] text-[#a45139]'}`}>
              {canPurchase ? (t.inStock?.replace('{n}', availableStock) || `${availableStock} in stock`) : stockMessages.backSoon}
            </div>
          </div>
          
          <p className="mb-8 text-sm leading-7 text-gray-600 whitespace-pre-line">
            {description}
          </p>
          <div className="mb-8 -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {quickBenefits.map((item) => (
              <div
                key={item}
                className="min-w-max rounded-full border border-[#e6d7c5] bg-white/88 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7d6040] shadow-[0_8px_18px_rgba(66,42,18,0.05)]"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-[#eadcc8] bg-[#fffaf3] px-5 py-4 shadow-[0_10px_30px_rgba(73,43,16,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a6948]">{productFacts.materialLabel}</p>
              <p className="mt-2 text-sm font-medium text-[#2f2117]">{productFacts.material}</p>
            </div>
            <div className="rounded-[24px] border border-[#eadcc8] bg-[#fffaf3] px-5 py-4 shadow-[0_10px_30px_rgba(73,43,16,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a6948]">{productFacts.dimensionsLabel}</p>
              <p className="mt-2 text-sm font-medium text-[#2f2117]">{productFacts.dimensions}</p>
            </div>
          </div>

          {/* Share & Actions */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-6">
            <button 
              onClick={() => {
                 navigator.clipboard.writeText(window.location.href);
                 toast.success(ui.copied);
              }} 
              className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-brand transition-colors"
            >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
               {ui.share}
            </button>
            
            <a href={`https://wa.me/905057777723?text=${encodeURIComponent(ui.shareMessage)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#25D366] hover:text-[#128C7E] transition-colors">
               {ui.whatsapp}
            </a>
          </div>

          {/* Stock Display */}
          <div className="mb-6 flex flex-col gap-3 rounded-[28px] border border-[#eadcc8] bg-[linear-gradient(180deg,#fffdf9_0%,#f8f0e5_100%)] p-4 text-start shadow-[0_16px_34px_rgba(66,42,18,0.06)] sm:p-5">
            <span className={`text-sm font-medium ${canPurchase ? 'text-green-600' : 'text-red-500'}`}>
              {canPurchase ? (t.inStock?.replace('{n}', availableStock) || `${availableStock} in stock`) : stockMessages.backSoon}
            </span>
            {stockLevel === 'critical' && (
              <span className="text-red-500 text-sm font-bold animate-pulse">
                {t.onlyLeft?.replace('{n}', availableStock) || `Only ${availableStock} left in stock - order soon!`}
              </span>
            )}
            {canPurchase && (
              <span className="text-xs text-gray-500">
                {stockMessages.warehouse} {availableStock}
              </span>
            )}
            {!canPurchase && (
              <div className="rounded-md border border-[#d8c0a6] bg-[#fbf4ed] px-4 py-3 text-sm text-[#7a5630]">
                {stockMessages.notifyTone}
              </div>
            )}
            {/* Fake Countdown Timer */}
            {(product.salePrice || availableStock < 10) && canPurchase && (
              <div className="flex items-center gap-2 text-sm font-bold text-brand bg-[#F5EFE6] px-4 py-3 w-fit border-l-4 border-gold">
                <svg className="w-5 h-5 text-gold animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {ui.offerEnds} <span className="text-red-600 mx-1">04h 32m 15s</span>
              </div>
            )}
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                 <h4 className="text-sm font-medium uppercase tracking-wide">{ui.selectVariant}</h4>
                 <button onClick={() => setIsSizeGuideOpen(true)} className="text-xs uppercase tracking-widest text-brand underline underline-offset-4 hover:text-gold transition-colors">{ui.sizeGuide}</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v) => (
                  <button 
                    key={v._id}
                    onClick={() => setSelectedVariant(v)}
                    className={`border px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${selectedVariant?._id === v._id ? 'border-brand bg-brand text-white' : 'border-gray-300 text-gray-700 hover:border-gray-500'}`}
                  >
                    {v.size} - {v.color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-10 rounded-[30px] border border-[#eadcc8] bg-white/92 p-4 shadow-[0_18px_40px_rgba(66,42,18,0.07)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Quantity Selector */}
            <div className="flex w-full items-center justify-between rounded-[1.35rem] border border-[#d9c8b4] bg-[#fffaf4] sm:w-fit sm:justify-start sm:rounded-full">
              <button onClick={decrement} className="px-5 py-3 text-[#6d563e] transition-colors hover:bg-[#f5eadc]">-</button>
              <span className="min-w-12 px-4 py-3 text-center font-medium text-[#2f2117]">{quantity}</span>
              <button onClick={increment} className="px-5 py-3 text-[#6d563e] transition-colors hover:bg-[#f5eadc]">+</button>
            </div>
            
            {/* Add to Cart */}
            <button disabled={!canPurchase} onClick={handleAddToCart} className={`flex-1 rounded-[1.35rem] px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] transition-colors duration-300 border whitespace-nowrap sm:rounded-full md:px-8 ${canPurchase ? 'bg-[#2f2117] text-[#f8efe2] hover:bg-[#8b5e34] border-[#2f2117]' : 'bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed'}`}>
              {canPurchase ? (t.addToCart || 'Add to Cart') : stockMessages.backSoon}
            </button>
            
            <a 
              href={`https://wa.me/905057777723?text=${encodeURIComponent(ui.orderMessage)}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-[#25D366] px-4 py-4 text-sm font-medium uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-[#128C7E] sm:w-auto sm:rounded-full md:px-6 whitespace-nowrap"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766 0 1.015.266 2.008.772 2.88l-1.01 3.692 3.774-.99a5.727 5.727 0 002.231.45h.001c3.18 0 5.767-2.586 5.767-5.766 0-3.181-2.588-5.766-5.767-5.766zm0 9.773c-.859 0-1.7-.231-2.435-.668l-.174-.103-1.808.474.484-1.763-.113-.18a4.8 4.8 0 01-.734-2.569c0-2.656 2.16-4.815 4.818-4.815 2.656 0 4.816 2.158 4.816 4.815-.001 2.657-2.16 4.815-4.816 4.815zm2.636-3.606c-.144-.072-.852-.42-984-.468-.132-.048-.228-.072-.324.072s-.372.468-.456.564-.168.108-.312.036-.607-.224-1.157-.714c-.428-.382-.716-.854-.8-1.022-.084-.168-.009-.259.063-.331.065-.065.144-.168.216-.252.072-.084.096-.144.144-.24a.455.455 0 00-.024-.432c-.048-.096-.324-.78-.444-1.068-.117-.281-.236-.243-.324-.248h-.276c-.096 0-.252.036-.384.18s-.504.492-.504 1.2.516 1.392.588 1.488c.072.096 1.016 1.55 2.46 2.174.344.148.613.237.822.303.345.11.659.094.907.057.279-.042.852-.348.972-.684.12-.336.12-.624.084-.684-.038-.059-.133-.083-.277-.155z"></path></svg>
              {ui.orderViaWhatsapp}
            </a>
          </div>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-col gap-4 mb-10 text-start">
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-4 rounded-sm">
              <svg className="w-8 h-8 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-brand">{content?.productPage?.authenticText?.[language] || trustCopy.authenticTitle}</h4>
                <p className="text-xs text-gray-500 mt-1">{content?.productPage?.authenticDesc?.[language] || trustCopy.authenticDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-[#F5EFE6]/70 border border-brand/10 p-4 rounded-sm">
              <svg className="w-8 h-8 text-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
              <div>
                <h4 className="text-sm font-bold text-brand uppercase tracking-widest">{content?.productPage?.shippingText?.[language] || trustCopy.shippingTitle}</h4>
                <p className="text-xs text-gray-600 mt-1">{content?.productPage?.shippingDesc?.[language] || trustCopy.shippingDesc}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 text-sm text-start">
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium mb-2 uppercase tracking-wide">{content?.productPage?.featuresText?.[language] || t.features || trustCopy.featuresTitle}</h4>
              <p className="text-gray-500">{content?.productPage?.featuresDesc?.[language] || trustCopy.featuresDesc}</p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium mb-2 uppercase tracking-wide">{content?.productPage?.deliveryText?.[language] || t.deliveryReturns || trustCopy.deliveryTitle}</h4>
              <p className="text-gray-500">{content?.productPage?.deliveryDesc?.[language] || trustCopy.deliveryDesc}</p>
            </div>
          </div>
        </div>
        
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 border-t border-gray-100 pt-14 sm:mt-24 sm:pt-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif text-brand mb-4">{ui.related}</h2>
            <div className="w-12 h-[2px] bg-gold mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-8">
            {relatedProducts.map(prod => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed Section */}
      {recentItems && recentItems.length > 0 && (
        <div className="mt-20 border-t border-gray-100 pt-14 sm:mt-24 sm:pt-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif text-brand mb-4">{ui.recentlyViewed}</h2>
            <div className="w-12 h-[2px] bg-gold mx-auto"></div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-8 custom-scrollbar sm:gap-6">
            {recentItems.map(item => (
              <div key={item._id} onClick={() => { window.scrollTo(0, 0); navigate(`/product/${item.slug || item._id}`); }} className="group cursor-pointer min-w-[180px] md:min-w-[250px] flex flex-col">
                 <div className="aspect-square bg-gray-100 mb-4 overflow-hidden relative rounded-sm">
                    <img loading="lazy" src={resolveAssetUrl(item.images?.[0]?.url || item.images?.[0])} alt={item.name?.en} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                 </div>
                 <h3 className="font-serif text-brand text-sm md:text-md group-hover:text-gold transition-colors truncate">{item.name?.en || item.name}</h3>
                 <p className="text-brand font-bold mt-1 uppercase text-sm">{formatPrice(item.salePrice || item.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-24 border-t border-gray-100 pt-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-brand mb-4">{ui.reviews}</h2>
          <div className="w-12 h-[2px] bg-gold mx-auto"></div>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {reviews.length > 0 ? reviews.map(review => (
            <div key={review._id} className="bg-white border border-gray-100 p-6 rounded-sm shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand text-beige rounded-full flex justify-center items-center font-serif text-lg">
                    {review.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-medium text-brand text-sm">{review.user?.name || ui.verifiedBuyer}</h4>
                    <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
            </div>
          )) : (
            <p className="text-center text-gray-500 text-sm">{ui.noReviews}</p>
          )}

          {isAuthenticated ? (
            <div className="mt-12 bg-white border border-gray-200 p-8 shadow-sm">
              <h3 className="text-xl font-serif text-brand mb-6">{ui.writeReview}</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{ui.rating}</label>
                  <select value={reviewForm.rating} onChange={(e) => setReviewForm({...reviewForm, rating: e.target.value})} className="border border-gray-300 p-2 w-full max-w-xs focus:border-brand focus:outline-none">
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Terrible</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{ui.yourReview}</label>
                  <textarea required value={reviewForm.comment} onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})} rows="4" className="w-full border border-gray-300 p-3 text-sm focus:border-brand focus:outline-none" placeholder={ui.reviewPlaceholder}></textarea>
                </div>
                <button type="submit" disabled={reviewSubmitting} className="bg-brand text-beige px-6 py-2 uppercase tracking-widest text-xs font-bold hover:bg-gold transition-colors disabled:opacity-50">
                  {reviewSubmitting ? ui.submitting : ui.submitReview}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center mt-8">
              <Link to="/login" className="text-brand underline hover:text-gold text-sm font-medium">{ui.loginToReview}</Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsSizeGuideOpen(false)}>
          <div className="bg-white p-8 max-w-2xl w-full relative shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsSizeGuideOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black text-3xl focus:outline-none">&times;</button>
            <h3 className="text-2xl font-serif text-brand mb-6 text-center">{ui.fitGuide}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse border border-gray-100">
                <thead>
                  <tr className="bg-[#F5EFE6] uppercase tracking-widest text-xs text-brand">
                    <th className="p-4 border border-gray-100">{ui.size}</th>
                    <th className="p-4 border border-gray-100">{ui.dimensionsCm}</th>
                    <th className="p-4 border border-gray-100">{ui.strapDrop}</th>
                    <th className="p-4 border border-gray-100">{ui.fit}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="hover:bg-gray-50"><td className="p-4 border border-gray-100 font-bold text-brand">Mini / Micro</td><td className="p-4 border border-gray-100">18 x 12 x 6</td><td className="p-4 border border-gray-100">50-55</td><td className="p-4 border border-gray-100">Phone, Cards, Keys</td></tr>
                  <tr className="hover:bg-gray-50"><td className="p-4 border border-gray-100 font-bold text-brand">Medium</td><td className="p-4 border border-gray-100">25 x 16 x 8</td><td className="p-4 border border-gray-100">45-50</td><td className="p-4 border border-gray-100">Everyday essentials</td></tr>
                  <tr className="hover:bg-gray-50"><td className="p-4 border border-gray-100 font-bold text-brand">Large / Tote</td><td className="p-4 border border-gray-100">32 x 22 x 12</td><td className="p-4 border border-gray-100">30-40</td><td className="p-4 border border-gray-100">Laptop, Makeup, Essentials</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-center text-gray-400 mt-6 mt-4 italic">{ui.measurementsNote}</p>
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e6d8c6] bg-white/96 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_40px_rgba(66,42,18,0.12)] backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[10px] uppercase tracking-[0.16em] text-[#8a6948]">{name}</div>
            <div className="mt-1 text-base font-semibold text-[#2f2117]">{formatPrice(currentPrice)}</div>
          </div>
          <button
            disabled={!canPurchase}
            onClick={handleAddToCart}
            className={`rounded-full px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] ${
              canPurchase ? 'bg-[#2f2117] text-[#f8efe2]' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {canPurchase ? (t.addToCart || 'Add to Cart') : 'Soon'}
          </button>
          <a
            href={`https://wa.me/905057777723?text=${encodeURIComponent(ui.orderMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[#25D366] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
          >
            WA
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

