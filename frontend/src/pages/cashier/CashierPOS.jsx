import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { settingsService } from '../../services/settingsService';
import useCurrencyStore from '../../store/useCurrencyStore';
import useLangStore from '../../store/useLangStore';
import useAuthStore from '../../store/authStore';

const uiMap = {
  en: {
    eyebrow: 'Melora In-Store Sales',
    title: 'Cashier Point Of Sale',
    subtitle: 'Fast selling, cleaner stock control, and a refined checkout flow for your boutique floor.',
    search: 'Search by name, SKU, or barcode',
    searchAction: 'Search',
    scannerInput: 'Dedicated barcode scanner input',
    scanHint: 'Scan barcode then press Enter',
    focusScanner: 'Focus Barcode',
    focusSearch: 'Focus Search',
    scannerShortcutHint: 'Alt+B for barcode and Alt+S for search',
    monthlyPerformance: 'Monthly Performance',
    monthInvoicesLabel: 'Month Invoices',
    averageInvoice: 'Average Ticket',
    bestSalesDay: 'Best Sales Day',
    noBestDay: 'No standout day yet',
    barcodeMatched: 'Product added from barcode scan.',
    barcodeNotFound: 'No product matched this barcode.',
    addToSale: 'Add To Sale',
    salesToday: 'Today Sales',
    salesMonth: 'Month Sales',
    invoicesToday: 'Invoices Today',
    estimatedProfit: 'Estimated Profit',
    monthlyTarget: 'Monthly Target',
    weeklyTarget: 'Weekly Target',
    achieved: 'Achieved',
    remaining: 'Remaining',
    overTarget: 'Over Target',
    targetProgress: 'Target Progress',
    setTargetFirst: 'Set a target first in admin settings.',
    productLibrary: 'Product Library',
    currentSale: 'Current Sale',
    emptySale: 'No items added yet.',
    clearSale: 'Clear Sale',
    customerDetails: 'Customer Details',
    walkInHint: 'Use this section for walk-in clients and fast boutique checkout.',
    customerName: 'Customer Name',
    customerPhone: 'Customer Phone',
    notes: 'Notes',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Card',
    mixed: 'Mixed',
    discount: 'Discount',
    summary: 'Sale Summary',
    cashPart: 'Cash Portion',
    cardPart: 'Card Portion',
    mixedBalance: 'Balance Check',
    mixedMustMatch: 'Cash and card amounts must exactly match the sale total.',
    subtotal: 'Subtotal',
    pieces: 'Pieces',
    total: 'Total',
    completeSale: 'Complete Sale',
    processing: 'Processing Sale...',
    lowStock: 'Low Stock',
    topProducts: 'Top Products',
    recentSales: 'Recent Sales',
    bestDay: 'Best Day',
    invoice: 'Invoice',
    stock: 'Stock',
    lastSale: 'Last Sale',
    printReceipt: 'Print Receipt',
    noRecentSales: 'No recent POS sales yet.',
    noLowStock: 'Everything looks healthy in stock right now.',
    noTopProducts: 'Top products will appear after sales are recorded.',
    saleCompleted: 'POS sale completed successfully.',
    missingItems: 'Add at least one product before completing the sale.',
    printedOn: 'Printed on',
    barcode: 'Barcode',
    qty: 'Qty',
    remove: 'Remove',
    saleReceipt: 'Sale Receipt',
    cashier: 'Cashier',
    customer: 'Customer',
    thankYou: 'Thank you for shopping with Melora.',
    ready: 'Ready',
    fewLeft: 'Only a few left',
    outOfStock: 'Out of stock',
    noProducts: 'No products matched your search.',
    completeSaleDisabledShift: 'Open a cashier shift first to complete the sale.',
    completeSaleDisabledItems: 'Add at least one product to activate the sale button.',
    shiftControl: 'Shift Control',
    openShift: 'Open Shift',
    closeShift: 'Close Shift',
    activeShift: 'Active Shift',
    noShift: 'No shift is open yet.',
    openingFloat: 'Opening Float',
    expectedCash: 'Expected Cash',
    expectedCard: 'Expected Card',
    actualCash: 'Actual Cash Counted',
    actualCard: 'Actual Card Counted',
    variance: 'Variance',
    shiftOpened: 'Shift opened successfully.',
    shiftClosed: 'Shift closed successfully.',
    shiftNotes: 'Shift Notes',
    shiftStartedAt: 'Started At',
    shiftStatus: 'Shift Status',
    recentShiftClosed: 'Last closed shift',
    closedAt: 'Closed At',
    shiftRequired: 'Open a cashier shift before recording sales.',
    salesLogToday: 'Today Sales Log',
    cashSales: 'Cash Sales',
    cardSales: 'Card Sales',
    mixedSales: 'Mixed Sales',
    paymentBadgeCash: 'Cash',
    paymentBadgeCard: 'Card',
    paymentBadgeMixed: 'Mixed',
    voidSale: 'Void Sale',
    voidReason: 'Void Reason',
    saleVoided: 'POS sale voided successfully.',
    walkInCustomer: 'Walk-in Customer',
    clearCustomer: 'Clear Customer',
    shiftOpenState: 'وردية مفتوحة',
    shiftIdleState: 'لا توجد وردية',
    openShiftNow: 'Open Shift Now'
  },
  ar: {
    eyebrow: 'مبيعات المتجر ونقطة البيع',
    title: 'واجهة بيع الكاشير',
    subtitle: 'بيع أسرع، متابعة أوضح، وتحكم أدق بالمبيعات اليومية داخل المتجر.',
    search: 'ابحث بالاسم أو SKU أو الباركود',
    searchAction: 'بحث',
    scannerInput: 'حقل ماسح الباركود',
    scanHint: 'امسح الباركود ثم اضغط Enter',
    focusScanner: 'تركيز السكانر',
    focusSearch: 'تركيز البحث',
    scannerShortcutHint: 'الاختصار Alt+B للسكانر و Alt+S للبحث',
    monthlyPerformance: 'الأداء الشهري',
    monthInvoicesLabel: 'فواتير الشهر',
    averageInvoice: 'متوسط الفاتورة',
    bestSalesDay: 'أفضل يوم مبيعات',
    noBestDay: 'لا يوجد يوم بارز بعد',
    barcodeMatched: 'تمت إضافة المنتج عبر الباركود.',
    barcodeNotFound: 'لا يوجد منتج مطابق لهذا الباركود.',
    addToSale: 'إضافة للبيع',
    salesToday: 'مبيعات اليوم',
    salesMonth: 'مبيعات الشهر',
    invoicesToday: 'فواتير اليوم',
    estimatedProfit: 'الربح التقديري',
    monthlyTarget: 'الهدف الشهري',
    weeklyTarget: 'الهدف الأسبوعي',
    achieved: 'المحقق',
    remaining: 'المتبقي',
    overTarget: 'فوق الهدف',
    targetProgress: 'نسبة التقدم',
    setTargetFirst: 'يرجى تحديد الهدف من إعدادات الأدمن أولًا.',
    productLibrary: 'مكتبة المنتجات',
    currentSale: 'البيع الحالي',
    emptySale: 'لا يوجد منتج في سلة البيع.',
    clearSale: 'تفريغ البيع',
    customerDetails: 'بيانات العميل',
    walkInHint: 'استخدمي هذا القسم لعملاء المتجر المباشرين ولإنهاء البيع بسرعة.',
    customerName: 'اسم العميل',
    customerPhone: 'هاتف العميل',
    notes: 'ملاحظات',
    paymentMethod: 'طريقة الدفع',
    cash: 'نقدًا',
    card: 'بطاقة',
    mixed: 'مختلط',
    discount: 'خصم',
    summary: 'ملخص البيع',
    cashPart: 'الجزء النقدي',
    cardPart: 'الجزء البطاقي',
    mixedBalance: 'مطابقة المبلغ',
    mixedMustMatch: 'يجب أن يساوي مجموع النقد والبطاقة إجمالي قيمة البيع تمامًا.',
    subtotal: 'الإجمالي الفرعي',
    pieces: 'عدد القطع',
    total: 'الإجمالي',
    completeSale: 'إتمام البيع',
    processing: 'جاري تجهيز عملية البيع...',
    lowStock: 'المخزون المنخفض',
    topProducts: 'المنتجات الأكثر مبيعًا',
    recentSales: 'آخر المبيعات',
    bestDay: 'أفضل يوم',
    invoice: 'رقم الفاتورة',
    stock: 'المخزون',
    lastSale: 'آخر عملية بيع',
    printReceipt: 'طباعة الإيصال',
    noRecentSales: 'لا توجد مبيعات POS حديثة حتى الآن.',
    noLowStock: 'لا توجد منتجات منخفضة المخزون حاليًا.',
    noTopProducts: 'لا توجد بيانات كافية لأكثر المنتجات مبيعًا بعد.',
    saleCompleted: 'تمت عملية البيع بنجاح.',
    missingItems: 'يرجى إضافة منتج واحد على الأقل قبل إتمام البيع.',
    printedOn: 'تاريخ الطباعة',
    barcode: 'الباركود',
    qty: 'الكمية',
    remove: 'حذف',
    saleReceipt: 'إيصال البيع',
    cashier: 'الكاشير',
    customer: 'العميل',
    thankYou: 'شكرًا لتسوقك من ميلورا.',
    ready: 'جاهز',
    fewLeft: 'بقي عدد قليل',
    outOfStock: 'غير متوفر',
    noProducts: 'لا توجد منتجات متاحة حاليًا.',
    completeSaleDisabledShift: 'لا يمكن إتمام البيع قبل فتح الوردية.',
    completeSaleDisabledItems: 'لا يمكن إتمام البيع قبل إضافة منتجات.',
    shiftControl: 'إدارة الوردية',
    openShift: 'فتح الوردية',
    closeShift: 'إغلاق الوردية',
    activeShift: 'الوردية النشطة',
    noShift: 'لا توجد وردية مفتوحة الآن.',
    openingFloat: 'رصيد بداية الوردية',
    expectedCash: 'النقد المتوقع',
    expectedCard: 'البطاقات المتوقعة',
    actualCash: 'النقد الفعلي',
    actualCard: 'البطاقات الفعلية',
    variance: 'الفارق',
    shiftOpened: 'تم فتح الوردية بنجاح.',
    shiftClosed: 'تم إغلاق الوردية بنجاح.',
    shiftNotes: 'ملاحظات الوردية',
    shiftStartedAt: 'بدأت في',
    shiftStatus: 'حالة الوردية',
    recentShiftClosed: 'آخر وردية مغلقة',
    closedAt: 'أغلقت في',
    shiftRequired: 'يجب فتح وردية قبل تسجيل أي عملية بيع.',
    salesLogToday: 'سجل مبيعات اليوم',
    cashSales: 'المبيعات النقدية',
    cardSales: 'مبيعات البطاقات',
    mixedSales: 'المبيعات المختلطة',
    paymentBadgeCash: 'نقد',
    paymentBadgeCard: 'بطاقة',
    paymentBadgeMixed: 'مختلط',
    voidSale: 'إلغاء البيع',
    voidReason: 'سبب الإلغاء',
    saleVoided: 'تم إلغاء عملية البيع بنجاح.',
    walkInCustomer: 'عميل مباشر',
    clearCustomer: 'تفريغ بيانات العميل',
    shiftOpenState: 'وردية مفتوحة',
    shiftIdleState: 'لا توجد وردية',
    openShiftNow: 'فتح الوردية الآن'
  },
  tr: {
    eyebrow: 'Melora Magaza Satislari',
    title: 'Kasiyer Satis Ekrani',
    subtitle: 'Daha hizli satis, daha net stok kontrolu ve magaza icin daha zarif bir odeme akisi.',
    search: 'Ad, SKU veya barkod ile ara',
    searchAction: 'Ara',
    scannerInput: 'Barkod tarayici alani',
    scanHint: 'Barkodu okut ve Enter tusuna bas',
    focusScanner: 'Barkodu Hazirla',
    focusSearch: 'Aramayi Hazirla',
    scannerShortcutHint: 'Barkod icin Alt+B, arama icin Alt+S',
    monthlyPerformance: 'Aylik Performans',
    monthInvoicesLabel: 'Aylik Fis',
    averageInvoice: 'Ortalama Fis',
    bestSalesDay: 'En Iyi Satis Gunu',
    noBestDay: 'Henuz belirgin bir gun yok',
    barcodeMatched: 'Urun barkod ile sepete eklendi.',
    barcodeNotFound: 'Bu barkoda ait urun bulunamadi.',
    addToSale: 'Satisa Ekle',
    salesToday: 'Bugun Satis',
    salesMonth: 'Aylik Satis',
    invoicesToday: 'Bugun Fis',
    estimatedProfit: 'Tahmini Kar',
    monthlyTarget: 'Aylik Hedef',
    weeklyTarget: 'Haftalik Hedef',
    achieved: 'Ulasilan',
    remaining: 'Kalan',
    overTarget: 'Hedef Ustu',
    targetProgress: 'Hedef Ilerlemesi',
    setTargetFirst: 'Hedefi once admin ayarlarindan belirleyin.',
    productLibrary: 'Urun Kutuphanesi',
    currentSale: 'Aktif Satis',
    emptySale: 'Henuz urun eklenmedi.',
    clearSale: 'Satisi Temizle',
    customerDetails: 'Musteri Bilgileri',
    walkInHint: 'Magazaya gelen musteriler icin bu alani kullan ve hizli odeme al.',
    customerName: 'Musteri Adi',
    customerPhone: 'Musteri Telefonu',
    notes: 'Notlar',
    paymentMethod: 'Odeme Yontemi',
    cash: 'Nakit',
    card: 'Kart',
    mixed: 'Karma',
    discount: 'Indirim',
    summary: 'Satis Ozeti',
    cashPart: 'Nakit Kismi',
    cardPart: 'Kart Kismi',
    mixedBalance: 'Tutar Kontrolu',
    mixedMustMatch: 'Nakit ve kart toplami satis tutarina tam olarak esit olmalidir.',
    subtotal: 'Ara Toplam',
    pieces: 'Parca',
    total: 'Toplam',
    completeSale: 'Satisi Tamamla',
    processing: 'Satis Hazirlaniyor...',
    lowStock: 'Dusuk Stok',
    topProducts: 'En Cok Satanlar',
    recentSales: 'Son Satislar',
    bestDay: 'En Iyi Gun',
    invoice: 'Fatura No',
    stock: 'Stok',
    lastSale: 'Son Satis',
    printReceipt: 'Fis Yazdir',
    noRecentSales: 'Henuz POS satisi yok.',
    noLowStock: 'Stok tarafinda kritik urun yok.',
    noTopProducts: 'Satislar geldikce en cok satanlar burada gorunecek.',
    saleCompleted: 'POS satisi basariyla kaydedildi.',
    missingItems: 'Satisi tamamlamadan once en az bir urun ekle.',
    printedOn: 'Yazdirma Tarihi',
    barcode: 'Barkod',
    qty: 'Adet',
    remove: 'Sil',
    saleReceipt: 'Satis Fisi',
    cashier: 'Kasiyer',
    customer: 'Musteri',
    thankYou: 'Melora tercihiniz icin tesekkur ederiz.',
    ready: 'Hazir',
    fewLeft: 'Az kaldi',
    outOfStock: 'Stokta yok',
    noProducts: 'Aramana uygun urun bulunamadi.',
    completeSaleDisabledShift: 'Satisi tamamlamak icin once vardiya ac.',
    completeSaleDisabledItems: 'Butonu etkinlestirmek icin en az bir urun ekle.',
    shiftControl: 'Vardiya Kontrolu',
    openShift: 'Vardiya Ac',
    closeShift: 'Vardiyayi Kapat',
    activeShift: 'Aktif Vardiya',
    noShift: 'Henuz acik vardiya yok.',
    openingFloat: 'Acilis Kasasi',
    expectedCash: 'Beklenen Nakit',
    expectedCard: 'Beklenen Kart',
    actualCash: 'Sayilan Nakit',
    actualCard: 'Sayilan Kart',
    variance: 'Fark',
    shiftOpened: 'Vardiya basariyla acildi.',
    shiftClosed: 'Vardiya basariyla kapatildi.',
    shiftNotes: 'Vardiya Notlari',
    shiftStartedAt: 'Baslangic',
    shiftStatus: 'Vardiya Durumu',
    recentShiftClosed: 'Son kapanan vardiya',
    closedAt: 'Kapanis',
    shiftRequired: 'Satis kaydetmeden once vardiya ac.',
    salesLogToday: 'Bugun Satis Kaydi',
    cashSales: 'Nakit Satis',
    cardSales: 'Kart Satis',
    mixedSales: 'Karma Satis',
    paymentBadgeCash: 'Nakit',
    paymentBadgeCard: 'Kart',
    paymentBadgeMixed: 'Karma',
    voidSale: 'Satisi Iptal Et',
    voidReason: 'Iptal Nedeni',
    saleVoided: 'POS satisi basariyla iptal edildi.',
    walkInCustomer: 'Direkt Musteri',
    clearCustomer: 'Musteriyi Temizle',
    shiftOpenState: 'VARDIYA ACIK',
    shiftIdleState: 'VARDIYA YOK',
    openShiftNow: 'Vardiyayi Simdi Ac'
  }
};

const resolveImageUrl = (value) => {
  if (!value) return '/placeholder.jpg';
  if (typeof value === 'object') return resolveImageUrl(value.url || value.secure_url || value.path);
  if (typeof value === 'string' && value.startsWith('http')) return value;
  if (typeof value === 'string' && value.includes('\\uploads\\')) {
    const idx = value.lastIndexOf('\\uploads\\');
    return `http://127.0.0.1:5000${value.slice(idx).replace(/\\/g, '/')}`;
  }
  if (typeof value === 'string' && value.startsWith('/uploads/')) return `http://127.0.0.1:5000${value}`;
  return value;
};

const CashierPOS = () => {
  const { language } = useLangStore();
  const ui = uiMap[language] || uiMap.en;
  const formatPrice = useCurrencyStore((state) => state.formatPrice);
  const user = useAuthStore((state) => state.user);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [scannerCode, setScannerCode] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashPart, setCashPart] = useState('');
  const [cardPart, setCardPart] = useState('');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [saleSuccessNotice, setSaleSuccessNotice] = useState('');
  const [currentShift, setCurrentShift] = useState(null);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [openingFloat, setOpeningFloat] = useState('0');
  const [shiftNotes, setShiftNotes] = useState('');
  const [actualCash, setActualCash] = useState('');
  const [actualCard, setActualCard] = useState('');
  const [summary, setSummary] = useState({ today: { totalSales: 0, invoices: 0, pieces: 0, estimatedProfit: 0 }, month: { totalSales: 0, bestDay: null }, topProducts: [], lowProducts: [], recentSales: [] });
  const [monthlySalesTarget, setMonthlySalesTarget] = useState(0);
  const [weeklySalesTarget, setWeeklySalesTarget] = useState(0);
  const receiptWindowRef = useRef(null);
  const searchInputRef = useRef(null);
  const scannerInputRef = useRef(null);

  const getLocalizedValue = useCallback((value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[language] || value.en || value.tr || value.ar || '';
  }, [language]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts({ limit: 200, status: 'Active' });
      setProducts(response.products || response.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPosSummary = useCallback(async () => {
    try {
      const response = await orderService.getPosSummary();
      setSummary(response?.data || response || {});
    } catch (error) {
      console.error('Failed to load POS summary', error);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const response = await settingsService.getSettings();
      setMonthlySalesTarget(Number(response?.data?.monthlySalesTarget || 0));
      setWeeklySalesTarget(Number(response?.data?.weeklySalesTarget || 0));
    } catch (error) {
      console.error('Failed to load cashier settings', error);
    }
  }, []);

  const loadCurrentShift = useCallback(async () => {
    setShiftLoading(true);
    try {
      const response = await orderService.getCurrentPosShift();
      const shift = response?.data || null;
      setCurrentShift(shift);
      if (shift) {
        setShiftNotes(shift.notes || '');
        setActualCash(String(Math.round(Number(shift.expectedCash || 0) * 100) / 100));
        setActualCard(String(Math.round(Number(shift.expectedCard || 0) * 100) / 100));
      } else {
        setActualCash('');
        setActualCard('');
      }
    } catch (error) {
      console.error('Failed to load current shift', error);
    } finally {
      setShiftLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadPosSummary();
    loadCurrentShift();
    loadSettings();
  }, [loadProducts, loadPosSummary, loadCurrentShift, loadSettings]);

  useEffect(() => {
    const timer = setTimeout(() => scannerInputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleShortcuts = (event) => {
      if (!event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === 'b') {
        event.preventDefault();
        scannerInputRef.current?.focus();
      }
      if (key === 's') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => {
      const localizedName = getLocalizedValue(product.name).toLowerCase();
      const sku = String(product.sku || '').toLowerCase();
      const barcode = String(product.specs?.barcode || '').toLowerCase();
      return localizedName.includes(term) || sku.includes(term) || barcode.includes(term);
    });
  }, [products, search, getLocalizedValue]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const pieces = cart.reduce((sum, item) => sum + item.quantity, 0);
    const discountValue = Number(discountAmount) || 0;
    const appliedDiscount = Math.min(Math.max(discountValue, 0), subtotal);
    const total = Math.max(subtotal - appliedDiscount, 0);
    return { subtotal, pieces, appliedDiscount, total };
  }, [cart, discountAmount]);

  const monthSales = Number(summary.month?.totalSales || 0);
  const monthInvoices = Number(summary.month?.invoices || 0);
  const monthlyAverageTicket = monthInvoices > 0 ? monthSales / monthInvoices : 0;
  const weeklySales = Number((summary.month?.salesByDay || []).slice(-7).reduce((sum, item) => sum + Number(item.total || item.revenue || 0), 0));
  const targetProgress = monthlySalesTarget > 0 ? (monthSales / monthlySalesTarget) * 100 : 0;
  const progressWidth = Math.min(targetProgress, 100);
  const remainingTarget = Math.max(monthlySalesTarget - monthSales, 0);
  const exceededTarget = Math.max(monthSales - monthlySalesTarget, 0);
  const weeklyProgress = weeklySalesTarget > 0 ? (weeklySales / weeklySalesTarget) * 100 : 0;
  const weeklyProgressWidth = Math.min(weeklyProgress, 100);
  const weeklyRemaining = Math.max(weeklySalesTarget - weeklySales, 0);
  const weeklyExceeded = Math.max(weeklySales - weeklySalesTarget, 0);
  const mixedEnteredTotal = (Number(cashPart || 0) + Number(cardPart || 0));
  const mixedDifference = Number((totals.total - mixedEnteredTotal).toFixed(2));
  const saleDisabledReason = !currentShift
    ? ui.completeSaleDisabledShift
    : !cart.length
      ? ui.completeSaleDisabledItems
      : '';
  const saleButtonDisabled = submitting || !currentShift || !cart.length;

  const getStockTone = (stock) => {
    if (stock <= 0) return { label: ui.outOfStock, className: 'bg-red-50 text-red-700 border border-red-100' };
    if (stock <= 2) return { label: ui.fewLeft, className: 'bg-amber-50 text-amber-700 border border-amber-100' };
    return { label: ui.ready, className: 'bg-emerald-50 text-emerald-700 border border-emerald-100' };
  };

  const addToCart = useCallback((product) => {
    const availableStock = Number(product.stock || 0);
    if (availableStock <= 0) {
      toast.error(ui.outOfStock);
      return;
    }
    setCart((current) => {
      const existing = current.find((item) => item._id === product._id);
      if (existing) {
        if (existing.quantity >= availableStock) {
          toast.error(ui.fewLeft);
          return current;
        }
        return current.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [{ _id: product._id, name: getLocalizedValue(product.name), image: resolveImageUrl(product.images?.[0]), price: Number(product.price || 0), stock: availableStock, sku: product.sku || '', quantity: 1 }, ...current];
    });
  }, [getLocalizedValue, ui.fewLeft, ui.outOfStock]);

  const handleSearchKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const term = search.trim().toLowerCase();
    if (!term) return;

    const exactMatch = products.find((product) => {
      const sku = String(product.sku || '').toLowerCase();
      const barcode = String(product.specs?.barcode || '').toLowerCase();
      return sku === term || barcode === term;
    });

    if (!exactMatch) return;
    addToCart(exactMatch);
    setSearch('');
    toast.success(ui.barcodeMatched);
  };

  const handleScannerKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const term = scannerCode.trim().toLowerCase();
    if (!term) return;

    const exactMatch = products.find((product) => {
      const barcode = String(product.specs?.barcode || '').toLowerCase();
      return barcode === term;
    });

    if (!exactMatch) {
      toast.error(ui.barcodeNotFound);
      setScannerCode('');
      return;
    }

    addToCart(exactMatch);
    setScannerCode('');
    toast.success(ui.barcodeMatched);
  };

  const updateQuantity = useCallback((productId, nextQuantity) => {
    setCart((current) => current.flatMap((item) => {
      if (item._id !== productId) return [item];
      if (nextQuantity <= 0) return [];
      const clamped = Math.min(nextQuantity, Number(item.stock || nextQuantity));
      return [{ ...item, quantity: clamped }];
    }));
  }, []);

  const clearSale = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setPaymentMethod('cash');
    setCashPart('');
    setCardPart('');
    setDiscountAmount('0');
  };

  const formatSaleSuccessMessage = useCallback((order) => {
    if (!order) return '';
    const invoiceNumber = order.invoiceNumber || String(order._id || '').slice(-8) || '—';
    const totalAmount = Number(order.total || 0);
    return `تم البيع بنجاح. رقم الفاتورة ${invoiceNumber} بإجمالي ${formatPrice(totalAmount)}.`;
  }, [formatPrice]);

  const printReceipt = useCallback((order) => {
    if (!order) return;
    const receiptLines = (order.items || []).map((item) => `
      <tr><td style="padding:8px 0;border-bottom:1px dashed #d6c4b3;">${item.name}</td><td style="padding:8px 0;border-bottom:1px dashed #d6c4b3;text-align:center;">${item.quantity}</td><td style="padding:8px 0;border-bottom:1px dashed #d6c4b3;text-align:right;">${formatPrice(item.price)}</td></tr>
    `).join('');
    const win = receiptWindowRef.current && !receiptWindowRef.current.closed ? receiptWindowRef.current : window.open('', '_blank', 'width=420,height=760');
    if (!win) return;
    receiptWindowRef.current = win;
    win.document.write(`
      <html><head><title>${ui.saleReceipt}</title><style>@page{size:80mm auto;margin:6mm}body{font-family:Arial,sans-serif;color:#25170f;width:72mm;margin:0 auto;padding:0}h1{font-size:20px;margin:0 0 4px;text-align:center;letter-spacing:0.25em}.muted{color:#7a6653;font-size:11px;text-align:center}.panel{border-top:1px dashed #d6c4b3;padding:12px 0;margin-top:12px}table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px}.total{font-size:18px;font-weight:700;margin-top:14px;text-align:right}.meta{font-size:12px;line-height:1.8}.footer{margin-top:14px;padding-top:10px;border-top:1px dashed #d6c4b3}</style></head><body><h1>MELORA</h1><div class="muted">${ui.saleReceipt}</div><div class="panel meta"><div><strong>${ui.invoice}:</strong> ${order.invoiceNumber || String(order._id || '').slice(-8)}</div><div><strong>${ui.customer}:</strong> ${order.shippingAddress?.fullName || customerName || '-'}</div><div><strong>${ui.paymentMethod}:</strong> ${order.paymentMethod}</div><div><strong>${ui.printedOn}:</strong> ${new Date().toLocaleString()}</div></div><div class="panel"><table><thead><tr><th style="text-align:left;padding-bottom:8px;">${ui.productLibrary}</th><th style="text-align:center;padding-bottom:8px;">${ui.qty}</th><th style="text-align:right;padding-bottom:8px;">${ui.total}</th></tr></thead><tbody>${receiptLines}</tbody></table><div class="total">${ui.total}: ${formatPrice(order.total)}</div></div><div class="footer"><p class="muted">${ui.thankYou}</p></div></body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  }, [customerName, formatPrice, ui]);

  const paymentBadge = (method) => {
    if (method === 'cash') return { label: ui.paymentBadgeCash, className: 'bg-emerald-50 text-emerald-700 border border-emerald-100' };
    if (method === 'card') return { label: ui.paymentBadgeCard, className: 'bg-blue-50 text-blue-700 border border-blue-100' };
    return { label: ui.paymentBadgeMixed, className: 'bg-amber-50 text-amber-700 border border-amber-100' };
  };

  const completeSale = async () => {
    if (!currentShift) {
      toast.error(ui.shiftRequired);
      return;
    }
    if (!cart.length) {
      toast.error(ui.missingItems);
      return;
    }
    if (paymentMethod === 'mixed' && Math.abs(mixedDifference) > 0.01) {
      toast.error(ui.mixedMustMatch);
      return;
    }
    setSubmitting(true);
    try {
      const response = await orderService.createPosOrder({
        items: cart.map((item) => ({ product: item._id, quantity: item.quantity })),
        customer: {
          fullName: customerName,
          phone: customerPhone
        },
        notes,
        payment: {
          method: paymentMethod,
          cashAmount: paymentMethod === 'mixed' ? Number(cashPart || 0) : undefined,
          cardAmount: paymentMethod === 'mixed' ? Number(cardPart || 0) : undefined
        },
        discountAmount: totals.appliedDiscount
      });
      const createdOrder = response?.data || response;
      setLastOrder(createdOrder);
      setSaleSuccessNotice(formatSaleSuccessMessage(createdOrder));
      clearSale();
      await Promise.all([loadProducts(), loadPosSummary()]);
      await loadCurrentShift();
      toast.success(ui.saleCompleted);
    } catch (error) {
      setSaleSuccessNotice('');
      toast.error(error?.response?.data?.message || 'Failed to complete sale.');
    } finally {
      setSubmitting(false);
    }
  };

    const openShift = async () => {
      try {
        setShiftLoading(true);
        const response = await orderService.openPosShift({
          openingFloat: Number(openingFloat || 0),
          notes: shiftNotes
        });
        setCurrentShift(response?.data || null);
        toast.success(response?.reused ? ui.shiftOpenState : ui.shiftOpened);
        await loadCurrentShift();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to open shift.');
      } finally {
        setShiftLoading(false);
    }
  };

  const closeShift = async () => {
    try {
      setShiftLoading(true);
      await orderService.closePosShift({
        actualCash: Number(actualCash || 0),
        actualCard: Number(actualCard || 0),
        notes: shiftNotes
      });
      toast.success(ui.shiftClosed);
      setCurrentShift(null);
      setOpeningFloat('0');
      setShiftNotes('');
      setActualCash('');
      setActualCard('');
      await Promise.all([loadCurrentShift(), loadPosSummary()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to close shift.');
    } finally {
      setShiftLoading(false);
    }
  };

  const voidSale = async (saleId) => {
    const reason = window.prompt(ui.voidReason, '');
    if (reason === null) return;
    try {
      await orderService.voidPosOrder(saleId, reason);
      if (lastOrder?._id === saleId) {
        setLastOrder(null);
      }
      setSaleSuccessNotice('');
      await Promise.all([loadProducts(), loadPosSummary(), loadCurrentShift()]);
      toast.success(ui.saleVoided);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to void POS sale.');
    }
  };

  return (
    <div className="px-4 py-6 md:px-6 xl:px-8">
      <section className="rounded-[2rem] border border-[#eadbca] bg-[linear-gradient(135deg,#fffdf9,#f4eadf)] p-6 shadow-[0_24px_80px_rgba(45,24,12,0.08)]">
        <p className="text-xs uppercase tracking-[0.35em] text-[#9d7848]">{ui.eyebrow}</p>
        <div className="mt-4 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl text-[#25170f] md:text-5xl">{ui.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#7a6653]">{ui.subtitle}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] bg-white/90 px-5 py-4 shadow-sm border border-[#eadbca]"><p className="text-xs uppercase tracking-[0.25em] text-[#9d7848]">{ui.currentSale}</p><p className="mt-2 text-3xl font-semibold text-[#25170f]">{cart.length}</p></div>
            <div className="rounded-[1.5rem] bg-white/90 px-5 py-4 shadow-sm border border-[#eadbca]"><p className="text-xs uppercase tracking-[0.25em] text-[#9d7848]">{ui.pieces}</p><p className="mt-2 text-3xl font-semibold text-[#25170f]">{totals.pieces}</p></div>
            <div className="rounded-[1.5rem] bg-[#1d1730] px-5 py-4 shadow-[0_14px_30px_rgba(29,23,48,0.22)]">
              <p className="text-xs uppercase tracking-[0.25em] text-[#f5d58e]">{ui.total}</p>
              <p className="mt-2 text-3xl font-semibold text-[#fff8ef]">{formatPrice(totals.total)}</p>
            </div>
          </div>
        </div>
      </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[{ label: ui.salesToday, value: formatPrice(summary.today?.totalSales || 0) }, { label: ui.invoicesToday, value: summary.today?.invoices || 0 }, { label: ui.salesMonth, value: formatPrice(summary.month?.totalSales || 0) }, { label: ui.estimatedProfit, value: formatPrice(summary.today?.estimatedProfit || 0) }].map((card) => (
            <div key={card.label} className="rounded-[1.5rem] border border-[#eadbca] bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.25em] text-[#9d7848]">{card.label}</p><p className="mt-3 text-3xl font-semibold text-[#25170f]">{card.value}</p></div>
          ))}
        </section>

        <section className="mt-6 rounded-[2rem] border border-[#eadbca] bg-[linear-gradient(135deg,#fffaf5,#f5eadf)] p-5 shadow-[0_20px_60px_rgba(39,22,14,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#9d7848]">{ui.monthlyTarget}</p>
              <h3 className="mt-2 font-serif text-3xl text-[#25170f]">{ui.targetProgress}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6f5b49]">
                {monthlySalesTarget > 0
                  ? `${ui.achieved}: ${formatPrice(monthSales)} / ${formatPrice(monthlySalesTarget)}`
                  : ui.setTargetFirst}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] border border-white/70 bg-white/85 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.monthlyTarget}</p>
                <p className="mt-2 text-xl font-semibold text-[#25170f]">{monthlySalesTarget > 0 ? formatPrice(monthlySalesTarget) : '—'}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/70 bg-white/85 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.achieved}</p>
                <p className="mt-2 text-xl font-semibold text-[#25170f]">{formatPrice(monthSales)}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/70 bg-white/85 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{monthlySalesTarget > 0 && exceededTarget > 0 ? ui.overTarget : ui.remaining}</p>
                <p className={`mt-2 text-xl font-semibold ${monthlySalesTarget > 0 && exceededTarget > 0 ? 'text-emerald-700' : 'text-[#25170f]'}`}>
                  {monthlySalesTarget > 0 ? formatPrice(exceededTarget > 0 ? exceededTarget : remainingTarget) : '—'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-[#6f5b49]">{ui.targetProgress}</span>
              <span className="font-semibold text-[#25170f]">{monthlySalesTarget > 0 ? `${targetProgress.toFixed(1)}%` : '—'}</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-white/90">
              <div
                className={`h-full rounded-full transition-all ${monthlySalesTarget > 0 && targetProgress >= 100 ? 'bg-emerald-500' : 'bg-[#1d1730]'}`}
                style={{ width: `${monthlySalesTarget > 0 ? progressWidth : 0}%` }}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-[#eadbca] bg-[linear-gradient(135deg,#fffdf9,#efe4d7)] p-5 shadow-[0_20px_60px_rgba(39,22,14,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#9d7848]">{ui.weeklyTarget}</p>
              <h3 className="mt-2 font-serif text-3xl text-[#25170f]">{ui.weeklyTarget}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6f5b49]">
                {weeklySalesTarget > 0
                  ? `${ui.achieved}: ${formatPrice(weeklySales)} / ${formatPrice(weeklySalesTarget)}`
                  : ui.setTargetFirst}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] border border-white/70 bg-white/85 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.weeklyTarget}</p>
                <p className="mt-2 text-xl font-semibold text-[#25170f]">{weeklySalesTarget > 0 ? formatPrice(weeklySalesTarget) : '—'}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/70 bg-white/85 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.achieved}</p>
                <p className="mt-2 text-xl font-semibold text-[#25170f]">{formatPrice(weeklySales)}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/70 bg-white/85 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{weeklySalesTarget > 0 && weeklyExceeded > 0 ? ui.overTarget : ui.remaining}</p>
                <p className={`mt-2 text-xl font-semibold ${weeklySalesTarget > 0 && weeklyExceeded > 0 ? 'text-emerald-700' : 'text-[#25170f]'}`}>
                  {weeklySalesTarget > 0 ? formatPrice(weeklyExceeded > 0 ? weeklyExceeded : weeklyRemaining) : '—'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-[#6f5b49]">{ui.targetProgress}</span>
              <span className="font-semibold text-[#25170f]">{weeklySalesTarget > 0 ? `${weeklyProgress.toFixed(1)}%` : '—'}</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-white/90">
              <div className={`h-full rounded-full transition-all ${weeklySalesTarget > 0 && weeklyProgress >= 100 ? 'bg-emerald-500' : 'bg-[#8b6914]'}`} style={{ width: `${weeklySalesTarget > 0 ? weeklyProgressWidth : 0}%` }} />
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-[2rem] border border-[#eadbca] bg-white p-5 shadow-[0_20px_60px_rgba(39,22,14,0.08)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div><p className="text-xs uppercase tracking-[0.3em] text-[#9d7848]">{ui.productLibrary}</p><h2 className="mt-2 font-serif text-3xl text-[#25170f]">{ui.productLibrary}</h2></div>
            <div className="w-full md:max-w-2xl">
              <div className="mb-3 rounded-[1.5rem] border border-[#eadbca] bg-[linear-gradient(135deg,#fffaf5,#f5eadf)] p-3">
                <div className="flex gap-3">
                  <input ref={scannerInputRef} value={scannerCode} onChange={(event) => setScannerCode(event.target.value)} onKeyDown={handleScannerKeyDown} placeholder={ui.scannerInput} className="w-full rounded-2xl border border-[#dcc9b4] bg-white px-4 py-3 text-sm font-medium text-[#25170f] outline-none placeholder:text-[#9f8b79] focus:border-[#8b5e34]" />
                  <button type="button" onClick={() => scannerInputRef.current?.focus()} className="rounded-2xl bg-[#1d1730] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2b1b12]">{ui.focusScanner}</button>
                </div>
                <p className="mt-2 text-xs text-[#8f7558]">{ui.scanHint}</p>
                <p className="mt-1 text-[11px] font-medium text-[#9d7848]">{ui.scannerShortcutHint}</p>
              </div>
              <div className="flex gap-3">
                <input ref={searchInputRef} value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={handleSearchKeyDown} placeholder={ui.search} className="w-full rounded-2xl border border-[#e1d3c2] bg-[#fbf7f1] px-4 py-3 text-sm text-[#25170f] outline-none placeholder:text-[#9f8b79]" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => searchInputRef.current?.focus()} className="rounded-2xl border border-[#d7c5b0] px-4 py-3 text-sm font-semibold text-[#25170f] hover:bg-[#fbf5ee]">{ui.focusSearch}</button>
                  <button type="button" onClick={() => setSearch('')} className="rounded-2xl border border-[#e7d7c4] px-4 py-3 text-sm font-semibold text-[#7a6653] hover:bg-[#fbf5ee]">{ui.searchAction}</button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#7a6653]">Loading...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-[#7a6653]">{ui.noProducts}</div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const stock = Number(product.stock || 0);
                const tone = getStockTone(stock);
                return (
                  <article key={product._id} className="overflow-hidden rounded-[1.75rem] border border-[#eadbca] bg-[#fffdf9] shadow-sm">
                    <div className="aspect-[4/3] overflow-hidden bg-[#f7efe5]"><img src={resolveImageUrl(product.images?.[0])} alt={getLocalizedValue(product.name)} className="h-full w-full object-cover" /></div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-[#25170f]">{getLocalizedValue(product.name)}</h3>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#8f7558]">{product.sku || '-'}</p>
                          {product.specs?.barcode ? <p className="mt-2 text-xs text-[#8f7558]">{ui.barcode}: {product.specs.barcode}</p> : null}
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.className}`}>{tone.label}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div><p className="text-sm text-[#8f7558]">{ui.stock}: {stock}</p><p className="mt-1 text-2xl font-semibold text-[#25170f]">{formatPrice(product.price || 0)}</p></div>
                        <button onClick={() => addToCart(product)} className="rounded-2xl bg-[#2b1b12] px-4 py-3 text-sm font-semibold leading-5 text-[#fff8ef] shadow-[0_10px_24px_rgba(43,27,18,0.18)] transition hover:bg-[#5a3b24] hover:text-white">{ui.addToSale}</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-[#eadbca] bg-white p-5 shadow-[0_20px_60px_rgba(39,22,14,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#9d7848]">{ui.shiftControl}</p>
                <h3 className="mt-2 font-serif text-3xl text-[#25170f]">{ui.activeShift}</h3>
                {user?.name ? <p className="mt-2 text-sm text-[#8f7558]">{ui.cashier}: {user.name}</p> : null}
              </div>
              <span className={`rounded-full px-4 py-2 text-xs font-semibold ${currentShift ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-stone-100 text-stone-600 border border-stone-200'}`}>
                {currentShift ? ui.shiftOpenState : ui.shiftIdleState}
              </span>
            </div>

            {currentShift ? (
              <div className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-[#efe3d4] bg-[#f9f3eb] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.shiftStartedAt}</p>
                    <p className="mt-2 text-sm font-semibold text-[#25170f]">{new Date(currentShift.openedAt).toLocaleString()}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[#efe3d4] bg-[#f9f3eb] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.openingFloat}</p>
                    <p className="mt-2 text-sm font-semibold text-[#25170f]">{formatPrice(currentShift.openingFloat || 0)}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">{ui.expectedCash}</p>
                    <p className="mt-2 text-xl font-semibold text-emerald-900">{formatPrice(currentShift.expectedCash || 0)}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-sky-200 bg-sky-50 px-4 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-sky-700">{ui.expectedCard}</p>
                    <p className="mt-2 text-xl font-semibold text-sky-900">{formatPrice(currentShift.expectedCard || 0)}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#25170f]">{ui.actualCash}</label>
                    <input type="number" min="0" step="0.01" value={actualCash} onChange={(event) => setActualCash(event.target.value)} className="w-full rounded-2xl border border-[#dcc9b4] bg-white px-4 py-3 text-sm text-[#25170f] outline-none focus:border-[#8b5e34]" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#25170f]">{ui.actualCard}</label>
                    <input type="number" min="0" step="0.01" value={actualCard} onChange={(event) => setActualCard(event.target.value)} className="w-full rounded-2xl border border-[#dcc9b4] bg-white px-4 py-3 text-sm text-[#25170f] outline-none focus:border-[#8b5e34]" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#25170f]">{ui.shiftNotes}</label>
                  <textarea value={shiftNotes} onChange={(event) => setShiftNotes(event.target.value)} rows={3} className="w-full rounded-2xl border border-[#dcc9b4] bg-white px-4 py-3 text-sm text-[#25170f] outline-none focus:border-[#8b5e34]" />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.25rem] border border-[#efe3d4] bg-[#fffdf9] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.invoice}</p>
                    <p className="mt-2 text-xl font-semibold text-[#25170f]">{currentShift.invoicesCount || 0}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[#efe3d4] bg-[#fffdf9] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.pieces}</p>
                    <p className="mt-2 text-xl font-semibold text-[#25170f]">{currentShift.piecesCount || 0}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[#efe3d4] bg-[#fffdf9] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.variance}</p>
                    <p className={`mt-2 text-xl font-semibold ${Number((Number(actualCash || 0) + Number(actualCard || 0)) - Number(currentShift.expectedTotal || 0)) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {formatPrice((Number(actualCash || 0) + Number(actualCard || 0)) - Number(currentShift.expectedTotal || 0))}
                    </p>
                  </div>
                </div>

                <button onClick={closeShift} disabled={shiftLoading} className="w-full rounded-[1.5rem] bg-[#1d1730] px-5 py-4 text-sm font-semibold text-[#fff8ef] transition hover:bg-[#2b1b12] disabled:cursor-not-allowed disabled:bg-[#766d86] disabled:text-[#f8f1e7] disabled:opacity-100">
                  {ui.closeShift}
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <p className="text-sm leading-7 text-[#6f5b49]">{ui.noShift}</p>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#25170f]">{ui.openingFloat}</label>
                  <input type="number" min="0" step="0.01" value={openingFloat} onChange={(event) => setOpeningFloat(event.target.value)} className="w-full rounded-2xl border border-[#dcc9b4] bg-white px-4 py-3 text-sm text-[#25170f] outline-none focus:border-[#8b5e34]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#25170f]">{ui.shiftNotes}</label>
                  <textarea value={shiftNotes} onChange={(event) => setShiftNotes(event.target.value)} rows={3} className="w-full rounded-2xl border border-[#dcc9b4] bg-white px-4 py-3 text-sm text-[#25170f] outline-none focus:border-[#8b5e34]" />
                </div>
                <button onClick={openShift} disabled={shiftLoading} className="w-full rounded-[1.5rem] bg-[#d1a85d] px-5 py-4 text-sm font-semibold text-[#1d1730] transition hover:bg-[#c2994c] disabled:cursor-not-allowed disabled:bg-[#e5c78c] disabled:text-[#4a3727] disabled:opacity-100">
                  {ui.openShift}
                </button>
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-[#eadbca] bg-white p-5 shadow-[0_20px_60px_rgba(39,22,14,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-xs uppercase tracking-[0.3em] text-[#9d7848]">{ui.currentSale}</p><h3 className="mt-2 font-serif text-3xl text-[#25170f]">{ui.currentSale}</h3></div>
              <button onClick={clearSale} className="rounded-full border border-[#e0cfbc] px-4 py-2 text-sm font-semibold text-[#25170f] hover:bg-[#fbf5ee]">{ui.clearSale}</button>
            </div>
            <div className="mt-5 space-y-4">
              {cart.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-[#e0cfbc] px-4 py-10 text-center text-[#8b7762]">{ui.emptySale}</div>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="flex gap-4 rounded-[1.5rem] border border-[#efe3d4] p-4">
                    <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="font-semibold text-[#25170f]">{item.name}</p><p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#8f7558]">{item.sku || '-'}</p></div>
                        <button onClick={() => updateQuantity(item._id, 0)} className="text-sm font-semibold text-[#b94c4c]">{ui.remove}</button>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-[#e6d7c5] bg-[#fbf7f1]"><button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-3 py-2 text-lg text-[#25170f]">-</button><span className="px-4 text-sm font-semibold text-[#25170f]">{item.quantity}</span><button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-3 py-2 text-lg text-[#25170f]">+</button></div>
                        <p className="text-lg font-semibold text-[#25170f]">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#eadbca] bg-[linear-gradient(180deg,#fffaf5,#f5eadf)] p-5 shadow-[0_20px_60px_rgba(39,22,14,0.08)]">
            <h3 className="text-xs uppercase tracking-[0.3em] text-[#9d7848]">{ui.customerDetails}</h3>
            <p className="mt-3 text-sm leading-7 text-[#6f5b49]">{ui.walkInHint}</p>
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setCustomerName(ui.walkInCustomer)} className="rounded-full border border-[#dcc9b4] bg-[#fffaf5] px-4 py-2 text-xs font-semibold text-[#25170f] transition hover:bg-[#f4eadf]">{ui.walkInCustomer}</button>
                <button type="button" onClick={() => { setCustomerName(''); setCustomerPhone(''); setNotes(''); }} className="rounded-full border border-[#e7d7c4] bg-white px-4 py-2 text-xs font-semibold text-[#7a6653] transition hover:bg-[#fbf5ee]">{ui.clearCustomer}</button>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#25170f]">{ui.customerName}</label>
                <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder={ui.customerName} className="w-full rounded-2xl border border-[#dcc9b4] bg-white px-4 py-3 text-sm text-[#25170f] outline-none placeholder:text-[#9d8a75] focus:border-[#8b5e34]" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#25170f]">{ui.customerPhone}</label>
                <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder={ui.customerPhone} className="w-full rounded-2xl border border-[#dcc9b4] bg-white px-4 py-3 text-sm text-[#25170f] outline-none placeholder:text-[#9d8a75] focus:border-[#8b5e34]" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#25170f]">{ui.notes}</label>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={ui.notes} rows={3} className="w-full rounded-2xl border border-[#dcc9b4] bg-white px-4 py-3 text-sm text-[#25170f] outline-none placeholder:text-[#9d8a75] focus:border-[#8b5e34]" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#25170f]">{ui.paymentMethod}</label>
                <select
                  value={paymentMethod}
                  onChange={(event) => {
                    const nextMethod = event.target.value;
                    setPaymentMethod(nextMethod);
                    if (nextMethod !== 'mixed') {
                      setCashPart('');
                      setCardPart('');
                    } else {
                      setCashPart(String(totals.total || ''));
                      setCardPart('0');
                    }
                  }}
                  className="w-full rounded-2xl border border-[#dcc9b4] bg-white px-4 py-3 text-sm text-[#25170f] outline-none focus:border-[#8b5e34]"
                >
                  <option value="cash">{ui.cash}</option>
                  <option value="card">{ui.card}</option>
                  <option value="mixed">{ui.mixed}</option>
                </select>
              </div>
              {paymentMethod === 'mixed' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#25170f]">{ui.cashPart}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={cashPart}
                      onChange={(event) => setCashPart(event.target.value)}
                      className="w-full rounded-2xl border border-[#dcc9b4] bg-white px-4 py-3 text-sm text-[#25170f] outline-none placeholder:text-[#9d8a75] focus:border-[#8b5e34]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#25170f]">{ui.cardPart}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={cardPart}
                      onChange={(event) => setCardPart(event.target.value)}
                      className="w-full rounded-2xl border border-[#dcc9b4] bg-white px-4 py-3 text-sm text-[#25170f] outline-none placeholder:text-[#9d8a75] focus:border-[#8b5e34]"
                    />
                  </div>
                  <div className="sm:col-span-2 rounded-2xl border border-[#efe3d4] bg-[#fffaf5] px-4 py-4">
                    <div className="flex items-center justify-between gap-3 text-sm text-[#6f5b49]">
                      <span className="font-semibold">{ui.mixedBalance}</span>
                      <span className={`font-semibold ${Math.abs(mixedDifference) <= 0.01 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {formatPrice(mixedDifference)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#25170f]">{ui.discount}</label>
                <input type="number" min="0" step="0.01" value={discountAmount} onChange={(event) => setDiscountAmount(event.target.value)} placeholder={ui.discount} className="w-full rounded-2xl border border-[#dcc9b4] bg-white px-4 py-3 text-sm text-[#25170f] outline-none placeholder:text-[#9d8a75] focus:border-[#8b5e34]" />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#eadbca] bg-white p-5 shadow-[0_20px_60px_rgba(39,22,14,0.08)]">
            <h3 className="text-xs uppercase tracking-[0.3em] text-[#9d7848]">{ui.summary}</h3>
            {saleSuccessNotice ? (
              <div className="mt-4 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-900 shadow-sm">
                {saleSuccessNotice}
              </div>
            ) : null}
            <div className="mt-4 space-y-3 text-sm text-[#7a6653]">
              <div className="flex items-center justify-between"><span>{ui.subtotal}</span><span className="font-semibold text-[#25170f]">{formatPrice(totals.subtotal)}</span></div>
              <div className="flex items-center justify-between"><span>{ui.pieces}</span><span className="font-semibold text-[#25170f]">{totals.pieces}</span></div>
              <div className="flex items-center justify-between"><span>{ui.discount}</span><span className="font-semibold text-[#25170f]">{formatPrice(totals.appliedDiscount)}</span></div>
            </div>
            <div className="mt-5 rounded-[1.5rem] bg-[#f7efe5] px-4 py-4"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-[#7a6653]">{ui.total}</span><span className="text-2xl font-semibold text-[#25170f]">{formatPrice(totals.total)}</span></div></div>
            <button onClick={completeSale} disabled={saleButtonDisabled} className="mt-5 w-full rounded-[1.5rem] bg-[#2b1b12] px-5 py-4 text-sm font-semibold text-[#fff8ef] transition hover:bg-[#1d1730] disabled:cursor-not-allowed disabled:bg-[#8b7b70] disabled:text-[#f7efe6] disabled:opacity-100">{submitting ? ui.processing : ui.completeSale}</button>
            {saleDisabledReason ? (
              <p className="mt-3 text-center text-xs font-medium text-[#8b5e34]">{saleDisabledReason}</p>
            ) : null}
            {!currentShift ? (
              <button
                type="button"
                onClick={openShift}
                disabled={shiftLoading}
                className="mt-3 w-full rounded-[1.25rem] border border-[#d8c3aa] bg-[#fbf5ee] px-4 py-3 text-sm font-semibold text-[#25170f] transition hover:bg-[#f3e5d3] disabled:cursor-not-allowed disabled:bg-[#efe6dc] disabled:text-[#7a6653] disabled:opacity-100"
                >
                  {ui.openShiftNow}
                </button>
            ) : null}
          </section>

          <section className="rounded-[2rem] border border-[#eadbca] bg-white p-5 shadow-[0_20px_60px_rgba(39,22,14,0.08)]">
            <h3 className="text-xs uppercase tracking-[0.3em] text-[#9d7848]">{ui.salesLogToday}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] border border-emerald-100 bg-emerald-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">{ui.cashSales}</p>
                <p className="mt-2 text-xl font-semibold text-emerald-900">{formatPrice(summary.today?.cashSales || 0)}</p>
              </div>
              <div className="rounded-[1.25rem] border border-sky-200 bg-sky-50 px-4 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-700">{ui.cardSales}</p>
                <p className="mt-2 text-xl font-semibold text-sky-900">{formatPrice(summary.today?.cardSales || 0)}</p>
              </div>
              <div className="rounded-[1.25rem] border border-amber-100 bg-amber-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700">{ui.mixedSales}</p>
                <p className="mt-2 text-xl font-semibold text-amber-900">{formatPrice(summary.today?.mixedSales || 0)}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {(summary.recentTodaySales || []).length ? summary.recentTodaySales.map((sale) => {
                const badge = paymentBadge(sale.paymentMethod);
                return (
                  <div key={sale._id} className="rounded-[1.25rem] border border-[#efe3d4] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#25170f]">{sale.invoiceNumber || String(sale._id || '').slice(-8)}</p>
                        <p className="mt-1 text-xs text-[#8f7558]">{sale.customerName || '-'}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#8f7558]">
                      <span>{new Date(sale.createdAt).toLocaleTimeString()}</span>
                      <span>{ui.qty}: {sale.itemsCount || 0}</span>
                      <span className="text-sm font-semibold text-[#25170f]">{formatPrice(sale.total || 0)}</span>
                    </div>
                  </div>
                );
              }) : <p className="text-sm text-[#8b7762]">{ui.noRecentSales}</p>}
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#eadbca] bg-white p-5 shadow-[0_20px_60px_rgba(39,22,14,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs uppercase tracking-[0.3em] text-[#9d7848]">{ui.monthlyPerformance}</p><h3 className="mt-2 font-serif text-2xl text-[#25170f]">{ui.monthlyPerformance}</h3></div>
              <span className="rounded-full border border-[#eadbca] bg-[#fbf5ee] px-4 py-2 text-xs font-semibold text-[#7a6653]">{formatPrice(monthSales)}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] border border-[#efe3d4] bg-[#fffdf9] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.monthInvoicesLabel}</p>
                <p className="mt-2 text-xl font-semibold text-[#25170f]">{monthInvoices}</p>
              </div>
              <div className="rounded-[1.25rem] border border-[#efe3d4] bg-[#fffdf9] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.averageInvoice}</p>
                <p className="mt-2 text-xl font-semibold text-[#25170f]">{formatPrice(monthlyAverageTicket)}</p>
              </div>
              <div className="rounded-[1.25rem] border border-[#efe3d4] bg-[#fffdf9] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.bestSalesDay}</p>
                <p className="mt-2 text-sm font-semibold text-[#25170f]">{summary.month?.bestDay ? summary.month.bestDay.date : ui.noBestDay}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#eadbca] bg-white p-5 shadow-[0_20px_60px_rgba(39,22,14,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs uppercase tracking-[0.3em] text-[#9d7848]">{ui.lastSale}</p><h3 className="mt-2 font-serif text-2xl text-[#25170f]">{ui.lastSale}</h3></div>
              {lastOrder ? <button onClick={() => printReceipt(lastOrder)} className="rounded-full border border-[#d9c8af] px-4 py-2 text-sm font-semibold text-[#25170f] hover:bg-[#fbf5ee]">{ui.printReceipt}</button> : null}
            </div>
            {lastOrder ? (
              <div className="mt-4 space-y-2 text-sm text-[#7a6653]">
                <div className="flex items-center justify-between"><span>{ui.invoice}</span><span className="font-semibold text-[#25170f]">{lastOrder.invoiceNumber || String(lastOrder._id || '').slice(-8)}</span></div>
                <div className="flex items-center justify-between"><span>{ui.customer}</span><span className="font-semibold text-[#25170f]">{lastOrder.shippingAddress?.fullName || '-'}</span></div>
                <div className="flex items-center justify-between"><span>{ui.total}</span><span className="font-semibold text-[#25170f]">{formatPrice(lastOrder.total || 0)}</span></div>
                <button onClick={() => voidSale(lastOrder._id)} className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100">{ui.voidSale}</button>
              </div>
            ) : <p className="mt-4 text-sm text-[#8b7762]">{ui.noRecentSales}</p>}
          </section>

          <section className="rounded-[2rem] border border-[#eadbca] bg-white p-5 shadow-[0_20px_60px_rgba(39,22,14,0.08)]">
            <h3 className="text-xs uppercase tracking-[0.3em] text-[#9d7848]">{ui.recentSales}</h3>
            <div className="mt-4 space-y-3">{(summary.recentSales || []).length ? summary.recentSales.map((sale) => (<div key={sale._id} className="rounded-[1.25rem] border border-[#efe3d4] px-4 py-3"><div className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-[#25170f]">{sale.invoiceNumber || String(sale._id || '').slice(-8)}</span><div className="flex items-center gap-2"><span className="text-[#7a6653]">{formatPrice(sale.total || 0)}</span><button onClick={() => voidSale(sale._id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">{ui.voidSale}</button></div></div><div className="mt-2 flex items-center justify-between gap-3 text-xs text-[#8f7558]"><span>{sale.customerName || '-'}</span><span>{new Date(sale.createdAt).toLocaleTimeString()}</span></div></div>)) : <p className="text-sm text-[#8b7762]">{ui.noRecentSales}</p>}</div>
          </section>

          <section className="rounded-[2rem] border border-[#eadbca] bg-white p-5 shadow-[0_20px_60px_rgba(39,22,14,0.08)]">
            <h3 className="text-xs uppercase tracking-[0.3em] text-[#9d7848]">{ui.topProducts}</h3>
            <div className="mt-4 space-y-3">{(summary.topProducts || []).length ? summary.topProducts.map((item, index) => (<div key={`${item.product || index}`} className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-[#efe3d4] px-4 py-3"><div><p className="font-semibold text-[#25170f]">{item.name || '-'}</p><p className="mt-1 text-xs text-[#8f7558]">{ui.qty}: {item.quantity || 0}</p></div><span className="text-sm font-semibold text-[#25170f]">{formatPrice(item.revenue || 0)}</span></div>)) : <p className="text-sm text-[#8b7762]">{ui.noTopProducts}</p>}</div>
          </section>

          <section className="rounded-[2rem] border border-[#eadbca] bg-white p-5 shadow-[0_20px_60px_rgba(39,22,14,0.08)]">
            <div className="flex items-center justify-between gap-3"><h3 className="text-xs uppercase tracking-[0.3em] text-[#9d7848]">{ui.lowStock}</h3>{summary.month?.bestDay ? <span className="text-xs text-[#8f7558]">{ui.bestDay}: {summary.month.bestDay.date}</span> : null}</div>
            <div className="mt-4 space-y-3">{(summary.lowProducts || []).length ? summary.lowProducts.map((product) => { const stock = Number(product.stock || 0); const tone = getStockTone(stock); return <div key={product._id} className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-[#efe3d4] px-4 py-3"><div><p className="font-semibold text-[#25170f]">{getLocalizedValue(product.name)}</p><p className="mt-1 text-xs text-[#8f7558]">{ui.stock}: {stock}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.className}`}>{tone.label}</span></div>; }) : <p className="text-sm text-[#8b7762]">{ui.noLowStock}</p>}</div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CashierPOS;




