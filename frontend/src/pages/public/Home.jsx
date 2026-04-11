import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { backendOrigin } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import SkeletonCard from '../../components/shared/SkeletonCard';
import AnimatedCounter from '../../components/shared/AnimatedCounter';
import { productService } from '../../services/productService';
import { contentService } from '../../services/contentService';
import { categoryService } from '../../services/categoryService';
import useTranslation from '../../hooks/useTranslation';
import useLangStore from '../../store/useLangStore';
import { resolveProductImage } from '../../utils/assets';

const Home = () => {
  const { language } = useLangStore();
  const { t } = useTranslation('home');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentCopy, setCurrentCopy] = useState(0);
  const [visible, setVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  const homeCopy = {
    en: {
      collectionLabel: 'Melora Signature Collection',
      viewCollection: 'Explore The Collection',
      shopNow: 'Discover The Edit',
      categoryEyebrow: 'Curated Houses',
      categoryTitle: 'Shop by Category',
      featuredTitle: 'Featured Arrivals',
      noProducts: 'The collection is being refreshed. New icons will appear shortly.',
      viewAllProducts: 'Explore All Pieces',
      explore: 'Explore',
      designs: 'Signature Pieces',
      customers: 'Private Clients',
      countries: 'Global Destinations'
    },
    ar: {
      collectionLabel: 'تشكيلة ميلورا الموقعة',
      viewCollection: 'اكتشفي التشكيلة',
      shopNow: 'اكتشفي المختارات',
      categoryEyebrow: 'اختيارات منتقاة',
      categoryTitle: 'تسوقي حسب الفئة',
      featuredTitle: 'أبرز الوصولات',
      noProducts: 'نقوم الآن بتحديث التشكيلة. ستظهر القطع الجديدة قريبًا.',
      viewAllProducts: 'استعرضي جميع القطع',
      explore: 'استكشفي',
      designs: 'قطع موقعة',
      customers: 'عميلات مميزات',
      countries: 'وجهات حول العالم'
    },
    tr: {
      collectionLabel: 'Melora Imza Koleksiyonu',
      viewCollection: 'Koleksiyonu Kesfet',
      shopNow: 'Secili Parcalari Gor',
      categoryEyebrow: 'Ozenle Secildi',
      categoryTitle: 'Kategoriye Gore Kesfet',
      featuredTitle: 'One Cikan Yeni Parcalar',
      noProducts: 'Koleksiyon yenileniyor. Yeni seckiler cok yakinda burada olacak.',
      viewAllProducts: 'Tum Parcalari Kesfet',
      explore: 'Kesfet',
      designs: 'Imza Parca',
      customers: 'Seckin Musteri',
      countries: 'Ulasilan Ulke'
    }
  };

  const copy = homeCopy[language] || homeCopy.en;
  if (language === 'ar') {
    Object.assign(copy, {
      collectionLabel: 'تشكيلة ميلورا الموقعة',
      viewCollection: 'اكتشفي التشكيلة',
      shopNow: 'اكتشفي المختارات',
      categoryEyebrow: 'اختيارات منتقاة',
      categoryTitle: 'تسوقي حسب الفئة',
      featuredTitle: 'أبرز الوصولات',
      noProducts: 'نقوم الآن بتحديث التشكيلة. ستظهر القطع الجديدة قريبًا.',
      viewAllProducts: 'استعرضي جميع القطع',
      explore: 'استكشفي',
      designs: 'قطع موقعة',
      customers: 'عميلات مميزات',
      countries: 'وجهات حول العالم',
    });
  }

  useEffect(() => {
    const seo = {
      en: {
        title: 'Melora Moda | Women\'s Bags and Accessories',
        description: 'Shop Melora Moda for elegant women\'s bags and curated accessories with a refined shopping experience.',
      },
      ar: {
        title: 'Melora Moda | حقائب واكسسوارات نسائية',
        description: 'تسوقي من Melora Moda تشكيلة حقائب واكسسوارات نسائية أنيقة ومنتجات مختارة بعناية.',
      },
      tr: {
        title: 'Melora Moda | Kadin Canta ve Aksesuar',
        description: 'Melora Moda ile secilmis kadin canta ve aksesuar koleksiyonunu kesfedin.',
      },
    }[language] || {
      title: 'Melora Moda | Women\'s Bags and Accessories',
      description: 'Shop Melora Moda for elegant women\'s bags and curated accessories with a refined shopping experience.',
    };

    document.title = seo.title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seo.description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://meloramoda.com/');
  }, [language]);

  const slides = [
    {
      lang: 'EN',
      dir: 'ltr',
      title: 'Crafted To Be Remembered.',
      sub: 'Melora handbags are shaped for women who move with quiet confidence, rare taste, and lasting presence.'
    },
    {
      lang: 'AR',
      dir: 'rtl',
      title: 'صُمِّمت لتُرى. وتُتذكَر.',
      sub: 'حقائب ميلورا خُلقت لامرأة تعرف قيمة الحضور الهادئ، والذوق الرفيع، والانطباع الذي لا يبهت.'
    },
    {
      lang: 'TR',
      dir: 'ltr',
      title: 'Gorulmek Icin Tasarlandi.',
      sub: 'Melora cantalari; sakin bir guc, seckin bir zevk ve hatirda kalan bir durus icin tasarlandi.'
    }
  ];

  const categoryFallbackImages = {
    classic: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
    mini: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600',
    shoulder: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
    evening: 'https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=600',
    glasses: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600',
    sunglasses: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600',
    eyewear: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600',
    perfumes: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',
    perfume: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',
    watches: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600'
  };

  const getCategoryDisplayName = (category) => {
    const slug = String(category?.slug || '').toLowerCase();
    if (['glasses', 'sunglasses', 'eyewear'].includes(slug)) {
      return {
        en: 'Sunglasses',
        ar: 'نظارات شمسية',
        tr: 'Gunes Gozlukleri',
      }[language] || 'Sunglasses';
    }

    return category?.name?.[language] || category?.name?.en || 'Category';
  };

  const resolveAssetUrl = (value) => {
    if (!value) return 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200';
    if (typeof value === 'object') return resolveAssetUrl(value.url);
    if (typeof value === 'string' && value.includes('\\uploads\\')) {
      return backendOrigin + value.slice(value.lastIndexOf('\\uploads\\')).replace(/\\/g, '/');
    }
    if (typeof value === 'string' && value.startsWith('/uploads/')) {
      return backendOrigin + value;
    }
    return value;
  };

  const normalizedCategories = categories.filter((category) => {
    const slug = String(category?.slug || '').toLowerCase();
    if (slug !== 'glasses') return true;
    return !categories.some((entry) => String(entry?.slug || '').toLowerCase() === 'sunglasses');
  });

  const categoryCards = normalizedCategories.map((category) => {
    const forcedCategoryImage = categoryFallbackImages[category?.slug];
    const resolvedImage = forcedCategoryImage || (category?.image ? resolveAssetUrl(category.image) : '');
    return {
      name: getCategoryDisplayName(category),
      img: resolvedImage || categoryFallbackImages.classic,
      link: `/shop?category=${category?._id || category?.slug}`,
      key: category?._id || category?.slug || category?.name?.en
    };
  });

  const getHeroTitle = (slide) => {
    const rawTitle = content?.heroBanner?.title?.[slide.lang.toLowerCase()];
    const normalized = (rawTitle || '').trim().toLowerCase();
    const weakTitles = [
      'own the room. leave the signature.',
      'sahneyi sen al. izini birak.',
      'welcome to melora',
      'melora exclusive collection',
      'احملي الحضور. واتركي توقيعك.',
      'ساحنيي سن ال. إزيني بيراك.'
    ];

    if (!rawTitle || weakTitles.includes(normalized)) {
      return slide.title;
    }

    return rawTitle;
  };

  const getHeroSubtitle = (slide) => {
    const rawSubtitle = content?.heroBanner?.subtitle?.[slide.lang.toLowerCase()];
    const normalized = (rawSubtitle || '').trim().toLowerCase();
    const weakSubtitles = [
      'redefining luxury.',
      'luxury redefined.',
      'yeniden tanimlanan luks.',
      'luksu yeniden tanimlandi.',
      'إعادة تعريف الفخامة.',
      'الفخامة أُعيد تعريفها.',
      'إعادة تعريف الفخامة.'
    ];

    if (!rawSubtitle || weakSubtitles.includes(normalized)) {
      return slide.sub;
    }

    return rawSubtitle;
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [prodRes, contentRes, categoryRes] = await Promise.all([
          productService.getProducts({ limit: 4 }),
          contentService.getContent(),
          categoryService.getCategories()
        ]);
        setFeaturedProducts(prodRes.data?.data || prodRes.data || []);
        setContent(contentRes.data);
        setCategories(categoryRes?.data || []);
      } catch (error) {
        console.error('Error fetching home products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('animate-fade-in-up', 'opacity-100');
        entry.target.classList.remove('opacity-0', 'translate-y-10');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.observe-fade').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [featuredProducts]);

  useEffect(() => {
    if (featuredProducts.length <= 1) return undefined;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredProducts]);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentCopy((prev) => (prev + 1) % slides.length);
        setVisible(true);
      }, 500);
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleLangClick = (idx) => {
    if (idx === currentCopy || !visible) return;
    setVisible(false);
    setTimeout(() => {
      setCurrentCopy(idx);
      setVisible(true);
    }, 500);
  };

  return (
    <div className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      <section className="relative min-h-[88vh] w-full overflow-hidden bg-[linear-gradient(135deg,#f8efe5_0%,#fffaf4_48%,#f2e5d5_100%)]">
        <div className="mx-auto grid min-h-[88vh] max-w-7xl grid-cols-1 md:min-h-screen md:grid-cols-2">
          <div className="relative order-2 flex flex-col justify-center px-4 pb-12 pt-6 sm:px-8 md:order-1 md:px-16 md:pb-16 md:pt-24 lg:px-24">
            <div className="absolute left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
              <img loading="lazy" src="/logo.png" alt="Watermark" className="w-full h-auto object-contain" />
            </div>
            <div className="relative z-20 max-w-xl">
              <div className="rounded-[30px] border border-white/70 bg-white/58 px-5 py-6 shadow-[0_20px_60px_rgba(77,47,19,0.1)] backdrop-blur-md sm:px-7 sm:py-8 md:border-0 md:bg-transparent md:p-0 md:shadow-none" style={{ minHeight: '260px', opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease', direction: slides[currentCopy].dir, textAlign: slides[currentCopy].dir === 'rtl' ? 'right' : 'left' }}>
                <span className="mb-4 block text-[11px] uppercase tracking-[0.28em] text-[#8b5e34] sm:mb-6 md:text-sm">{copy.collectionLabel}</span>
                <h1 className="mb-4 font-serif text-[2rem] leading-[1.08] text-[#2f1f15] sm:text-[2.5rem] md:mb-6 md:text-5xl lg:text-6xl">
                  {getHeroTitle(slides[currentCopy])}
                </h1>
                <p className="max-w-md text-sm leading-7 text-[#6e5b48] md:text-base">
                  {getHeroSubtitle(slides[currentCopy])}
                </p>
              </div>

              <div className="mb-6 mt-5 inline-flex items-center gap-2 rounded-full border border-[#e3cfb9] bg-white/70 px-4 py-2 text-xs font-bold tracking-widest shadow-sm md:mb-10" dir="ltr">
                {slides.map((slide, idx) => (
                  <React.Fragment key={slide.lang}>
                    <button type="button" onClick={() => handleLangClick(idx)} className={`${currentCopy === idx ? 'text-[#8b5e34]' : 'text-[#2f1f15]/45 hover:text-[#2f1f15]'}`}>
                      {slide.lang}
                    </button>
                    {idx < slides.length - 1 && <span className="text-[#2f1f15]/25">•</span>}
                  </React.Fragment>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-row sm:gap-4">
                <Link to="/shop" className="w-full rounded-[1.35rem] border border-[#2f1f15] bg-[#2f1f15] px-8 py-4 text-center text-xs font-bold uppercase tracking-[0.24em] text-[#fffaf4] shadow-[0_16px_30px_rgba(47,31,21,0.14)] transition-colors duration-300 hover:bg-[#8b5e34] hover:border-[#8b5e34] dark:border-gold dark:bg-gold dark:text-[#120c08] dark:hover:bg-[#e3c08a] sm:w-auto">
                  {content?.heroBanner?.buttonText?.[language] || copy.shopNow || t.shopNow || 'Shop Now'}
                </Link>
                <Link to="/categories" className="w-full rounded-[1.35rem] border border-[#2f1f15] bg-white/65 px-8 py-4 text-center text-xs font-bold uppercase tracking-[0.24em] text-[#2f1f15] transition-colors duration-300 hover:bg-[#2f1f15] hover:text-[#fffaf4] dark:border-[var(--border-color)] dark:text-[var(--text-primary)] dark:hover:bg-[var(--bg-card)] dark:hover:text-[var(--text-primary)] sm:w-auto">
                  {copy.viewCollection}
                </Link>
              </div>
            </div>
          </div>

          <div className="relative order-1 min-h-[38vh] overflow-hidden bg-[#e9d7c2]/25 md:order-2 md:mt-0 md:min-h-screen">
            <div className="absolute inset-0 will-change-transform" style={{ transform: `translateY(${scrollY * 0.16}px)` }}>
              {featuredProducts.length > 0 ? featuredProducts.map((prod, idx) => (
                <div key={prod._id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === idx ? 'opacity-100' : 'opacity-0'}`}>
                  <img
                    loading="lazy"
                    src={resolveProductImage(prod, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200')}
                    alt={prod.name?.en || 'Featured Luxury Bag'}
                    className="h-full w-full object-cover object-center"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200'; }}
                  />
                </div>
              )) : (
                <img loading="lazy" src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200" alt="Luxury Bag" className="h-full w-full object-cover object-center" />
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f8efe5] to-transparent md:hidden" />

            {featuredProducts.length > 1 && (
              <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-4 md:bottom-12">
                {featuredProducts.map((prod, idx) => (
                  <button key={prod._id || idx} onClick={() => setCurrentSlide(idx)} className={`rounded-full border border-[#2f1f15]/15 shadow-[0_0_6px_rgba(0,0,0,0.35)] transition-all ${currentSlide === idx ? 'h-4 w-4 bg-[#8b5e34]' : 'h-3 w-3 bg-white hover:bg-[#d7b690]'}`} aria-label={`Go to slide ${idx + 1}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3 sm:gap-6 lg:gap-24">
            <AnimatedCounter target={500} text={copy.designs} />
            <AnimatedCounter target={50000} text={copy.customers} />
            <AnimatedCounter target={15} text={copy.countries} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-16 text-center observe-fade opacity-0 translate-y-10 transition-all duration-700">
          <span className="mb-3 block text-xs font-medium uppercase tracking-widest text-brand">{copy.categoryEyebrow}</span>
          <h2 className="mb-6 font-serif text-3xl text-brand md:text-4xl">{copy.categoryTitle}</h2>
          <div className="mx-auto h-[2px] w-16 bg-gold"></div>
        </div>
        <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4">
          {categoryCards.map((cat, idx) => (
            <Link to={cat.link} key={cat.key} className="group relative block h-[300px] min-w-[240px] snap-start overflow-hidden rounded-[28px] border border-[#eadcc8] shadow-[0_18px_40px_rgba(71,45,20,0.08)] transition-shadow duration-500 hover:shadow-2xl observe-fade opacity-0 translate-y-10 md:h-[420px] md:min-w-0 md:rounded-sm md:border-0" style={{ transitionDelay: `${idx * 100}ms` }}>
              <img loading="lazy" src={cat.img} alt={cat.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/25 transition-colors duration-500 group-hover:bg-black/50"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <h3 className="mb-3 font-serif text-2xl text-white drop-shadow-md">{cat.name}</h3>
                <span className="translate-y-4 border-b border-transparent pb-1 text-[10px] font-bold uppercase tracking-widest text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:border-white group-hover:opacity-100">{copy.explore}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t border-brand/5 px-4 py-16 sm:px-6 sm:py-28 lg:px-8">
        <div className="mb-20 text-center observe-fade opacity-0 translate-y-10 transition-all duration-700">
          <h2 className="mb-6 font-serif text-3xl text-brand md:text-4xl">{content?.homeSections?.featured?.[language] || copy.featuredTitle || t.featured || 'Featured Arrivals'}</h2>
          <div className="mx-auto h-[2px] w-16 bg-gold"></div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {featuredProducts.length > 0 ? featuredProducts.map((product, i) => (
              <div key={product._id} className="observe-fade opacity-0 translate-y-10 transition-all duration-700" style={{ transitionDelay: `${i * 100}ms` }}>
                <ProductCard product={product} />
              </div>
            )) : (
              <p className="col-span-full text-center text-gray-500">{copy.noProducts}</p>
            )}
          </div>
        )}

        <div className="mt-20 text-center observe-fade opacity-0 translate-y-10 transition-all duration-700">
          <Link to="/shop" className="inline-block border border-brand bg-white px-10 py-4 text-center text-xs font-bold uppercase tracking-widest text-brand shadow-sm transition-colors duration-500 hover:bg-brand hover:text-[#fffaf4] hover:shadow-xl dark:border-[var(--border-color)] dark:bg-[var(--bg-card)] dark:text-[var(--text-primary)] dark:hover:bg-gold dark:hover:text-[#120c08]">
            {copy.viewAllProducts}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

