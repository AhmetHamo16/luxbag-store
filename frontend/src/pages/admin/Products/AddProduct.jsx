import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../../../services/productService';
import { categoryService } from '../../../services/categoryService';
import useTranslation from '../../../hooks/useTranslation';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const { t, language } = useTranslation('admin');
  const navigate = useNavigate();
  const currencySymbol = '₺';
  const copy = {
    en: {
      tabs: { general: 'General', specs: 'Specifications', variants: 'Variants & Stock', images: 'Images', seo: 'SEO' },
      basicDetails: 'Basic Details',
      nameEn: 'Name (EN) *',
      nameAr: 'Name (AR)',
      nameTr: 'Name (TR)',
      descEn: 'Description (EN) *',
      descAr: 'Description (AR)',
      descTr: 'Description (TR)',
      category: 'Category *',
      basePrice: 'Base Price',
      salePrice: 'Sale Price',
      costPrice: 'Cost Price',
      select: 'Select...',
      baseSku: 'Base SKU',
      bagType: 'Bag Type',
      general: 'General',
      women: 'Women',
      men: 'Men',
      travel: 'Travel',
      evening: 'Evening',
      backpack: 'Backpack',
      barcode: 'Barcode For POS',
      barcodeHint: 'This barcode will be used directly by the cashier for fast sales and scanner lookup.',
      barcodePlaceholder: 'Use scanner code or generate a new one',
      generateBarcode: 'Generate Barcode',
      publishNow: 'Publish Immediately',
      featureHomepage: 'Feature on Homepage',
      productBadges: 'Product Badges',
      failedAdd: 'Failed to add product',
      requiredName: 'English product name is required.',
      requiredDescription: 'English description is required.',
      requiredPrice: 'Base price is required.',
      requiredCategory: 'Please choose a category.',
    },
    ar: {
      tabs: { general: 'عام', specs: 'المواصفات', variants: 'المتغيرات والمخزون', images: 'الصور', seo: 'السيو' },
      basicDetails: 'البيانات الأساسية',
      nameEn: 'الاسم (EN) *',
      nameAr: 'الاسم (AR)',
      nameTr: 'الاسم (TR)',
      descEn: 'الوصف (EN) *',
      descAr: 'الوصف (AR)',
      descTr: 'الوصف (TR)',
      category: 'الفئة *',
      basePrice: 'السعر الأساسي',
      salePrice: 'سعر التخفيض',
      costPrice: 'سعر التكلفة',
      select: 'اختر...',
      baseSku: 'رمز SKU الأساسي',
      bagType: 'نوع الحقيبة',
      general: 'عام',
      women: 'نسائي',
      men: 'رجالي',
      travel: 'سفر',
      evening: 'سهرة',
      backpack: 'ظهر',
      barcode: 'باركود لنقطة البيع',
      barcodeHint: 'سيُستخدم هذا الباركود مباشرة من قبل الكاشير لتسريع البيع والبحث عبر الماسح.',
      barcodePlaceholder: 'استخدم رمز الماسح أو أنشئ واحدًا جديدًا',
      generateBarcode: 'إنشاء باركود',
      publishNow: 'نشر مباشرة',
      featureHomepage: 'إظهاره في الصفحة الرئيسية',
      productBadges: 'شارات المنتج',
      failedAdd: 'فشل في إضافة المنتج',
      requiredName: 'اسم المنتج بالإنجليزية مطلوب.',
      requiredDescription: 'الوصف بالإنجليزية مطلوب.',
      requiredPrice: 'السعر الأساسي مطلوب.',
      requiredCategory: 'يرجى اختيار الفئة.',
    },
    tr: {
      tabs: { general: 'Genel', specs: 'Ozellikler', variants: 'Varyantlar ve Stok', images: 'Gorseller', seo: 'SEO' },
      basicDetails: 'Temel Bilgiler',
      nameEn: 'Ad (EN) *',
      nameAr: 'Ad (AR)',
      nameTr: 'Ad (TR)',
      descEn: 'Aciklama (EN) *',
      descAr: 'Aciklama (AR)',
      descTr: 'Aciklama (TR)',
      category: 'Kategori *',
      basePrice: 'Temel Fiyat',
      salePrice: 'Indirimli Fiyat',
      costPrice: 'Maliyet Fiyati',
      select: 'Sec...',
      baseSku: 'Temel SKU',
      bagType: 'Canta Turu',
      general: 'Genel',
      women: 'Kadin',
      men: 'Erkek',
      travel: 'Seyahat',
      evening: 'Gece',
      backpack: 'Sirt Cantasi',
      barcode: 'POS Icin Barkod',
      barcodeHint: 'Bu barkod, kasiyer tarafinda hizli satis ve tarayici aramasi icin dogrudan kullanilacaktir.',
      barcodePlaceholder: 'Tarayici kodunu kullanin veya yeni bir tane olusturun',
      generateBarcode: 'Barkod Uret',
      publishNow: 'Hemen Yayinla',
      featureHomepage: 'Ana sayfada one cikar',
      productBadges: 'Urun Rozetleri',
      failedAdd: 'Urun eklenemedi',
      requiredName: 'Ingilizce urun adi gereklidir.',
      requiredDescription: 'Ingilizce aciklama gereklidir.',
      requiredPrice: 'Temel fiyat gereklidir.',
      requiredCategory: 'Lutfen bir kategori secin.',
    },
  }[language] || {
    tabs: { general: 'General', specs: 'Specifications', variants: 'Variants & Stock', images: 'Images', seo: 'SEO' },
    basicDetails: 'Basic Details',
    nameEn: 'Name (EN) *',
    nameAr: 'Name (AR)',
    nameTr: 'Name (TR)',
    descEn: 'Description (EN) *',
    descAr: 'Description (AR)',
    descTr: 'Description (TR)',
    category: 'Category *',
    basePrice: 'Base Price',
    salePrice: 'Sale Price',
    costPrice: 'Cost Price',
    select: 'Select...',
    baseSku: 'Base SKU',
    bagType: 'Bag Type',
    general: 'General',
    women: 'Women',
    men: 'Men',
    travel: 'Travel',
    evening: 'Evening',
    backpack: 'Backpack',
    barcode: 'Barcode For POS',
    barcodeHint: 'This barcode will be used directly by the cashier for fast sales and scanner lookup.',
    barcodePlaceholder: 'Use scanner code or generate a new one',
    generateBarcode: 'Generate Barcode',
    publishNow: 'Publish Immediately',
    featureHomepage: 'Feature on Homepage',
    productBadges: 'Product Badges',
    failedAdd: 'Failed to add product',
    requiredName: 'English product name is required.',
    requiredDescription: 'English description is required.',
    requiredPrice: 'Base price is required.',
    requiredCategory: 'Please choose a category.',
  };
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('general');
  
  const [formData, setFormData] = useState({
    nameEn: '', nameAr: '', nameTr: '',
    descEn: '', descAr: '', descTr: '',
    price: '', salePrice: '', costPrice: '',
    category: '', 
    sku: '', slug: '', bagType: 'general',
    stock: 0,
    isActive: true, isFeatured: false,
    badges: [],
    
    // Specs
    brand: 'Melora', material: '', weight: '', barcode: '', origin: '', piecesIncluded: '1',
    strapType: '', closureType: '', dimH: '', dimW: '', dimD: '',
    
    // SEO
    metaTitle: '', metaDescription: ''
  });

  const [availableColors, setAvailableColors] = useState('');
  const [availableSizes, setAvailableSizes] = useState('');
  
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);

  const getCategoryLabel = (category) => {
    const en = category?.name?.en || 'Unnamed';
    const ar = category?.name?.ar || '';
    const tr = category?.name?.tr || '';
    return [en, ar, tr].filter(Boolean).join(' / ');
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories(true);
        setCategories(data.data || []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, type, checked, value: inputValue } = e.target;
    const value = type === 'checkbox' ? checked : inputValue;
    
    // Auto-generate slug when nameEn changes
    if (name === 'nameEn') {
      const autoSlug = inputValue.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setFormData(prev => ({ ...prev, [name]: value, slug: autoSlug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };


  const generateBarcode = () => {
    const generated = `MLR${Date.now().toString().slice(-9)}${Math.floor(Math.random() * 90 + 10)}`;
    setFormData(prev => ({ ...prev, barcode: generated }));
  };

  const handleFileChange = (e) => setImages([...images, ...Array.from(e.target.files)]);
  const removeImage = (index) => setImages(images.filter((_, i) => i !== index));

  const addVariant = () => {
    setVariants([...variants, { color: '', size: '', sku: '', stock: 0, salePrice: '' }]);
  };
  
  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const toggleBadge = (badge) => {
    const current = formData.badges;
    if (current.includes(badge)) {
      setFormData({ ...formData, badges: current.filter(b => b !== badge) });
    } else {
      setFormData({ ...formData, badges: [...current, badge] });
    }
  };

  const getFriendlyError = (error) => {
    const message = error?.response?.data?.message || '';
    if (message.includes('description.en')) return copy.requiredDescription;
    if (message.includes('name.en')) return copy.requiredName;
    if (message.includes('price')) return copy.requiredPrice;
    if (message.includes('category')) return copy.requiredCategory;
    return message || copy.failedAdd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nameEn.trim()) return toast.error(copy.requiredName);
    if (!formData.descEn.trim()) return toast.error(copy.requiredDescription);
    if (!String(formData.price).trim()) return toast.error(copy.requiredPrice);
    if (!formData.category) return toast.error(copy.requiredCategory);
    setLoading(true);
    try {
      const data = new FormData();
      
      const finalSlug = formData.slug || formData.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const finalSku = formData.sku || `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Multilingual fields using bracket notation
      data.append('name[en]', formData.nameEn);
      if (formData.nameAr) data.append('name[ar]', formData.nameAr);
      if (formData.nameTr) data.append('name[tr]', formData.nameTr);
      
      data.append('description[en]', formData.descEn);
      if (formData.descAr) data.append('description[ar]', formData.descAr);
      if (formData.descTr) data.append('description[tr]', formData.descTr);
      
      // Standard
      data.append('price', formData.price);
      if (formData.salePrice) data.append('salePrice', formData.salePrice);
      if (formData.costPrice !== '') data.append('costPrice', formData.costPrice);
      data.append('stock', formData.stock || 0);
      data.append('sku', finalSku);
      data.append('slug', finalSlug);
      data.append('bagType', formData.bagType);
      if (formData.category) data.append('category', formData.category);
      data.append('isActive', formData.isActive);
      data.append('isFeatured', formData.isFeatured);
      
      // SEO
      data.append('seo', JSON.stringify({ 
        metaTitle: formData.metaTitle, 
        metaDescription: formData.metaDescription,
        slug: finalSlug
      }));

      // Specs
      data.append('specs', JSON.stringify({
        brand: formData.brand,
        material: formData.material,
        weight: formData.weight ? Number(formData.weight) : undefined,
        piecesIncluded: formData.piecesIncluded ? Number(formData.piecesIncluded) : 1,
        barcode: formData.barcode,
        origin: formData.origin,
        strapType: formData.strapType,
        closureType: formData.closureType,
        dimensions: { height: formData.dimH, width: formData.dimW, depth: formData.dimD }
      }));

      // Arrays
      data.append('badges', JSON.stringify(formData.badges));
      
      const colorsArr = availableColors.split(',').map(c => c.trim()).filter(Boolean);
      const sizesArr = availableSizes.split(',').map(s => s.trim()).filter(Boolean);
      data.append('availableColors', JSON.stringify(colorsArr));
      data.append('availableSizes', JSON.stringify(sizesArr));
      
      // Variants
      const cleanVariants = variants.map(v => ({
        ...v,
        stock: Number(v.stock),
        salePrice: v.salePrice ? Number(v.salePrice) : undefined
      }));
      data.append('variants', JSON.stringify(cleanVariants));
      
      // Files (Images)
      for(let i = 0; i < images.length; i++) {
        data.append('images', images[i]);
      }
      
      console.log("--- FORM DATA ENTRIES ---");
      for (let pair of data.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      await productService.createProduct(data);
      navigate('/admin/products');
    } catch (error) {
      console.error("Failed to add product", error);
      toast.error(getFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: copy.tabs.general },
    { id: 'specs', label: copy.tabs.specs },
    { id: 'variants', label: copy.tabs.variants },
    { id: 'images', label: copy.tabs.images },
    { id: 'seo', label: copy.tabs.seo },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/admin/products" className="hover:text-black transition-colors">{t?.products?.title || 'Products'}</Link>
        <span>/</span>
        <span className="text-black font-medium">{t?.products?.addProduct || 'Add New Product'}</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif text-black">{t?.products?.addProduct || 'Add New Product'}</h1>
        <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-black text-white text-sm font-medium hover:bg-gold transition-colors shadow-sm disabled:opacity-50">
          {loading ? '...' : t?.common?.save || 'Save Product'}
        </button>
      </div>

      <div className="flex space-x-1 border-b border-gray-200 mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black border-none'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form className="space-y-8" id="productForm">
        {/* --- GENERAL TAB --- */}
        {activeTab === 'general' && (
          <div className="space-y-6 bg-white p-6 rounded shadow-sm border border-gray-100 animate-fadeIn">
            <h2 className="text-lg font-medium text-black mb-4">{copy.basicDetails}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{copy.nameEn}</label>
                <input required type="text" name="nameEn" value={formData.nameEn} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{copy.nameAr}</label>
                <input type="text" name="nameAr" value={formData.nameAr} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black text-right" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{copy.nameTr}</label>
                <input type="text" name="nameTr" value={formData.nameTr} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{copy.descEn}</label>
              <textarea required rows="3" name="descEn" value={formData.descEn} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{copy.descAr}</label>
                <textarea rows="3" name="descAr" value={formData.descAr} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black text-right"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{copy.descTr}</label>
                <textarea rows="3" name="descTr" value={formData.descTr} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black"></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{copy.category}</label>
                  <select required name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black bg-white">
                    <option value="">{copy.select}</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{getCategoryLabel(cat)}</option>
                    ))}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{copy.baseSku}</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="Optional, auto-generated" className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{`${copy.basePrice} (${currencySymbol}) *`}</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{`${copy.salePrice} (${currencySymbol})`}</label>
                  <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{`${copy.costPrice} (${currencySymbol})`}</label>
                  <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{copy.bagType}</label>
                <select name="bagType" value={formData.bagType} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black bg-white">
                  <option value="general">{copy.general}</option>
                  <option value="women">{copy.women}</option>
                  <option value="men">{copy.men}</option>
                  <option value="travel">{copy.travel}</option>
                  <option value="evening">{copy.evening}</option>
                  <option value="backpack">{copy.backpack}</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e8d8c5] bg-[#fbf5ee] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{copy.barcode}</label>
                  <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} placeholder={copy.barcodePlaceholder} className="w-full border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:border-black" />
                  <p className="mt-2 text-xs text-gray-500">{copy.barcodeHint}</p>
                </div>
                <button type="button" onClick={generateBarcode} className="rounded-xl border border-black px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white">
                  {copy.generateBarcode}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-6">
               <label className="flex items-center space-x-2">
                 <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="accent-black w-4 h-4" />
                 <span className="text-sm font-medium text-gray-700">{copy.publishNow}</span>
               </label>
               <label className="flex items-center space-x-2">
                 <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="accent-black w-4 h-4" />
                 <span className="text-sm font-medium text-gray-700">{copy.featureHomepage}</span>
               </label>
            </div>

            <div className="pt-4 border-t border-gray-100">
               <label className="block text-sm font-medium text-gray-700 mb-3">{copy.productBadges}</label>
               <div className="flex gap-4">
                 {['Featured', 'New', 'Sale', 'Best Seller'].map(badge => (
                   <button
                     key={badge}
                     type="button"
                     onClick={() => toggleBadge(badge)}
                     className={`px-3 py-1 text-xs border rounded-full transition-colors ${formData.badges.includes(badge) ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-black'}`}
                   >
                     {badge}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* --- SPECS TAB --- */}
        {activeTab === 'specs' && (
          <div className="space-y-6 bg-white p-6 rounded shadow-sm border border-gray-100 animate-fadeIn">
             <h2 className="text-lg font-medium text-black mb-4">Specifications</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                  <input type="text" name="material" value={formData.material} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Included Pieces</label>
                  <input type="number" min="1" name="piecesIncluded" value={formData.piecesIncluded} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Barcode</label>
                  <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country of Origin</label>
                  <input type="text" name="origin" value={formData.origin} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Strap Type</label>
                  <input type="text" name="strapType" value={formData.strapType} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                </div>
             </div>

             <h3 className="text-sm font-medium text-gray-700 mt-6 mb-4">Dimensions (cm)</h3>
             <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Height</label>
                  <input type="number" name="dimH" value={formData.dimH} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Width</label>
                  <input type="number" name="dimW" value={formData.dimW} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Depth</label>
                  <input type="number" name="dimD" value={formData.dimD} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                </div>
             </div>
             
             <div className="pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Colors (comma separated)</label>
                  <input type="text" value={availableColors} onChange={(e) => setAvailableColors(e.target.value)} placeholder="Red, Blue, Gold" className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes (comma separated)</label>
                  <input type="text" value={availableSizes} onChange={(e) => setAvailableSizes(e.target.value)} placeholder="S, M, L, XL" className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                </div>
             </div>
          </div>
        )}

        {/* --- VARIANTS TAB --- */}
        {activeTab === 'variants' && (
          <div className="space-y-6 bg-white p-6 rounded shadow-sm border border-gray-100 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-medium text-black">Product Variants</h2>
               <button type="button" onClick={addVariant} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium text-black rounded transition-colors">
                  + Add Variant
               </button>
            </div>
            
            {variants.length === 0 ? (
               <div className="space-y-4">
                 <p className="text-sm text-gray-500 italic p-4 border border-dashed text-center">No variants created. The product will use base stock parameters.</p>
                 <div className="max-w-sm">
                   <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse Quantity</label>
                   <input type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
                   <p className="mt-2 text-xs text-gray-500">When this reaches 1 or 2 pieces, the admin dashboard will show a low-stock alert.</p>
                 </div>
               </div>
            ) : (
               <div className="space-y-4">
                 {variants.map((variant, i) => (
                   <div key={i} className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-gray-50 p-4 border border-gray-200 rounded relative">
                      <div className="w-full md:w-1/5">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Color *</label>
                        <input required type="text" value={variant.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black" />
                      </div>
                      <div className="w-full md:w-1/5">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Size *</label>
                        <input required type="text" value={variant.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black" />
                      </div>
                      <div className="w-full md:w-1/5">
                        <label className="block text-xs font-medium text-gray-700 mb-1">SKU *</label>
                        <input required type="text" value={variant.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black" />
                      </div>
                      <div className="w-full md:w-1/5">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Stock Qty *</label>
                        <input required type="number" min="0" value={variant.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black" />
                      </div>
                      <div className="w-full md:w-1/5">
                        <label className="block text-xs font-medium text-gray-700 mb-1">{`Sale Price Override (${currencySymbol})`}</label>
                        <input type="number" value={variant.salePrice} onChange={(e) => updateVariant(i, 'salePrice', e.target.value)} className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black" />
                      </div>
                      <button type="button" onClick={() => removeVariant(i)} className="text-red-500 hover:text-red-700 font-medium text-sm px-2">
                        Remove
                      </button>
                   </div>
                 ))}
               </div>
            )}
          </div>
        )}

        {/* --- IMAGES TAB --- */}
        {activeTab === 'images' && (
          <div className="bg-white p-6 md:p-8 rounded shadow-sm border border-gray-100 animate-fadeIn">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-lg font-medium text-black">Media Gallery</h2>
              <span className="text-xs text-gray-500 tracking-wider">UNLIMITED UPLOADS</span>
            </div>
            
            <input type="file" multiple onChange={handleFileChange} accept="image/jpeg,image/png,image/webp" className="w-full border border-dashed border-gray-300 p-8 text-center cursor-pointer mb-6 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors" />
            
            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((file, i) => (
                  <div key={i} className="group relative bg-gray-200 aspect-square rounded overflow-hidden shadow-sm">
                    <img loading="lazy" src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button type="button" onClick={() => removeImage(i)} className="bg-red-500 text-white p-2 rounded-full text-xs hover:bg-red-600">Delete</button>
                    </div>
                    {i === 0 && <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">Thumbnail</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center text-gray-500 py-12">No images selected.</p>
            )}
          </div>
        )}

        {/* --- SEO TAB --- */}
        {activeTab === 'seo' && (
          <div className="space-y-6 bg-white p-6 rounded shadow-sm border border-gray-100 animate-fadeIn">
            <div className="mb-4">
               <h2 className="text-lg font-medium text-black">Search Engine Optimization</h2>
               <p className="text-xs text-gray-500 mt-1">Leave blank to auto-generate based on product name and description.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
              <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} placeholder="50-60 characters" className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
              <textarea rows="3" name="metaDescription" value={formData.metaDescription} onChange={handleChange} placeholder="150-160 characters" className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black"></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
              <input type="text" name="slug" value={formData.slug} readOnly placeholder="Auto-generated from English name" className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black font-mono bg-gray-50 text-gray-500" />
            </div>
          </div>
        )}

      </form>
    </div>
  );
};

export default AddProduct;





