import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../../components/shared/Loader';
import { productService } from '../../../services/productService';
import { categoryService } from '../../../services/categoryService';
import useTranslation from '../../../hooks/useTranslation';
import useCurrencyStore from '../../../store/useCurrencyStore';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';

const ProductList = () => {
  const { t, language } = useTranslation('admin');
  const formatPrice = useCurrencyStore((state) => state.formatPrice);
  const backendOrigin = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api').replace(/\/api$/, '');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkActionType, setBulkActionType] = useState('');
  const [bulkData, setBulkData] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null, message: '', title: '' });

  const uiMap = {
    en: {
      deleteProduct: 'Delete Product', deleteConfirm: 'Delete this product permanently?', duplicateProduct: 'Duplicate Product', duplicateConfirm: 'Clone this product along with all its variants and images?', productDeleted: 'Product deleted successfully', productDuplicated: 'Product duplicated successfully', bulkDone: 'Bulk action completed', actionFailed: 'Action failed', statusUpdated: 'Status updated', statusUpdateFailed: 'Status update failed', selectAction: 'Select an action type', selectOne: 'Select at least one product', selectTargetCategory: 'Please select a target category.', confirmBulk: 'Confirm Bulk Action', executeBulk: 'Apply', productsWord: 'products', selected: 'Selected', bulkActions: 'Bulk Actions', deleteSelected: 'Delete Selected', changeCategory: 'Change Category', markFeatured: 'Mark Featured Status', enableDisable: 'Enable / Disable', selectCategory: 'Select Category', selectStatus: 'Select Status', featureOn: 'Feature (On)', featureOff: 'Un-feature (Off)', enableActive: 'Enable (Active)', disableHidden: 'Disable (Hidden)', allCategories: 'All Categories', allStatuses: 'All Statuses', activeOnly: 'Active Only', inactiveOnly: 'Inactive Only', featuredOnly: 'Featured Only', allStock: 'All Stock', inStock: 'In Stock', outOfStock: 'Out of Stock', lowStock: 'Low Stock (< 5)', searchByName: 'Search by name...', productDetails: 'Details', stock: 'Stock', date: 'Date', unknown: 'Unknown', uncategorized: 'Uncategorized', variants: 'Variants', pcsTotal: 'pcs total', pcs: 'pcs', active: 'Active', hidden: 'Hidden', featured: 'Featured', standard: 'Standard', duplicate: 'Duplicate', noProducts: 'No products found. Add some!', showing: 'Showing', to: 'to', of: 'of', results: 'Results', previous: 'Previous', next: 'Next', confirm: 'Confirm', readyLabel: 'Ready', lowStockLabel: 'Only a few left', outOfStockLabel: 'Out of stock', printBarcode: 'Print Barcode', barcodeLabel: 'Barcode Label', barcodeMissing: 'This product does not have a barcode yet.', barcodeValue: 'Barcode'
    },
    ar: {
      deleteProduct: 'حذف المنتج', deleteConfirm: 'هل أنت متأكد من حذف هذا المنتج نهائيًا؟', duplicateProduct: 'نسخ المنتج', duplicateConfirm: 'هل تريد نسخ هذا المنتج مع جميع متغيراته وصوره؟', productDeleted: 'تم حذف المنتج بنجاح', productDuplicated: 'تم نسخ المنتج بنجاح', bulkDone: 'تم تنفيذ الإجراء الجماعي', actionFailed: 'فشل تنفيذ الإجراء', statusUpdated: 'تم تحديث الحالة', statusUpdateFailed: 'فشل تحديث الحالة', selectAction: 'اختر نوع الإجراء', selectOne: 'اختر منتجًا واحدًا على الأقل', selectTargetCategory: 'يرجى اختيار الفئة المستهدفة.', confirmBulk: 'تأكيد الإجراء الجماعي', executeBulk: 'تطبيق', productsWord: 'منتج', selected: 'محدد', bulkActions: 'إجراءات جماعية', deleteSelected: 'حذف المحدد', changeCategory: 'تغيير الفئة', markFeatured: 'تحديث التمييز', enableDisable: 'تفعيل / إخفاء', selectCategory: 'اختر فئة', selectStatus: 'اختر الحالة', featureOn: 'تمييز', featureOff: 'إلغاء التمييز', enableActive: 'تفعيل', disableHidden: 'إخفاء', allCategories: 'كل الفئات', allStatuses: 'كل الحالات', activeOnly: 'النشطة فقط', inactiveOnly: 'المخفية فقط', featuredOnly: 'المميزة فقط', allStock: 'كل المخزون', inStock: 'متوفر', outOfStock: 'غير متوفر', lowStock: 'مخزون منخفض (< 5)', searchByName: 'ابحث بالاسم...', productDetails: 'التفاصيل', stock: 'المخزون', date: 'التاريخ', unknown: 'غير معروف', uncategorized: 'بدون فئة', variants: 'المتغيرات', pcsTotal: 'قطعة إجمالًا', pcs: 'قطعة', active: 'نشط', hidden: 'مخفي', featured: 'مميز', standard: 'عادي', duplicate: 'نسخ', noProducts: 'لا توجد منتجات. أضف منتجًا جديدًا!', showing: 'عرض', to: 'إلى', of: 'من', results: 'نتائج', previous: 'السابق', next: 'التالي', confirm: 'تأكيد', readyLabel: 'جاهز', lowStockLabel: 'متبقٍ عدد قليل', outOfStockLabel: 'غير متوفر', printBarcode: 'طباعة الباركود', barcodeLabel: 'ملصق الباركود', barcodeMissing: 'هذا المنتج لا يحتوي على باركود بعد.', barcodeValue: 'الباركود'
    },
    tr: {
      deleteProduct: 'Urunu Sil', deleteConfirm: 'Bu urun kalici olarak silinsin mi?', duplicateProduct: 'Urunu Kopyala', duplicateConfirm: 'Bu urun tum varyant ve gorsellerle kopyalansin mi?', productDeleted: 'Urun basariyla silindi', productDuplicated: 'Urun basariyla kopyalandi', bulkDone: 'Toplu islem tamamlandi', actionFailed: 'Islem basarisiz oldu', statusUpdated: 'Durum guncellendi', statusUpdateFailed: 'Durum guncellenemedi', selectAction: 'Bir islem secin', selectOne: 'En az bir urun secin', selectTargetCategory: 'Lutfen hedef kategori secin.', confirmBulk: 'Toplu Islemi Onayla', executeBulk: 'Uygula', productsWord: 'urun', selected: 'Secili', bulkActions: 'Toplu Islemler', deleteSelected: 'Secilenleri Sil', changeCategory: 'Kategori Degistir', markFeatured: 'One Cikan Durumu', enableDisable: 'Etkin / Gizli', selectCategory: 'Kategori Sec', selectStatus: 'Durum Sec', featureOn: 'One Cikar', featureOff: 'One Cikarmayi Kaldir', enableActive: 'Etkinlestir', disableHidden: 'Gizle', allCategories: 'Tum Kategoriler', allStatuses: 'Tum Durumlar', activeOnly: 'Sadece Aktif', inactiveOnly: 'Sadece Pasif', featuredOnly: 'Sadece One Cikan', allStock: 'Tum Stok', inStock: 'Stokta Var', outOfStock: 'Stokta Yok', lowStock: 'Dusuk Stok (< 5)', searchByName: 'Isme gore ara...', productDetails: 'Detaylari', stock: 'Stok', date: 'Tarih', unknown: 'Bilinmiyor', uncategorized: 'Kategorisiz', variants: 'Varyant', pcsTotal: 'adet toplam', pcs: 'adet', active: 'Aktif', hidden: 'Gizli', featured: 'One Cikan', standard: 'Standart', duplicate: 'Kopyala', noProducts: 'Urun bulunamadi. Yeni urun ekleyin!', showing: 'Gosterilen', to: '-', of: 'toplam', results: 'sonuc', previous: 'Onceki', next: 'Sonraki', confirm: 'Onayla', readyLabel: 'Hazir', lowStockLabel: 'Az sayida kaldi', outOfStockLabel: 'Stokta yok', printBarcode: 'Barkodu Yazdir', barcodeLabel: 'Barkod Etiketi', barcodeMissing: 'Bu urun icin henuz barkod tanimlanmamis.', barcodeValue: 'Barkod'
    }
  };

  const ui = uiMap[language] || uiMap.en;

  const getLocalizedValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[language] || value.en || value.ar || value.tr || Object.values(value)[0] || '';
  };

  const fetchInitData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts({ limit: 1000, includeInactive: true }),
        categoryService.getCategories()
      ]);
      setProducts(prodRes.data || prodRes.products || []);
      setCategories(catRes.data || []);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveAssetUrl = (value) => {
    if (!value) return 'https://via.placeholder.com/100';
    if (typeof value === 'object') return resolveAssetUrl(value.url);
    if (typeof value === 'string' && value.includes('\\uploads\\')) {
      return `${backendOrigin}${value.slice(value.lastIndexOf('\\uploads\\')).replace(/\\/g, '/')}`;
    }
    if (typeof value === 'string' && value.startsWith('/uploads/')) {
      return `${backendOrigin}${value}`;
    }
    return value;
  };

  const code39Patterns = {
    '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn',
    '4': 'nnnwwnnnw', '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw',
    '8': 'wnnwnnwnn', '9': 'nnwwnnwnn', 'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw',
    'C': 'wnwnnwnnn', 'D': 'nnnnwwnnw', 'E': 'wnnnwwnnn', 'F': 'nnwnwwnnn',
    'G': 'nnnnnwwnw', 'H': 'wnnnnwwnn', 'I': 'nnwnnwwnn', 'J': 'nnnnwwwnn',
    'K': 'wnnnnnnww', 'L': 'nnwnnnnww', 'M': 'wnwnnnnwn', 'N': 'nnnnwnnww',
    'O': 'wnnnwnnwn', 'P': 'nnwnwnnwn', 'Q': 'nnnnnnwww', 'R': 'wnnnnnwwn',
    'S': 'nnwnnnwwn', 'T': 'nnnnwnwwn', 'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw',
    'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw', 'Y': 'wwnnwnnnn', 'Z': 'nwwnwnnnn',
    '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '$': 'nwnwnwnnn',
    '/': 'nwnwnnnwn', '+': 'nwnnnwnwn', '%': 'nnnwnwnwn', '*': 'nwnnwnwnn'
  };

  const buildCode39Svg = (rawValue) => {
    const encoded = `*${String(rawValue || '').toUpperCase()}*`;
    let x = 12;
    const elements = [];

    encoded.split('').forEach((char) => {
      const pattern = code39Patterns[char] || code39Patterns['-'];
      pattern.split('').forEach((token, index) => {
        const isBar = index % 2 === 0;
        const width = token === 'w' ? 6 : 2;
        if (isBar) {
          elements.push(`<rect x="${x}" y="12" width="${width}" height="96" fill="#25170f" rx="0.5" />`);
        }
        x += width;
      });
      x += 2;
    });

    const width = x + 12;
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="152" viewBox="0 0 ${width} 152">
        <rect width="100%" height="100%" fill="#fffdf9" />
        ${elements.join('')}
        <text x="${width / 2}" y="138" text-anchor="middle" font-family="monospace" font-size="14" letter-spacing="2" fill="#25170f">${encoded}</text>
      </svg>
    `;
  };

  const printBarcodeLabel = (product) => {
    const barcode = String(product?.specs?.barcode || '').trim();
    if (!barcode) {
      toast.error(ui.barcodeMissing);
      return;
    }

    const name = getLocalizedValue(product?.name) || ui.unknown;
    const svgMarkup = buildCode39Svg(barcode);
    const labelWindow = window.open('', '_blank', 'width=420,height=620');
    if (!labelWindow) return;

    labelWindow.document.write(`
      <html>
        <head>
          <title>${ui.barcodeLabel}</title>
          <style>
            body { margin: 0; padding: 28px; font-family: Arial, sans-serif; background: #f7f0e7; color: #25170f; }
            .label { background: #fffdf9; border: 1px solid #e6d7c5; border-radius: 24px; padding: 24px; box-shadow: 0 16px 40px rgba(37, 23, 15, 0.08); }
            .eyebrow { font-size: 11px; letter-spacing: 0.32em; text-transform: uppercase; color: #9d7848; margin-bottom: 14px; }
            h1 { font-size: 24px; margin: 0 0 10px; line-height: 1.4; }
            .meta { margin-top: 14px; font-size: 13px; color: #6d5a48; }
            .meta strong { color: #25170f; }
            .barcode-box { margin-top: 22px; border: 1px dashed #d7c5b0; border-radius: 18px; padding: 18px; background: #fff; text-align: center; }
            .barcode-box svg { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="eyebrow">MELORA POS LABEL</div>
            <h1>${name}</h1>
            <div class="meta"><strong>SKU:</strong> ${product?.sku || '-'}</div>
            <div class="meta"><strong>${ui.barcodeValue}:</strong> ${barcode}</div>
            <div class="barcode-box">${svgMarkup}</div>
          </div>
        </body>
      </html>
    `);
    labelWindow.document.close();
    labelWindow.focus();
    labelWindow.print();
  };

  useEffect(() => {
    fetchInitData();
  }, []);

  const handleDeleteClick = (id) => {
    setConfirmModal({ isOpen: true, type: 'delete', id, title: ui.deleteProduct, message: t?.products?.deleteConfirm || ui.deleteConfirm });
  };

  const handleDuplicateClick = (id) => {
    setConfirmModal({ isOpen: true, type: 'duplicate', id, title: ui.duplicateProduct, message: ui.duplicateConfirm });
  };

  const confirmAction = async () => {
    const { type, id } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false });

    try {
      if (type === 'delete') {
        await productService.deleteProduct(id);
        toast.success(ui.productDeleted);
      } else if (type === 'duplicate') {
        await productService.duplicateProduct(id);
        toast.success(ui.productDuplicated);
      } else if (type === 'bulk') {
        setLoading(true);
        await productService.bulkAction({
          action: bulkActionType,
          productIds: selectedIds,
          data: bulkData ? {
            categoryId: bulkActionType === 'UPDATE_CATEGORY' ? bulkData : undefined,
            isFeatured: bulkActionType === 'MARK_FEATURED' ? bulkData === 'true' : undefined,
            isActive: bulkActionType === 'ENABLE_DISABLE' ? bulkData === 'true' : undefined
          } : {}
        });
        setBulkActionType('');
        setBulkData('');
        toast.success(ui.bulkDone);
        setLoading(false);
      }
      fetchInitData();
    } catch (error) {
      console.error('Action error', error);
      toast.error(error.response?.data?.message || ui.actionFailed);
      setLoading(false);
    }
  };

  const toggleStatus = async (id, field, currentValue) => {
    try {
      await productService.updateProduct(id, { [field]: !currentValue });
      toast.success(ui.statusUpdated);
      fetchInitData();
    } catch (error) {
      console.error('Action error', error);
      toast.error(ui.statusUpdateFailed);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(products.map((p) => p._id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleBulkSubmit = async () => {
    if (!bulkActionType) return toast.error(ui.selectAction);
    if (selectedIds.length === 0) return toast.error(ui.selectOne);
    if (bulkActionType === 'UPDATE_CATEGORY' && !bulkData) return toast.error(ui.selectTargetCategory);

    setConfirmModal({
      isOpen: true,
      type: 'bulk',
      id: null,
      title: ui.confirmBulk,
      message: `${ui.executeBulk} ${bulkActionType} ${selectedIds.length} ${ui.productsWord}?`
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif text-black">{t?.products?.title || 'Enterprise Product Registry'}</h1>
        <Link to="/admin/products/add" className="bg-black text-white px-6 py-2 text-sm font-medium tracking-wide hover:bg-gold transition-colors shadow-sm">
          {t?.products?.addProduct || 'Add New Product'}
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <span className="text-sm font-medium text-gray-700">{selectedIds.length} {ui.selected}</span>

            <select value={bulkActionType} onChange={(e) => { setBulkActionType(e.target.value); setBulkData(''); }} className="border border-gray-300 p-2 text-sm focus:outline-none focus:border-black bg-white disabled:opacity-50" disabled={selectedIds.length === 0}>
              <option value="">-- {t?.common?.actions || ui.bulkActions} --</option>
              <option value="DELETE">{t?.common?.delete || 'Delete'} {ui.selected}</option>
              <option value="UPDATE_CATEGORY">{ui.changeCategory}</option>
              <option value="MARK_FEATURED">{ui.markFeatured}</option>
              <option value="ENABLE_DISABLE">{ui.enableDisable}</option>
            </select>

            {bulkActionType === 'UPDATE_CATEGORY' && (
              <select value={bulkData} onChange={(e) => setBulkData(e.target.value)} className="border border-gray-300 p-2 text-sm focus:outline-none bg-white">
                <option value="">{ui.selectCategory}</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{getLocalizedValue(c.name)}</option>)}
              </select>
            )}
            {bulkActionType === 'MARK_FEATURED' && (
              <select value={bulkData} onChange={(e) => setBulkData(e.target.value)} className="border border-gray-300 p-2 text-sm focus:outline-none bg-white">
                <option value="">{ui.selectStatus}</option>
                <option value="true">{ui.featureOn}</option>
                <option value="false">{ui.featureOff}</option>
              </select>
            )}
            {bulkActionType === 'ENABLE_DISABLE' && (
              <select value={bulkData} onChange={(e) => setBulkData(e.target.value)} className="border border-gray-300 p-2 text-sm focus:outline-none bg-white">
                <option value="">{ui.selectStatus}</option>
                <option value="true">{ui.enableActive}</option>
                <option value="false">{ui.disableHidden}</option>
              </select>
            )}

            {bulkActionType && (
              <button onClick={handleBulkSubmit} className="bg-black text-white px-4 py-1.5 text-xs uppercase font-bold tracking-wider hover:bg-gold transition-colors">{t?.common?.save || ui.executeBulk}</button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border border-gray-300 p-2 text-sm focus:outline-none focus:border-black bg-white">
              <option value="">{ui.allCategories}</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{getLocalizedValue(c.name)}</option>)}
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 p-2 text-sm focus:outline-none focus:border-black bg-white">
              <option value="">{ui.allStatuses}</option>
              <option value="active">{ui.activeOnly}</option>
              <option value="inactive">{ui.inactiveOnly}</option>
              <option value="featured">{ui.featuredOnly}</option>
            </select>

            <select value={filterStock} onChange={(e) => { setFilterStock(e.target.value); setCurrentPage(1); }} className="border border-gray-300 p-2 text-sm focus:outline-none focus:border-black bg-white">
              <option value="">{ui.allStock}</option>
              <option value="in_stock">{ui.inStock}</option>
              <option value="out_of_stock">{ui.outOfStock}</option>
              <option value="low_stock">{ui.lowStock}</option>
            </select>

            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder={t?.common?.search || ui.searchByName} className="w-full sm:w-64 border border-gray-300 p-2 text-sm focus:outline-none focus:border-black" />
          </div>
        </div>

        {(() => {
          let filteredProducts = products.filter((p) => {
            const nameStr = getLocalizedValue(p.name).toLowerCase();
            const matchesSearch = nameStr.includes(searchQuery.toLowerCase());
            const matchesCategory = filterCategory ? (p.category?._id === filterCategory || p.category === filterCategory) : true;

            let matchesStatus = true;
            if (filterStatus === 'active') matchesStatus = p.isActive;
            if (filterStatus === 'inactive') matchesStatus = !p.isActive;
            if (filterStatus === 'featured') matchesStatus = p.isFeatured;

            let matchesStock = true;
            const totalStock = p.variants?.length > 0 ? (p.stockControl?.totalStock || 0) : (p.stock || 0);
            if (filterStock === 'in_stock') matchesStock = totalStock > 0;
            if (filterStock === 'out_of_stock') matchesStock = totalStock <= 0;
            if (filterStock === 'low_stock') matchesStock = totalStock > 0 && totalStock < 5;

            return matchesSearch && matchesCategory && matchesStatus && matchesStock;
          });

          filteredProducts.sort((a, b) => {
            let valA; let valB;
            switch (sortField) {
              case 'name':
                valA = getLocalizedValue(a.name).toLowerCase();
                valB = getLocalizedValue(b.name).toLowerCase();
                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
              case 'price':
                valA = a.salePrice ? a.salePrice : a.price;
                valB = b.salePrice ? b.salePrice : b.price;
                return sortOrder === 'asc' ? valA - valB : valB - valA;
              case 'stock':
                valA = a.variants?.length > 0 ? a.stockControl?.totalStock || 0 : a.stock || 0;
                valB = b.variants?.length > 0 ? b.stockControl?.totalStock || 0 : b.stock || 0;
                return sortOrder === 'asc' ? valA - valB : valB - valA;
              case 'createdAt':
              default:
                valA = new Date(a.createdAt).getTime();
                valB = new Date(b.createdAt).getTime();
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            }
          });

          const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
          const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

          const handleSort = (field) => {
            if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            else {
              setSortField(field);
              setSortOrder('asc');
            }
          };

          const SortIcon = ({ field }) => {
            if (sortField !== field) return <span className="ml-1 text-[#d5c4ae]">↕</span>;
            return <span className="ml-1 text-[#f6d38a]">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
          };

          return (
            <div className="overflow-x-auto">
              {loading ? (
                <Loader />
              ) : (
                <>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#231b33] text-xs uppercase tracking-[0.22em] shadow-sm">
                        <th className="w-10 rounded-tl-sm px-4 py-4 text-center text-[#fff7eb]"><input type="checkbox" onChange={handleSelectAll} checked={products.length > 0 && selectedIds.length === products.length} className="h-4 w-4 accent-[#8B6914]" /></th>
                        <th className="px-4 py-4 font-semibold text-[#fff7eb]">{t?.common?.image || 'Image'}</th>
                        <th className="cursor-pointer select-none px-6 py-4 font-semibold text-[#fff7eb] transition-colors hover:bg-white/10" onClick={() => handleSort('name')}>{t?.products?.title || 'Product'} {ui.productDetails} <SortIcon field="name" /></th>
                        <th className="px-6 py-4 font-semibold text-[#fff7eb]">{t?.common?.category || 'Category'}</th>
                        <th className="cursor-pointer select-none px-6 py-4 font-semibold text-[#fff7eb] transition-colors hover:bg-white/10" onClick={() => handleSort('price')}>{t?.common?.price || 'Price'} <SortIcon field="price" /></th>
                        <th className="cursor-pointer select-none px-6 py-4 font-semibold text-[#fff7eb] transition-colors hover:bg-white/10" onClick={() => handleSort('stock')}>{ui.stock} <SortIcon field="stock" /></th>
                        <th className="cursor-pointer select-none px-6 py-4 font-semibold text-[#fff7eb] transition-colors hover:bg-white/10" onClick={() => handleSort('createdAt')}>{ui.date} <SortIcon field="createdAt" /></th>
                        <th className="px-6 py-4 font-semibold text-[#fff7eb]">{t?.common?.status || 'Status'}</th>
                        <th className="rounded-tr-sm px-6 py-4 text-right font-semibold text-[#fff7eb]">{t?.common?.actions || 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedProducts.length > 0 ? paginatedProducts.map((product, index) => {
                        const name = getLocalizedValue(product.name) || ui.unknown;
                        const categoryName = getLocalizedValue(product.category?.name) || ui.uncategorized;
                        const imageSrc = resolveAssetUrl(product.images?.[0]);
                        const totalStock = product.variants?.length > 0 ? (product.stockControl?.totalStock || 0) : (product.stock || 0);
                        const stockTone = totalStock <= 0 ? 'text-red-600' : totalStock <= 2 ? 'text-amber-600' : 'text-green-600';
                        const stockNotice = totalStock <= 0 ? ui.outOfStockLabel : totalStock <= 2 ? ui.lowStockLabel : ui.readyLabel;

                        return (
                          <tr key={product._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                            <td className="px-4 py-4 text-center"><input type="checkbox" checked={selectedIds.includes(product._id)} onChange={() => handleSelectOne(product._id)} className="w-4 h-4 accent-[#8B6914]" /></td>
                            <td className="px-4 py-4">
                              <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden border border-gray-100">
                                <img loading="lazy" src={imageSrc} alt={name} className="w-full h-full object-cover" />
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-black">
                              <div className="flex items-center gap-2 mb-1">
                                {name}
                                {product.badges?.map((b) => <span key={b} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-white">{b}</span>)}
                              </div>
                              <div className="text-xs text-gray-500 font-mono tracking-tight">{product.sku}</div>
                              {product.specs?.barcode ? (
                                <div className="mt-1 text-[11px] text-[#7a6653] font-mono">{ui.barcodeValue}: {product.specs.barcode}</div>
                              ) : null}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{categoryName}</td>
                            <td className="px-6 py-4 text-sm font-medium text-black">
                              {formatPrice(product.salePrice ? product.salePrice : product.price)}
                              {product.salePrice && <span className="block text-xs line-through text-gray-400 font-normal">{formatPrice(product.price)}</span>}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {product.variants?.length > 0 ? (
                                <div className="flex flex-col">
                                  <span className="font-semibold text-blue-600">{product.variants.length} {ui.variants}</span>
                                  <span className={`text-xs font-bold ${stockTone}`}>{totalStock} {ui.pcsTotal}</span>
                                  <span className={`text-[11px] font-medium ${stockTone}`}>{stockNotice}</span>
                                </div>
                              ) : (
                                <div className="flex flex-col">
                                  <span className={`font-bold ${stockTone}`}>{totalStock} {ui.pcs}</span>
                                  <span className={`text-[11px] font-medium ${stockTone}`}>{stockNotice}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(product.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={product.isActive} onChange={() => toggleStatus(product._id, 'isActive', product.isActive)} className="sr-only peer" />
                                  <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500 relative"></div>
                                  <span className={`text-xs font-medium ${product.isActive ? 'text-green-700' : 'text-gray-500'}`}>{product.isActive ? ui.active : ui.hidden}</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={product.isFeatured} onChange={() => toggleStatus(product._id, 'isFeatured', product.isFeatured)} className="sr-only peer" />
                                  <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-gold relative"></div>
                                  <span className={`text-xs font-medium ${product.isFeatured ? 'text-gold' : 'text-gray-500'}`}>{product.isFeatured ? ui.featured : ui.standard}</span>
                                </label>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-right space-x-2">
                              <button onClick={() => printBarcodeLabel(product)} className="border border-[#6f5234] bg-[#f2dfc1] px-3 py-1.5 text-xs font-bold tracking-wide text-[#3a2718] shadow-sm transition-colors hover:bg-[#e7cca2] rounded-sm align-middle">
                                {ui.printBarcode}
                              </button>
                              <button onClick={() => handleDuplicateClick(product._id)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-sm hover:bg-emerald-700 text-xs font-bold uppercase tracking-wide shadow-sm transition-colors border-none align-middle">{ui.duplicate}</button>
                              <Link to={`/admin/products/edit/${product._id}`} className="inline-block bg-blue-600 text-white px-3 py-1.5 rounded-sm hover:bg-blue-700 text-xs font-bold uppercase tracking-wide shadow-sm transition-colors border-none align-middle">{t?.common?.edit || 'Edit'}</Link>
                              <button onClick={() => handleDeleteClick(product._id)} className="bg-red-600 text-white px-3 py-1.5 rounded-sm hover:bg-red-700 text-xs font-bold uppercase tracking-wide shadow-sm transition-colors border-none align-middle">{t?.common?.delete || 'Delete'}</button>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan="8" className="text-center py-6 text-gray-500">{ui.noProducts}</td></tr>
                      )}
                    </tbody>
                  </table>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                      <div className="text-sm text-gray-600">
                        {ui.showing} <span className="font-semibold text-brand">{((currentPage - 1) * itemsPerPage) + 1}</span> {ui.to} <span className="font-semibold text-brand">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> {ui.of} <span className="font-semibold text-brand">{filteredProducts.length}</span> {ui.results}
                      </div>
                      <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">{ui.previous}</button>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">{ui.next}</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}
      </div>

      <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} onConfirm={confirmAction} title={confirmModal.title} message={confirmModal.message} type={confirmModal.type === 'delete' ? 'danger' : 'warning'} confirmText={ui.confirm} />
    </div>
  );
};

export default ProductList;

