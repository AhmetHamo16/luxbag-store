import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/product/ProductCard';
import Loader from '../../components/shared/Loader';
import { backendOrigin } from '../../services/api';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import useTranslation from '../../hooks/useTranslation';
import { useLocation } from 'react-router-dom';

const Shop = ({ categorySlugs = null, seo = null, heroCopy = null, canonicalPath = '/shop' }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [sortOption, setSortOption] = useState('-createdAt');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterTrigger, setFilterTrigger] = useState(0);
  
  const { t, language } = useTranslation('shop');
  const location = useLocation();
  
  const [dbCategories, setDbCategories] = useState([]);

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

  const luxuryCopy = {
    ...defaultLuxuryCopy,
    ...(heroCopy?.[language] || heroCopy?.en || {}),
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
        <aside className="w-full lg:w-[310px] lg:flex-shrink-0">
          <div className="sticky top-28 space-y-8 rounded-[30px] border border-[#eadcc8] bg-white/88 p-6 shadow-[0_18px_45px_rgba(71,45,20,0.08)] backdrop-blur-md">
            
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
              <button onClick={() => setFilterTrigger(prev => prev + 1)} className="w-full rounded-2xl bg-[#2c1d12] py-3 text-sm font-semibold tracking-[0.18em] text-white transition-colors hover:bg-[#8b5e34]">{t.apply}</button>
            </div>

          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="w-full flex-1">
          
          {/* Top Bar */}
          <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-[#eadcc8] bg-white/88 px-5 py-5 shadow-[0_15px_35px_rgba(71,45,20,0.06)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-[#6d5a48]">{t.showing?.replace('{count}', products.length) || `Showing ${products.length} products`}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-[#8b6b4b]">{t.sortBy || 'Sort by:'}</span>
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="rounded-2xl border border-[#dac7b1] bg-[#fffaf5] px-4 py-2 text-sm font-medium text-[#2c1d12] focus:ring-0 cursor-pointer outline-none"
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
    </div>
  );
};

export default Shop;
