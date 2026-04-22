import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { backendOrigin } from '../../../services/api';
import { orderService } from '../../../services/orderService';
import Loader from '../../../components/shared/Loader';
import useTranslation from '../../../hooks/useTranslation';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import useCurrencyStore from '../../../store/useCurrencyStore';
import { resolveAssetUrl as resolveSharedAssetUrl } from '../../../utils/assets';

const OrderList = () => {
  const { t, language } = useTranslation('admin');
  const formatPrice = useCurrencyStore((state) => state.formatPrice);
  const ui = {
    en: {
      exportCsv: 'Export CSV',
      apply: 'Apply',
      pendingPayment: 'Pending Payment',
      guestCustomer: 'Guest Customer',
      noEmail: 'No email provided',
      verify: 'Verify',
      reject: 'Reject',
      noOrders: 'No orders strictly match this server query.',
      previous: 'Previous',
      next: 'Next',
      orderTimeline: 'Order Timeline',
      customerShipping: 'Customer & Shipping',
      paymentInfo: 'Payment Info',
      orderItems: 'Order Items',
      printAddress: 'Print Address',
      printInvoice: 'Print Invoice',
      verifyReceipt: 'Verify Receipt',
      rejectReceipt: 'Reject Receipt',
      fullPageView: 'Full Page View',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      noPhone: 'No phone provided',
      failedExport: 'Failed to export CSV',
      failedStatus: 'Failed to update status',
      selectStatus: 'Select a status',
      selectOrder: 'Select at least one order',
      failedOrderDetails: 'Failed to load order details',
    },
    ar: {
      exportCsv: 'تصدير CSV',
      apply: 'تطبيق',
      pendingPayment: 'بانتظار الدفع',
      guestCustomer: 'عميل ضيف',
      noEmail: 'لا يوجد بريد إلكتروني',
      verify: 'تأكيد',
      reject: 'رفض',
      noOrders: 'لا توجد طلبات مطابقة لهذا البحث.',
      previous: 'السابق',
      next: 'التالي',
      orderTimeline: 'مخطط الطلب',
      customerShipping: 'العميل والشحن',
      paymentInfo: 'معلومات الدفع',
      orderItems: 'عناصر الطلب',
      printAddress: 'طباعة العنوان',
      printInvoice: 'طباعة الفاتورة',
      verifyReceipt: 'تأكيد الإيصال',
      rejectReceipt: 'رفض الإيصال',
      fullPageView: 'عرض الصفحة الكاملة',
      name: 'الاسم',
      email: 'البريد',
      phone: 'الهاتف',
      address: 'العنوان',
      noPhone: 'لا يوجد رقم هاتف',
      failedExport: 'فشل تصدير الملف',
      failedStatus: 'فشل تحديث الحالة',
      selectStatus: 'اختر الحالة',
      selectOrder: 'اختر طلبًا واحدًا على الأقل',
      failedOrderDetails: 'فشل تحميل تفاصيل الطلب',
    },
    tr: {
      exportCsv: 'CSV Disa Aktar',
      apply: 'Uygula',
      pendingPayment: 'Odeme Bekleniyor',
      guestCustomer: 'Misafir Musteri',
      noEmail: 'E-posta yok',
      verify: 'Onayla',
      reject: 'Reddet',
      noOrders: 'Bu sorguya uyan siparis bulunamadi.',
      previous: 'Geri',
      next: 'Ileri',
      orderTimeline: 'Siparis Akisi',
      customerShipping: 'Musteri ve Teslimat',
      paymentInfo: 'Odeme Bilgisi',
      orderItems: 'Siparis Urunleri',
      printAddress: 'Adres Yazdir',
      printInvoice: 'Fatura Yazdir',
      verifyReceipt: 'Dekontu Onayla',
      rejectReceipt: 'Dekontu Reddet',
      fullPageView: 'Tam Sayfa Ac',
      name: 'Ad',
      email: 'E-posta',
      phone: 'Telefon',
      address: 'Adres',
      noPhone: 'Telefon yok',
      failedExport: 'CSV disa aktarilamadi',
      failedStatus: 'Durum guncellenemedi',
      selectStatus: 'Bir durum secin',
      selectOrder: 'En az bir siparis secin',
      failedOrderDetails: 'Siparis detaylari yuklenemedi',
    },
  }[language];
  const fixedUi = {
    ar: {
      exportCsv: 'تصدير CSV',
      apply: 'تطبيق',
      pendingPayment: 'بانتظار الدفع',
      guestCustomer: 'عميل ضيف',
      noEmail: 'لا يوجد بريد إلكتروني',
      verify: 'تأكيد',
      reject: 'رفض',
      noOrders: 'لا توجد طلبات مطابقة لهذا البحث.',
      previous: 'السابق',
      next: 'التالي',
      orderTimeline: 'مسار الطلب',
      customerShipping: 'العميل والشحن',
      paymentInfo: 'معلومات الدفع',
      orderItems: 'عناصر الطلب',
      printAddress: 'طباعة العنوان',
      printInvoice: 'طباعة الفاتورة',
      verifyReceipt: 'تأكيد الإيصال',
      rejectReceipt: 'رفض الإيصال',
      fullPageView: 'عرض الصفحة الكاملة',
      name: 'الاسم',
      email: 'البريد',
      phone: 'الهاتف',
      address: 'العنوان',
      noPhone: 'لا يوجد رقم هاتف',
      failedExport: 'فشل تصدير الملف',
      failedStatus: 'فشل تحديث الحالة',
      selectStatus: 'اختر الحالة',
      selectOrder: 'اختر طلبًا واحدًا على الأقل',
      failedOrderDetails: 'فشل تحميل تفاصيل الطلب',
    },
    tr: {
      exportCsv: 'CSV Dışa Aktar',
      pendingPayment: 'Ödeme Bekleniyor',
      guestCustomer: 'Misafir Müşteri',
      noOrders: 'Bu sorguya uyan sipariş bulunamadı.',
      next: 'İleri',
      orderTimeline: 'Sipariş Akışı',
      customerShipping: 'Müşteri ve Teslimat',
      paymentInfo: 'Ödeme Bilgisi',
      orderItems: 'Sipariş Ürünleri',
      printAddress: 'Adres Yazdır',
      printInvoice: 'Fatura Yazdır',
      fullPageView: 'Tam Sayfa Aç',
      failedExport: 'CSV dışa aktarılamadı',
      failedStatus: 'Durum güncellenemedi',
      selectStatus: 'Bir durum seçin',
      selectOrder: 'En az bir sipariş seçin',
      failedOrderDetails: 'Sipariş detayları yüklenemedi',
    },
  }[language] || {};
  const uiText = { ...ui, ...fixedUi };
  const statusLabels = {
    en: {
      All: 'All',
      pending_payment: 'Pending Payment',
      pending: 'New Order',
      confirmed: 'Order Confirmed',
      processing: 'Your order is being prepared',
      out_for_delivery: 'Your order is on the way',
      shipped: 'Your order is on the way',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    },
    ar: {
      All: 'الكل',
      pending_payment: 'بانتظار الدفع',
      pending: 'طلب جديد',
      confirmed: 'تم تأكيد الطلب',
      processing: 'طلبك يتجهز',
      out_for_delivery: 'طلبك عالطريق',
      shipped: 'طلبك عالطريق',
      delivered: 'تم التسليم',
      cancelled: 'ملغي',
    },
    tr: {
      All: 'Tum Siparisler',
      pending_payment: 'Odeme Bekleniyor',
      pending: 'Yeni Siparis',
      confirmed: 'Siparis Onaylandi',
      processing: 'Siparis hazirlaniyor',
      out_for_delivery: 'Siparis yolda',
      shipped: 'Siparis yolda',
      delivered: 'Teslim edildi',
      cancelled: 'Iptal edildi',
    },
  };
  const getStatusLabel = (status) => statusLabels[language]?.[status] || t?.common?.[status] || status;
  const resolveOrderItemImage = (item) => resolveSharedAssetUrl(
    item?.image || item?.product?.images?.[0]?.url || item?.product?.images?.[0],
    ''
  );
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Server-side State Logic
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null, message: '', title: '' });

  const limit = 15;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAllOrders(searchTerm, statusFilter, page, limit);
      setOrders(res.data);
      setTotalPages(res.pages);
      setTotalRecords(res.total);
      setSelectedIds([]); // Reset selection on fetch
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

   
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]); // search fires manually via button click or Enter key to prevent heavy DB hits

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    fetchOrders();
  };

  const handleExportCSV = async () => {
    try {
      const url = orderService.exportOrdersCSV();
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'orders.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
    } catch (err) {
      toast.error(uiText.failedExport);
      console.error(err);
    }
  };


  const handleStatusChangeClick = (id, newStatus) => {
    const currentOrder = orders.find((entry) => entry._id === id) || selectedOrder;
    if (['out_for_delivery', 'shipped'].includes(newStatus) && currentOrder?.payment?.method === 'iban' && currentOrder?.payment?.status !== 'paid') {
      toast.error(language === 'ar' ? 'لا يمكن شحن طلب التحويل البنكي قبل تأكيد الدفع.' : language === 'tr' ? 'Banka havalesi siparişi ödeme onayı olmadan kargolanamaz.' : 'This bank-transfer order must be marked paid before shipping.');
      return;
      toast.error(language === 'ar' ? 'لا يمكن شحن طلب التحويل البنكي قبل تأكيد الدفع.' : language === 'tr' ? 'Banka havalesi siparisi odeme onayi olmadan kargolanamaz.' : 'This bank-transfer order must be marked paid before shipping.');
      return;
    }

    const title = language === 'ar'
      ? 'تحديث حالة الطلب'
      : language === 'tr'
        ? 'Siparis Durumunu Guncelle'
        : 'Update Order Status';
    const message = language === 'ar'
      ? `هل تريد تغيير حالة الطلب إلى ${newStatus}؟`
      : language === 'tr'
        ? `Siparis durumu ${newStatus} olarak guncellensin mi?`
        : `Change order status to ${getStatusLabel(newStatus)}?`;
    const safeTitle = language === 'ar' ? 'تحديث حالة الطلب' : language === 'tr' ? 'Sipariş Durumunu Güncelle' : title;
    const safeMessage = language === 'ar' ? `هل تريد تغيير حالة الطلب إلى ${newStatus}؟` : language === 'tr' ? `Sipariş durumu ${newStatus} olarak güncellensin mi?` : message;

    setConfirmModal({
       isOpen: true,
       data: { id, newStatus, trackingNumber: null },
       title: safeTitle,
       message: safeMessage
    });
  };

  const executeStatusChange = async () => {
    const { id, newStatus } = confirmModal.data;
    let trackingNumber = null;
    
    setConfirmModal({ ...confirmModal, isOpen: false });

    if (['out_for_delivery', 'shipped'].includes(newStatus)) {
      const safeTrackingPrompt = language === 'ar' ? 'أدخل رقم التتبع لهذا الشحن. يمكنك تركه فارغًا إذا أردت.' : language === 'tr' ? 'Bu kargo için takip numarasını girin. İsterseniz boş bırakabilirsiniz.' : (t?.orders?.trackingPrompt || 'Enter tracking number for this shipment (optional):');
      trackingNumber = window.prompt(safeTrackingPrompt, '');
      if (trackingNumber === null) return;
      try {
        await orderService.updateOrderStatus(id, newStatus, trackingNumber);
        toast.success(language === 'ar' ? `تم تحديث حالة الطلب إلى ${getStatusLabel(newStatus)}` : language === 'tr' ? `Sipariş durumu ${getStatusLabel(newStatus)} olarak güncellendi` : `Order marked as ${getStatusLabel(newStatus)}`);
        fetchOrders();
        if (selectedOrder && selectedOrder._id === id) {
          fetchOrderDetails(id);
        }
      } catch (err) {
        console.error(err);
        toast.error(uiText.failedStatus);
      }
      return;
    }

    try {
      await orderService.updateOrderStatus(id, newStatus, trackingNumber);
      toast.success(language === 'ar' ? `تم تحديث حالة الطلب إلى ${getStatusLabel(newStatus)}` : language === 'tr' ? `Sipariş durumu ${getStatusLabel(newStatus)} olarak güncellendi` : `Order marked as ${getStatusLabel(newStatus)}`);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === id) {
        fetchOrderDetails(id);
      }
    } catch (err) {
      console.error(err);
      toast.error(uiText.failedStatus);
    }
    return;

    if (['out_for_delivery', 'shipped'].includes(newStatus)) {
       trackingNumber = window.prompt(
         language === 'ar'
           ? 'أدخل رقم التتبع لهذا الشحن. يمكنك تركه فارغًا إذا أردت.'
           : language === 'tr'
             ? 'Bu kargo icin takip numarasini girin. Isterseniz bos birakabilirsiniz.'
             : (t?.orders?.trackingPrompt || 'Enter tracking number for this shipment (optional):'),
         ''
       );
       if (trackingNumber === null) return;
    }

    try {
      await orderService.updateOrderStatus(id, newStatus, trackingNumber);
      toast.success(
        language === 'ar'
          ? `تم تحديث حالة الطلب إلى ${newStatus}`
          : language === 'tr'
            ? `Siparis durumu ${newStatus} olarak guncellendi`
            : `Order marked as ${getStatusLabel(newStatus)}`
      );
      fetchOrders();
      if (selectedOrder && selectedOrder._id === id) {
        fetchOrderDetails(id);
      }
    } catch (err) {
      console.error(err);
      toast.error(ui.failedStatus);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(orders.map(o => o._id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id, e) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleBulkStatusUpdateClick = async () => {
    if (!bulkStatus) return toast.error(uiText.selectStatus);
    if (selectedIds.length === 0) return toast.error(uiText.selectOrder);

    setConfirmModal({
       isOpen: true,
       data: 'bulk',
       title: language === 'ar' ? 'تأكيد التحديث الجماعي' : language === 'tr' ? 'Toplu Güncellemeyi Onayla' : 'Confirm Bulk Update',
       message: language === 'ar'
         ? `هل تريد تحديث ${selectedIds.length} طلبات إلى ${bulkStatus}؟`
         : language === 'tr'
           ? `${selectedIds.length} siparis ${bulkStatus} durumuna guncellensin mi?`
           : `Update ${selectedIds.length} orders to ${getStatusLabel(bulkStatus)}?`
    });
  };

  const executeBulkStatusChange = async () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    try {
      setLoading(true);
      for (const id of selectedIds) {
        await orderService.updateOrderStatus(id, bulkStatus, null);
      }
      toast.success(
        language === 'ar'
          ? `تم تحديث ${selectedIds.length} طلبات إلى ${bulkStatus}`
          : language === 'tr'
            ? `${selectedIds.length} siparis ${bulkStatus} durumuna guncellendi`
            : `${selectedIds.length} orders updated to ${getStatusLabel(bulkStatus)}`
      );
      setBulkStatus('');
      fetchOrders();
    } catch (err) {
      console.error("Bulk action failed", err);
      toast.error(
        language === 'ar'
          ? 'فشل تحديث بعض الطلبات أو كلها.'
          : language === 'tr'
            ? 'Toplu guncelleme kismen veya tamamen basarisiz oldu.'
            : 'Bulk update failed partially or completely.'
      );
      fetchOrders();
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = () => {
    if (confirmModal.data === 'bulk') {
       executeBulkStatusChange();
    } else {
       executeStatusChange();
    }
  };

  const fetchOrderDetails = async (id) => {
    try {
      setModalLoading(true);
      setIsModalOpen(true);
      const res = await orderService.getOrderById(id);
      setSelectedOrder(res.data);
    } catch (err) {
      console.error("Failed to load order details", err);
      toast.error(uiText.failedOrderDetails);
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const openModal = (id, e) => {
    if (e) {
      // Prevent opening modal if clicking on select/checkbox/buttons
      if (['INPUT', 'SELECT', 'BUTTON', 'A'].includes(e.target.tagName)) return;
    }
    fetchOrderDetails(id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };


  const statusColors = {
    'pending_payment': 'bg-red-600 text-white',
    'pending': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-cyan-100 text-cyan-800',
    'processing': 'bg-blue-100 text-blue-800',
    'out_for_delivery': 'bg-violet-100 text-violet-800',
    'shipped': 'bg-indigo-100 text-indigo-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
  };

  const resolveAssetUrl = (value) => {
    if (!value) return '';
    if (typeof value === 'object') {
      return value.url ? resolveAssetUrl(value.url) : '';
    }
    if (typeof value === 'string' && value.includes('\\uploads\\')) {
      return `${backendOrigin}${value.slice(value.lastIndexOf('\\uploads\\')).replace(/\\/g, '/')}`;
    }
    if (typeof value === 'string' && value.startsWith('/uploads/')) {
      return `${backendOrigin}${value}`;
    }
    return value;
  };

  const getShippingLabelHtml = (order) => {
    const customerName = order.user?.name || order.shippingAddress?.fullName || 'Guest Customer';
    const email = order.user?.email || order.shippingAddress?.email || 'No email provided';
    const phone = order.shippingAddress?.phone || 'No phone provided';
    const street = order.shippingAddress?.street || '';
    const cityLine = `${order.shippingAddress?.city || ''}${order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} ${order.shippingAddress?.zipCode || ''}`.trim();
    const country = order.shippingAddress?.country || '';

    return `<!DOCTYPE html>
      <html>
        <head>
          <title>Shipping Label - ${order._id}</title>
          <style>
            body { font-family: Georgia, 'Times New Roman', serif; padding: 28px; color: #24150f; background: #f7f0e7; }
            .card { border: 1px solid #c8ab86; padding: 28px; max-width: 540px; background: linear-gradient(180deg, #fffdf8 0%, #f8f1e7 100%); box-shadow: 0 18px 40px rgba(74, 44, 23, 0.12); }
            .muted { color: #8b6b46; font-size: 11px; text-transform: uppercase; letter-spacing: 0.28em; margin: 0 0 10px; }
            .value { font-size: 18px; line-height: 1.8; }
            .title { font-size: 30px; margin: 0 0 20px; color: #2c1810; }
            .order { margin-top: 20px; font-size: 13px; color: #6e5437; letter-spacing: 0.08em; text-transform: uppercase; }
            .rule { height: 1px; background: linear-gradient(90deg, #c8ab86 0%, transparent 100%); margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <p class="muted">Shipping Label</p>
            <h1 class="title">${customerName}</h1>
            <div class="rule"></div>
            <div class="value">
              <div>${phone}</div>
              <div>${email}</div>
              <div style="margin-top:12px;">${street}</div>
              <div>${cityLine}</div>
              <div>${country}</div>
            </div>
            <div class="order">Order: ${order._id}</div>
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>`;
  };

  const printShippingLabel = (order) => {
    const printWindow = window.open('', '_blank', 'width=720,height=900');
    if (!printWindow) {
      toast.error('Unable to open print window');
      return;
    }
    printWindow.document.write(getShippingLabelHtml(order));
    printWindow.document.close();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif text-black">{t?.orders?.title || 'Order Management'}</h1>
        <button onClick={handleExportCSV} className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gold transition-colors shadow-sm flex items-center gap-2">
          {uiText.exportCsv}
        </button>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded overflow-hidden">
        
        {/* Toolbar / Search Header */}
        <div className="p-4 border-b border-gray-100 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{selectedIds.length} Selected</span>
            <select 
              value={bulkStatus} 
              onChange={(e) => setBulkStatus(e.target.value)} 
              className="border border-gray-300 p-2 text-sm focus:outline-none focus:border-black bg-white disabled:opacity-50"
              disabled={selectedIds.length === 0}
            >
              <option value="">-- {language === 'ar' ? 'تحديث جماعي للحالة' : language === 'tr' ? 'Toplu Durum Guncelle' : 'Bulk Status Update'} --</option>
              <option value="pending">{getStatusLabel('pending')}</option>
              <option value="confirmed">{getStatusLabel('confirmed')}</option>
              <option value="processing">{getStatusLabel('processing')}</option>
              <option value="out_for_delivery">{getStatusLabel('out_for_delivery')}</option>
              <option value="delivered">{getStatusLabel('delivered')}</option>
              <option value="cancelled">{getStatusLabel('cancelled')}</option>
            </select>
            {bulkStatus && (
              <button onClick={handleBulkStatusUpdateClick} className="bg-black text-white px-4 py-1.5 text-xs uppercase font-bold tracking-wider hover:bg-gold transition-colors">{uiText.apply}</button>
            )}
          </div>

          <form onSubmit={handleSearch} className="flex w-full md:w-96">
            <input 
              type="text" 
              placeholder={t?.common?.search || "Search by ID, Name, Email..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black transition-colors rounded-l border-r-0"
            />
            <button type="submit" className="bg-black text-white px-4 text-sm font-medium hover:bg-gray-800 transition-colors rounded-r">
              {t?.common?.search || 'Search'}
            </button>
          </form>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50 overflow-x-auto">
          {['All', 'pending_payment', 'pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => { setStatusFilter(tab); setPage(1); }}
              className={`px-6 py-3 text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-colors border-b-2 ${statusFilter === tab ? 'border-brand text-brand bg-white' : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-100'}`}
            >
              {getStatusLabel(tab)}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <Loader />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1a2e] text-white text-xs uppercase tracking-wider">
                  <th className="px-4 py-4 w-10 text-center rounded-tl-sm">
                    <input type="checkbox" onChange={handleSelectAll} checked={orders.length > 0 && selectedIds.length === orders.length} className="w-4 h-4 accent-[#8B6914]" />
                  </th>
                  <th className="px-6 py-4 font-medium">{t?.orders?.orderId || 'Order UUID'} / {t?.orders?.customer || 'Customer'}</th>
                  <th className="px-6 py-4 font-medium">{t?.common?.date || 'Date Issued'}</th>
                  <th className="px-6 py-4 font-medium">{t?.orders?.items || 'Items'} / {t?.orders?.total || 'Total'}</th>
                  <th className="px-6 py-4 font-medium">{t?.common?.status || 'Status Check'}</th>
                  <th className="px-6 py-4 font-medium text-right rounded-tr-sm">{t?.common?.actions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.length > 0 ? orders.map((order, index) => (
                  <tr key={order._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors cursor-pointer group`} onClick={(e) => openModal(order._id, e)}>
                    <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.includes(order._id)} onChange={(e) => handleSelectOne(order._id, e)} className="w-4 h-4 accent-[#8B6914]" />
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-black truncate max-w-[150px] font-mono">{order._id}</div>
                      <div className="text-sm text-gray-800 font-medium mt-1">{order.user?.name || order.shippingAddress?.fullName || uiText.guestCustomer}</div>
                      <div className="text-xs text-gray-500">{order.user?.email || order.shippingAddress?.email || uiText.noEmail}</div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 font-medium">{order.items?.length || 0} Items</div>
                      <div className="text-sm font-bold text-black mt-1">{formatPrice(order.total || 0)}</div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                          {order.status === 'pending_payment' ? `● ${uiText.pendingPayment}` : getStatusLabel(order.status)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${order.payment?.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                          PAY: {order.payment?.status || 'UNKNOWN'}
                        </span>
                        {(order.receiptUrl || order.payment?.receiptImage) && (
                          <a 
                            href={resolveAssetUrl(order.receiptUrl || order.payment?.receiptImage)} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-green-600 text-white shadow-sm hover:bg-green-700 transition"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Receipt Uploaded
                          </a>
                        )}
                        <span className="text-[10px] text-gray-500 font-mono uppercase bg-gray-50 px-1 rounded border border-gray-200">
                          {order.payment?.method || 'N/A'}
                        </span>
                      </div>
                    </td>
                    
                     <td className="px-6 py-4 text-sm text-right align-top" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-end gap-2">
                         <select 
                           value={order.status}
                           onChange={(e) => handleStatusChangeClick(order._id, e.target.value)}
                           className="border border-gray-300 p-1.5 text-xs focus:outline-none focus:border-black bg-white w-32 cursor-pointer rounded-sm font-medium"
                         >
                           <option value="pending">{getStatusLabel('pending')}</option>
                           <option value="confirmed">{getStatusLabel('confirmed')}</option>
                           <option value="processing">{getStatusLabel('processing')}</option>
                           <option value="out_for_delivery">{getStatusLabel('out_for_delivery')}</option>
                           <option value="delivered">{getStatusLabel('delivered')}</option>
                           <option value="cancelled">{getStatusLabel('cancelled')}</option>
                         </select>
                         
                         <div className="flex flex-col items-center gap-2 mt-2 w-full justify-end">
                           {order.payment?.method === 'iban' && order.status === 'pending_payment' && (
                             <div className="grid w-full grid-cols-2 gap-2">
                               <button onClick={() => handleStatusChangeClick(order._id, 'confirmed')} className="bg-green-600 text-white w-full px-3 py-1.5 rounded-sm hover:bg-green-700 text-[10px] font-bold uppercase tracking-wider shadow-sm transition-colors text-center">
                                 {uiText.verify}
                               </button>
                               <button onClick={() => handleStatusChangeClick(order._id, 'cancelled')} className="bg-red-600 text-white w-full px-3 py-1.5 rounded-sm hover:bg-red-700 text-[10px] font-bold uppercase tracking-wider shadow-sm transition-colors text-center">
                                 {uiText.reject}
                               </button>
                             </div>
                           )}
                           <button onClick={(e) => openModal(order._id, e)} className="bg-brand text-white w-full px-3 py-1.5 rounded-sm hover:bg-gold text-xs font-bold uppercase tracking-wider shadow-sm transition-colors text-center">
                             {language === 'ar' ? 'عرض سريع' : language === 'tr' ? 'Hizli Gorunum' : 'Quick View'}
                           </button>
                           <button onClick={(e) => { e.stopPropagation(); window.open(`/admin/orders/${order._id}?print=true`, '_blank'); }} className="bg-gray-800 text-white w-full px-3 py-1.5 rounded-sm hover:bg-black text-xs font-bold uppercase tracking-wider shadow-sm transition-colors text-center">
                             {uiText.printInvoice}
                           </button>
                         </div>
                      </div>
                    </td>
                    
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">{uiText.noOrders}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Backend Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 gap-4 bg-gray-50">
           <span>Total Mongoose Matches: <strong className="text-black">{totalRecords}</strong> db records</span>
           
           <div className="flex space-x-1 items-center">
             <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium rounded-sm text-black"
             >
                {uiText.previous}
             </button>
             
             <span className="px-3 py-1 font-medium text-black">
                Page {page} of {totalPages === 0 ? 1 : totalPages}
             </span>
             
             <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || totalPages === 0}
                className="px-3 py-1 border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium rounded-sm text-black"
             >
                {uiText.next}
             </button>
           </div>
        </div>

      </div>

      {/* Order Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-serif text-brand">Order #{selectedOrder?._id}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6">
              {modalLoading || !selectedOrder ? (
                <div className="py-12"><Loader /></div>
              ) : (
                <div className="space-y-8">
                  {/* Timeline View */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">{uiText.orderTimeline}</h3>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative">
                      <div className="absolute left-[50%] md:left-0 md:top-1/2 md:-translate-y-1/2 h-full md:h-1 w-1 md:w-full bg-gray-200 -z-10"></div>
                      
                      {['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered'].map((step, idx) => {
                        const statusOrder = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered'];
                        const currentStatus = selectedOrder.status === 'shipped' ? 'out_for_delivery' : selectedOrder.status;
                        const currentStatusIdx = statusOrder.indexOf(currentStatus);
                        const isCompleted = currentStatusIdx >= idx;
                        const isCancelled = selectedOrder.status === 'cancelled';
                        
                        let bgColor = isCompleted ? 'bg-brand' : 'bg-gray-200';
                        if (isCancelled && idx > 0) bgColor = 'bg-gray-200';
                        if (isCancelled && idx === 0) bgColor = 'bg-red-500';

                        return (
                          <div key={step} className="flex flex-col items-center bg-white px-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${bgColor}`}>
                              {isCompleted && !isCancelled ? '✓' : (isCancelled && idx === 0 ? '✗' : idx + 1)}
                            </div>
                            <span className={`text-xs font-bold uppercase mt-2 ${isCompleted && !isCancelled ? 'text-brand' : (isCancelled && idx===0 ? 'text-red-500' : 'text-gray-400')}`}>
                              {isCancelled && idx === 0 ? getStatusLabel('cancelled') : getStatusLabel(step)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Order Items & Info Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="font-bold text-sm text-gray-700 uppercase">{uiText.customerShipping}</h4>
                        <button
                          onClick={() => printShippingLabel(selectedOrder)}
                          className="rounded-full border border-[#c9ab83] bg-gradient-to-r from-[#1f130d] via-[#4a2c17] to-[#7b5532] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#f7efe4] shadow-[0_10px_26px_rgba(74,44,23,0.15)] transition-all duration-300 hover:-translate-y-0.5"
                        >
                          {uiText.printAddress}
                        </button>
                      </div>
                      <p className="text-sm"><strong>{uiText.name}:</strong> {selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName || uiText.guestCustomer}</p>
                      <p className="text-sm"><strong>{uiText.email}:</strong> {selectedOrder.user?.email || selectedOrder.shippingAddress?.email || uiText.noEmail}</p>
                      <p className="text-sm"><strong>{uiText.phone}:</strong> {selectedOrder.shippingAddress?.phone || uiText.noPhone}</p>
                      <p className="text-sm mt-2"><strong>{uiText.address}:</strong><br/>
                        {selectedOrder.shippingAddress?.street}<br/>
                        {selectedOrder.shippingAddress?.city}{selectedOrder.shippingAddress?.state ? `, ${selectedOrder.shippingAddress.state}` : ''} {selectedOrder.shippingAddress?.zipCode}<br/>
                        {selectedOrder.shippingAddress?.country}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="font-bold text-sm text-gray-700 uppercase mb-3">{uiText.paymentInfo}</h4>
                      <p className="text-sm flex items-center gap-2">
                        <strong>Status:</strong> 
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${selectedOrder.payment?.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-800'}`}>
                          {selectedOrder.payment?.status}
                        </span>
                      </p>
                      <p className="text-sm mt-2"><strong>Method:</strong> {selectedOrder.payment?.method?.toUpperCase()}</p>
                      <p className="text-sm mt-2"><strong>Total Amount:</strong> <span className="font-bold border-b border-gray-300 pb-0.5">{formatPrice(selectedOrder.totalAmount || selectedOrder.total || 0)}</span></p>
                      {selectedOrder.payment?.receiptImage && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2"><strong>Transfer Receipt:</strong></p>
                          <a href={resolveAssetUrl(selectedOrder.payment.receiptImage)} target="_blank" rel="noreferrer" className="inline-block">
                            <img loading="lazy" src={resolveAssetUrl(selectedOrder.payment.receiptImage)} alt="Transfer receipt" className="w-32 h-32 object-cover rounded border border-gray-200 shadow-sm" />
                          </a>
                        </div>
                      )}
                      {selectedOrder.trackingNumber && (
                        <p className="text-sm mt-2"><strong>Tracking:</strong> {selectedOrder.trackingNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div>
                    <h4 className="font-bold text-sm text-gray-700 uppercase mb-3 border-b pb-2">{uiText.orderItems}</h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm border border-gray-100 p-3 rounded">
                          <div className="flex items-center gap-3">
                            {resolveOrderItemImage(item) && (
                              <img loading="lazy" src={resolveOrderItemImage(item)} alt={item.name} className="w-12 h-12 rounded object-cover" />
                            )}
                            <div>
                              <p className="font-bold text-brand">{item.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity} | {item.color && `Color: ${item.color}`} {item.size && `Size: ${item.size}`}</p>
                            </div>
                          </div>
                          <p className="font-bold">${((item.price || item.product?.price) * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                     {selectedOrder.payment?.method === 'iban' && selectedOrder.status === 'pending_payment' && (
                       <>
                         <button onClick={() => handleStatusChangeClick(selectedOrder._id, 'confirmed')} className="px-4 py-2 bg-green-600 text-white text-sm font-medium hover:bg-green-700 rounded">{uiText.verifyReceipt}</button>
                         <button onClick={() => handleStatusChangeClick(selectedOrder._id, 'cancelled')} className="px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 rounded">{uiText.rejectReceipt}</button>
                       </>
                     )}
                     <Link to={`/admin/orders/${selectedOrder._id}`} className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50 rounded">{uiText.fullPageView}</Link>
                     <button onClick={() => printShippingLabel(selectedOrder)} className="rounded-full border border-[#c9ab83] bg-gradient-to-r from-[#1f130d] via-[#4a2c17] to-[#7b5532] px-5 py-2.5 text-sm font-bold uppercase tracking-[0.24em] text-[#f7efe4] shadow-[0_12px_30px_rgba(74,44,23,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(74,44,23,0.24)]">{uiText.printAddress}</button>
                     <button onClick={() => window.open(`/admin/orders/${selectedOrder._id}?print=true`, '_blank')} className="rounded-full border border-[#d9c8af] bg-white px-5 py-2.5 text-sm font-bold uppercase tracking-[0.24em] text-[#2c1810] shadow-[0_10px_24px_rgba(36,21,15,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#fcf7f0]">{uiText.printInvoice}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type="warning"
        confirmText={language === 'ar' ? 'تأكيد' : language === 'tr' ? 'Onayla' : 'Confirm'}
      />
    </div>
  );
};

export default OrderList;
