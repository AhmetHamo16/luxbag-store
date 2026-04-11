import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/product/ProductCard';
import Loader from '../../components/shared/Loader';
import { backendOrigin } from '../../services/api';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import useTranslation from '../../hooks/useTranslation';
import { Link, useLocation } from 'react-router-dom';

const Shop = ({ categorySlugs = null, seo = null, heroCopy = null, canonicalPath = '/shop' }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [sortOption, setSortOption] = useState('-createdAt');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterTrigger, setFilterTrigger] = useState(0);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  const { t, language } = useTranslation('shop');
  const location = useLocation();
  
  const [dbCategories, setDbCategories] = useState([]);
  const collectionBar = [
    {
      key: 'shop',
      href: '/shop',
      en: 'All Products',
      ar: 'كل المنتجات',
      tr: 'Tum Urunler',
    },
    {
      key: 'bags',
      href: '/bags',
      en: 'Bags',
      ar: 'الحقائب',
      tr: 'Cantalar',
    },
    {
      key: 'watches',
      href: '/watches',
      en: 'Watches',
      ar: 'الساعات',
      tr: 'Saatler',
    },
    {
      key: 'perfumes',
      href: '/perfumes',
      en: 'Perfumes',
      ar: 'العطور',
      tr: 'Parfumler',
    },
    {
      key: 'glasses',
      href: '/glasses',
      en: 'Sunglasses',
      ar: 'النظارات',
      tr: 'Gunes Gozlukleri',
    },
  ];
  const collectionCards = [
    {
      key: 'bags',
      href: '/bags',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
      en: { title: 'Bags', subtitle: 'Signature silhouettes for everyday elegance' },
      ar: { title: 'الحقائب', subtitle: 'تصاميم أنيقة مختارة للإطلالات اليومية الراقية' },
      tr: { title: 'Cantalar', subtitle: 'Gunluk siklik icin secilen zarif tasarimlar' },
    },
    {
      key: 'watches',
      href: '/watches',
      image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
      en: { title: 'Watches', subtitle: 'Refined timepieces with a polished finish' },
      ar: { title: 'الساعات', subtitle: 'لمسات فاخرة بتفاصيل هادئة وأنيقة' },
      tr: { title: 'Saatler', subtitle: 'Zarif ve seckin detaylara sahip modeller' },
    },
    {
      key: 'perfumes',
      href: '/perfumes',
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
      en: { title: 'Perfumes', subtitle: 'Soft notes curated for memorable presence' },
      ar: { title: 'العطور', subtitle: 'روائح منتقاة لحضور أنثوي يترك أثرًا' },
      tr: { title: 'Parfumler', subtitle: 'Kalici ve ozenle secilen yumusak notalar' },
    },
    {
      key: 'glasses',
      href: '/glasses',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80',
      en: { title: 'Sunglasses', subtitle: 'Refined shades with a modern statement' },
      ar: { title: 'النظارات', subtitle: 'إطارات عصرية بلمسة أنيقة وواضحة' },
      tr: { title: 'Gunes Gozlukleri', subtitle: 'Sik gorunum icin modern ve zarif secimler' },
    },
  ];
  const trustBadges = {
    en: ['Curated pieces', 'Fast support', 'Elegant daily edits'],
    ar: ['قطع مختارة بعناية', 'دعم سريع', 'أناقة يومية راقية'],
    tr: ['Ozenle secilen urunler', 'Hizli destek', 'Gunluk zarif secimler'],
  };

  collectionBar[0].ar = 'كل المنتجات';
  collectionBar[1].ar = 'الحقائب';
  collectionBar[2].ar = 'الساعات';
  collectionBar[3].ar = 'العطور';
  collectionBar[4].ar = 'النظارات';
  collectionBar[0].tr = 'Tum Urunler';
  collectionBar[1].tr = 'Cantalar';
  collectionBar[3].tr = 'Parfumler';
  collectionBar[4].tr = 'Gunes Gozlukleri';
  collectionCards[0].ar = { title: 'الحقائب', subtitle: 'تصاميم أنيقة مختارة للإطلالات اليومية الراقية' };
  collectionCards[1].ar = { title: 'الساعات', subtitle: 'لمسات فاخرة بتفاصيل هادئة وأنيقة' };
  collectionCards[2].ar = { title: 'العطور', subtitle: 'روائح منتقاة لحضور أنثوي يترك أثرًا جميلًا' };
  collectionCards[3].ar = { title: 'النظارات', subtitle: 'إطارات عصرية بلمسة أنيقة وواضحة' };
  collectionCards[0].tr = { title: 'Cantalar', subtitle: 'Gunluk siklik icin secilen zarif tasarimlar' };
  collectionCards[1].tr = { title: 'Saatler', subtitle: 'Zarif ve seckin detaylara sahip modeller' };
  collectionCards[2].tr = { title: 'Parfumler', subtitle: 'Kalici ve ozenle secilen yumusak notalar' };
  collectionCards[3].tr = { title: 'Gunes Gozlukleri', subtitle: 'Sik gorunum icin modern ve zarif secimler' };
  trustBadges.ar = ['قطع مختارة بعناية', 'دعم سريع', 'أناقة يومية راقية'];

  collectionBar[4].ar = 'نظارات شمسية';
  collectionCards[3].ar = { title: 'نظارات شمسية', subtitle: 'تصاميم أنيقة تحمي حضورك وتكمل إطلالتك' };

  useEffect(() => {
    const defaultSeo = {
      en: {
        title: 'Shop | Melora Moda',
        description: 'Browse Melora Moda bags and accessories by category, price, and latest arrivals.',
      },
      ar: {
        title: 'المتجر | Melora Moda',
        description: 'تصفحي متجر Melora Moda للحقائب والاكسسوارات النسائية حسب الفئة والسعر وأحدث المنتجات.',
      },
      tr: {
        title: 'Magaza | Melora Moda',
        description: 'Melora Moda canta ve aksesuar koleksiyonunu kategoriye ve fiyata gore inceleyin.',
      },
    }[language] || {
      title: 'Shop | Melora Moda',
      description: 'Browse Melora Moda bags and accessories by category, price, and latest arrivals.',
    };

    const seoPayload = seo?.[language] || seo?.en || defaultSeo;

    document.title = seoPayload.title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seoPayload.description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://meloramoda.com${canonicalPath}`);
  }, [language, seo, canonicalPath]);

  const getCategoryName = (category) => {
    if (!category) return 'Unknown';
    if (typeof category === 'string') return category;
    const slug = String(category.slug || '').toLowerCase();
    if (['glasses', 'sunglasses', 'eyewear'].includes(slug)) {
      return {
        en: 'Sunglasses',
        ar: 'نظارات شمسية',
        tr: 'Gunes Gozlukleri',
      }[language] || 'Sunglasses';
    }
    return category.name?.[language] || category.name?.en || category.name || 'Unknown';
  };

  const fetchProductsAndCategories = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts({}),
        categoryService.getCategories()
      ]);
      let fetched = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.data || []);
      
      let categoryRows = Array.isArray(catRes.data) ? catRes.data : (catRes.data?.data || []);

      const hasSunglassesCategory = categoryRows.some(
        (category) => String(category?.slug || '').toLowerCase() === 'sunglasses'
      );

      if (hasSunglassesCategory) {
        categoryRows = categoryRows.filter(
          (category) => String(category?.slug || '').toLowerCase() !== 'glasses'
        );
      }

      if (Array.isArray(categorySlugs) && categorySlugs.length > 0) {
        categoryRows = categoryRows.filter((category) => categorySlugs.includes(category.slug));
        const allowedIds = new Set(categoryRows.map((category) => String(category._id)));
        fetched = fetched.filter((product) => allowedIds.has(String(product.category?._id || product.category)));
      }

      const cats = [{ name: t.allCategories || 'All', value: '' }, ...categoryRows.map(c => ({
        name: getCategoryName(c),
        value: c._id
      }))];
      
      setDbCategories(cats);
      
      // Frontend filtering
      if (activeCategory) {
        fetched = fetched.filter(p => {
          const categoryId = p.category?._id || p.category;
          return String(categoryId) === String(activeCategory);
        });
      }
      if (minPrice) fetched = fetched.filter(p => p.price >= Number(minPrice));
      if (maxPrice) fetched = fetched.filter(p => p.price <= Number(maxPrice));

      if (sortOption === 'price-low') fetched.sort((a,b) => a.price - b.price);
      else if (sortOption === 'price-high') fetched.sort((a,b) => b.price - a.price);
      else fetched.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setProducts(fetched);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, sortOption, filterTrigger, language, categorySlugs]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (!categoryParam) return;

    const matched = dbCategories.find((category) =>
      category.value === categoryParam || category.name?.toLowerCase() === categoryParam.toLowerCase()
    );

    if (matched && matched.value !== activeCategory) {
      setActiveCategory(matched.value);
    }
  }, [location.search, dbCategories, activeCategory]);

  const resolveAssetUrl = (value) => {
    if (!value) return 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900';
    if (typeof value === 'object') return resolveAssetUrl(value.url);
    if (typeof value === 'string' && value.includes('\\uploads\\')) {
      return `${backendOrigin}${value.slice(value.lastIndexOf('\\uploads\\')).replace(/\\/g, '/')}`;
    }
    if (typeof value === 'string' && value.startsWith('/uploads/')) {
      return `${backendOrigin}${value}`;
    }
    return value;
  };

  const heroImages = products.slice(0, 3).map((product) => ({
    id: product._id,
    src: resolveAssetUrl(product.images?.[0]?.url || product.images?.[0]),
    alt: product.name?.[language] || product.name?.en || 'Melora bag'
  }));

  const defaultLuxuryCopy = {
    en: {
      intro: 'A refined edit of signature silhouettes, sculpted textures, and elevated essentials.',
      curation: 'Private Curation',
      refinedFilters: 'Refined Filters',
      precisionSearch: 'Filter with precision',
      countLabel: 'Visible pieces',
    },
    ar: {
      intro: 'تشكيلة منتقاة بعناية من التصاميم المميزة والخامات الراقية والقطع التي تترك أثرًا فاخرًا.',
      curation: 'تشكيلة خاصة',
      refinedFilters: 'فلاتر راقية',
      precisionSearch: 'اختاري بدقة',
      countLabel: 'القطع الظاهرة',
    },
    tr: {
      intro: 'Seckin siluetler, zengin dokular ve guclu bir luks tavri ile hazirlanmis ozel secki.',
      curation: 'Ozel Secki',
      refinedFilters: 'Zarif Filtreler',
      precisionSearch: 'Detayli filtreleme',
      countLabel: 'Gorunen urun',
    }
  }[language] || {
    intro: 'A refined edit of signature silhouettes, sculpted textures, and elevated essentials.',
    curation: 'Private Curation',
    refinedFilters: 'Refined Filters',
    precisionSearch: 'Filter with precision',
    countLabel: 'Visible pieces',
  };

  if (language === 'ar') {
    defaultLuxuryCopy.intro = 'تشكيلة منتقاة بعناية من التصاميم المميزة والخامات الراقية والقطع التي تترك أثرًا فاخرًا.';
    defaultLuxuryCopy.curation = 'تشكيلة خاصة';
    defaultLuxuryCopy.refinedFilters = 'فلاتر راقية';
    defaultLuxuryCopy.precisionSearch = 'اختاري بدقة';
    defaultLuxuryCopy.countLabel = 'القطع الظاهرة';
  }

  const luxuryCopy = {
    ...defaultLuxuryCopy,
    ...(heroCopy?.[language] || heroCopy?.en || {}),
  };
  const trustCopy = trustBadges[language] || trustBadges.en;
  const mobileUi = {
    en: { filters: 'Filters', close: 'Close', apply: 'Apply Filters', clear: 'Reset' },
    ar: { filters: 'الفلاتر', close: 'إغلاق', apply: 'تطبيق الفلاتر', clear: 'إعادة الضبط' },
    tr: { filters: 'Filtreler', close: 'Kapat', apply: 'Filtreleri Uygula', clear: 'Sifirla' },
  }[language] || { filters: 'Filters', close: 'Close', apply: 'Apply Filters', clear: 'Reset' };

  const handleApplyFilters = () => {
    setFilterTrigger((prev) => prev + 1);
    setIsMobileFiltersOpen(false);
  };

  const handleResetFilters = () => {
    setActiveCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortOption('-createdAt');
    setFilterTrigger((prev) => prev + 1);
    setIsMobileFiltersOpen(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f7efe4_0%,#fbf7f1_38%,#ffffff_100%)] text-[var(--text-primary)] transition-colors">
      <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-10">
      
      <div className="mb-10 overflow-hidden rounded-[36px] border border-[#eadcc8] bg-[linear-gradient(135deg,#f8efe5_0%,#fffaf4_45%,#efe1cf_100%)] shadow-[0_25px_60px_rgba(88,54,27,0.09)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
            <span className="mb-5 inline-flex rounded-full border border-[#d9c0a2] bg-white/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8b5e34]">
              {luxuryCopy.curation}
            </span>
            <h1 className="max-w-3xl font-serif text-4xl leading-tight text-[#2c1d12] sm:text-5xl lg:text-6xl">{luxuryCopy.title || t.title}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#6a5848] sm:text-base">
              {luxuryCopy.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-[#e5d5c2] bg-white/80 px-4 py-3 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.25em] text-[#9d7a52]">{luxuryCopy.countLabel}</div>
                <div className="mt-1 text-2xl font-semibold text-[#2c1d12]">{products.length}</div>
              </div>
              <div className="rounded-2xl border border-[#e5d5c2] bg-white/80 px-4 py-3 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.25em] text-[#9d7a52]">{t.categories || 'Categories'}</div>
                <div className="mt-1 text-2xl font-semibold text-[#2c1d12]">{Math.max(dbCategories.length - 1, 0)}</div>
              </div>
            </div>
          </div>
          <div className="relative hidden min-h-[280px] lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),transparent_38%),linear-gradient(180deg,rgba(139,105,20,0.14),rgba(26,14,8,0.04))]"></div>
            <div className="absolute left-10 top-12 h-[300px] w-[280px] overflow-hidden rounded-[36px] border border-white/70 shadow-[0_20px_60px_rgba(65,40,18,0.18)]">
              <img src={heroImages[0]?.src || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900'} alt={heroImages[0]?.alt || 'Melora bag'} className="h-full w-full object-cover" />
            </div>
            <div className="absolute right-12 top-16 h-40 w-40 overflow-hidden rounded-full border border-white/80 shadow-[0_15px_45px_rgba(65,40,18,0.14)]">
              <img src={heroImages[1]?.src || heroImages[0]?.src || 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=900'} alt={heroImages[1]?.alt || 'Melora bag'} className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-12 left-10 h-[145px] w-[320px] overflow-hidden rounded-[32px] border border-white/80 bg-white/30 shadow-[0_20px_50px_rgba(104,67,31,0.12)]">
              <img src={heroImages[2]?.src || heroImages[0]?.src || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900'} alt={heroImages[2]?.alt || 'Melora bag'} className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-x-10 bottom-12 rounded-[28px] border border-[#e9d8c3] bg-white/72 p-6 backdrop-blur-md">
              <div className="text-[10px] uppercase tracking-[0.35em] text-[#9d7a52]">{luxuryCopy.precisionSearch}</div>
              <p className="mt-3 font-serif text-2xl leading-relaxed text-[#2c1d12]">{luxuryCopy.refinedFilters}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        
        {/* Sidebar Filters */}
        <aside className="hidden w-full lg:block lg:w-[310px] lg:flex-shrink-0">
          <div className="space-y-8 rounded-[30px] border border-[#eadcc8] bg-white/88 p-6 shadow-[0_18px_45px_rgba(71,45,20,0.08)] backdrop-blur-md lg:sticky lg:top-28">
            
            {/* Category Filter */}
            <div>
              <h3 className="mb-4 border-b border-[#eadcc8] pb-3 text-lg font-serif tracking-wide text-[#2c1d12]">{t.categories || 'Categories'}</h3>
              <ul className="space-y-2">
                {dbCategories.map(cat => (
                  <li key={cat.value}>
                    <button 
                      onClick={() => setActiveCategory(cat.value)}
                      className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition-all ${activeCategory === cat.value ? 'bg-[#2c1d12] text-[#f8efe2] shadow-sm' : 'text-[#6d5a48] hover:bg-[#f8f0e6] hover:text-[#2c1d12]'}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter Placeholder */}
            <div>
              <h3 className="mb-4 border-b border-[#eadcc8] pb-3 text-lg font-serif tracking-wide text-[#2c1d12]">{t.priceRange}</h3>
              <div className="mb-4 flex items-center space-x-3">
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder={t.min} className="w-full rounded-2xl border border-[#dac7b1] bg-[#fffaf5] p-3 text-sm text-[#2c1d12] outline-none transition-colors focus:border-[#8b5e34]" />
                <span className="text-[#8b5e34]">-</span>
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder={t.max} className="w-full rounded-2xl border border-[#dac7b1] bg-[#fffaf5] p-3 text-sm text-[#2c1d12] outline-none transition-colors focus:border-[#8b5e34]" />
              </div>
              <button onClick={handleApplyFilters} className="w-full rounded-2xl bg-[#2c1d12] py-3 text-sm font-semibold tracking-[0.18em] text-white transition-colors hover:bg-[#8b5e34]">{t.apply}</button>
            </div>

          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="w-full flex-1">
          <div className="-mx-1 mb-6 overflow-x-auto pb-2 md:mx-0 md:overflow-visible md:pb-0">
            <div className="flex min-w-max gap-4 px-1 md:grid md:min-w-0 md:grid-cols-2 xl:grid-cols-4">
            {collectionCards.map((card) => {
              const copy = card[language] || card.en;
              const isActive = location.pathname === card.href;

              return (
                <Link
                  key={card.key}
                  to={card.href}
                  className={`group relative min-w-[260px] overflow-hidden rounded-[28px] border transition-all duration-500 md:min-w-0 ${
                    isActive
                      ? 'border-[#2c1d12] shadow-[0_22px_46px_rgba(44,29,18,0.14)]'
                      : 'border-[#eadcc8] shadow-[0_16px_38px_rgba(71,45,20,0.08)] hover:-translate-y-1 hover:shadow-[0_24px_52px_rgba(71,45,20,0.13)]'
                  }`}
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={card.image}
                      alt={copy.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(25,16,10,0.05),rgba(25,16,10,0.68))]"></div>
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <div className="text-[11px] uppercase tracking-[0.28em] text-white/75">Melora Moda</div>
                      <h3 className="mt-2 font-serif text-2xl">{copy.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/82">{copy.subtitle}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
            </div>
          </div>

          <div className="mb-6 overflow-x-auto rounded-[30px] border border-[#eadcc8] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,241,231,0.92))] p-3 shadow-[0_18px_38px_rgba(71,45,20,0.07)] backdrop-blur-sm">
            <div className="flex min-w-max items-center gap-2">
              {collectionBar.map((section) => {
                const isActive = location.pathname === section.href;
                const label = section[language] || section.en;

                return (
                  <Link
                    key={section.key}
                    to={section.href}
                    className={`rounded-full border px-5 py-3 text-sm font-semibold tracking-[0.08em] transition-all ${
                      isActive
                        ? 'border-[#2c1d12] bg-[#2c1d12] text-[#f8efe2] shadow-[0_10px_24px_rgba(44,29,18,0.18)]'
                        : 'border-[#e6d7c4] bg-white/90 text-[#6d5a48] hover:border-[#d8bea0] hover:bg-[#fbf2e7] hover:text-[#2c1d12]'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            {trustCopy.map((item) => (
              <div
                key={item}
                className="rounded-full border border-[#e4d4c0] bg-white/82 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-[#7a5b3a] shadow-[0_8px_18px_rgba(71,45,20,0.05)] backdrop-blur-sm"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#d8c4ac] bg-white/92 px-4 py-3 text-sm font-semibold tracking-[0.12em] text-[#2c1d12] shadow-[0_12px_26px_rgba(71,45,20,0.08)]"
            >
              {mobileUi.filters}
            </button>
            <div className="rounded-2xl border border-[#eadcc8] bg-white/88 px-4 py-3 text-xs font-semibold tracking-[0.14em] text-[#7a5b3a] shadow-[0_10px_22px_rgba(71,45,20,0.06)]">
              {products.length}
            </div>
          </div>
          
          {/* Top Bar */}
          <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-[#eadcc8] bg-white/88 px-4 py-5 shadow-[0_15px_35px_rgba(71,45,20,0.06)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span className="text-sm font-medium text-[#6d5a48]">{t.showing?.replace('{count}', products.length) || `Showing ${products.length} products`}</span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
              <span className="text-xs uppercase tracking-[0.18em] text-[#8b6b4b] sm:text-sm sm:normal-case sm:tracking-normal">{t.sortBy || 'Sort by:'}</span>
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full rounded-2xl border border-[#dac7b1] bg-[#fffaf5] px-4 py-3 text-sm font-medium text-[#2c1d12] focus:ring-0 cursor-pointer outline-none sm:w-auto sm:py-2"
              >
                <option value="-createdAt">{t.sortNewest || 'Newest'}</option>
                <option value="price-low">{t.sortPriceLow || 'Price: Low to High'}</option>
                <option value="price-high">{t.sortPriceHigh || 'Price: High to Low'}</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {products.length > 0 ? products.map(product => (
                <ProductCard key={product._id} product={product} />
              )) : (
                <div className="col-span-full rounded-[28px] border border-dashed border-[#dac7b1] bg-white/70 px-6 py-16 text-center text-[#7b6651]">
                  {t.noProducts || 'No products found matching your criteria.'}
                </div>
              )}
            </div>
          )}

        </main>

      </div>
      </div>

      <div className={`fixed inset-0 z-[140] bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${isMobileFiltersOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setIsMobileFiltersOpen(false)} />
      <div className={`fixed inset-x-0 bottom-0 z-[150] rounded-t-[30px] border border-[#eadcc8] bg-[#fffaf4] px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 shadow-[0_-18px_50px_rgba(71,45,20,0.16)] transition-transform duration-300 lg:hidden ${isMobileFiltersOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-serif text-[#2c1d12]">{mobileUi.filters}</h3>
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(false)}
            className="rounded-full border border-[#e4d2bc] px-3 py-1 text-xs font-semibold tracking-[0.14em] text-[#7a5b3a]"
          >
            {mobileUi.close}
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto pr-1">
          <div className="mb-6">
            <h3 className="mb-4 border-b border-[#eadcc8] pb-3 text-lg font-serif tracking-wide text-[#2c1d12]">{t.categories || 'Categories'}</h3>
            <ul className="space-y-2">
              {dbCategories.map((cat) => (
                <li key={cat.value}>
                  <button
                    onClick={() => setActiveCategory(cat.value)}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition-all ${activeCategory === cat.value ? 'bg-[#2c1d12] text-[#f8efe2] shadow-sm' : 'text-[#6d5a48] hover:bg-[#f8f0e6] hover:text-[#2c1d12]'}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="mb-4 border-b border-[#eadcc8] pb-3 text-lg font-serif tracking-wide text-[#2c1d12]">{t.priceRange}</h3>
            <div className="mb-4 flex items-center gap-3">
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder={t.min} className="w-full rounded-2xl border border-[#dac7b1] bg-[#fffaf5] p-3 text-sm text-[#2c1d12] outline-none transition-colors focus:border-[#8b5e34]" />
              <span className="text-[#8b5e34]">-</span>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder={t.max} className="w-full rounded-2xl border border-[#dac7b1] bg-[#fffaf5] p-3 text-sm text-[#2c1d12] outline-none transition-colors focus:border-[#8b5e34]" />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleResetFilters}
            className="rounded-2xl border border-[#d8c4ac] bg-white px-4 py-3 text-sm font-semibold tracking-[0.12em] text-[#2c1d12]"
          >
            {mobileUi.clear}
          </button>
          <button
            type="button"
            onClick={handleApplyFilters}
            className="rounded-2xl bg-[#2c1d12] px-4 py-3 text-sm font-semibold tracking-[0.12em] text-[#f8efe2]"
          >
            {mobileUi.apply}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Shop;
