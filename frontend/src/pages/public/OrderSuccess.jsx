import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api from '../../services/api';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';
import useLangStore from '../../store/useLangStore';

const OrderSuccess = () => {
  const { id } = useParams();
  const location = useLocation();
  const paymentIntent = location.state?.paymentIntent;
  const language = useLangStore((state) => state.language);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(Boolean(id));

  useEffect(() => {
    let isMounted = true;

    const loadOrderStatus = async () => {
      if (!id) {
        setStatusLoading(false);
        return;
      }

      try {
        setStatusLoading(true);
        const response = await orderService.getPublicOrderStatus(id);
        if (isMounted) {
          setOrderStatus(response.data || null);
        }
      } catch (error) {
        if (isMounted) {
          setOrderStatus(null);
        }
      } finally {
        if (isMounted) {
          setStatusLoading(false);
        }
      }
    };

    loadOrderStatus();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const statusLabels = {
    ar: {
      pending_payment: 'بانتظار تأكيد الدفع',
      pending: 'تم استلام الطلب',
      confirmed: 'تم قبول الطلب',
      processing: 'الطلب يتحضر',
      out_for_delivery: 'الطلب في الطريق',
      shipped: 'الطلب في الشحن',
      delivered: 'تم التسليم',
      cancelled: 'تم إلغاء الطلب',
      trackingNumber: 'رقم التتبع',
      orderNumber: 'رقم الطلب',
      currentStatus: 'الحالة الحالية',
      items: 'المنتجات',
      trackHint: 'يمكنك الرجوع إلى هذه الصفحة في أي وقت لمتابعة طلبك.',
    },
    tr: {
      pending_payment: 'Odeme onayi bekleniyor',
      pending: 'Siparis alindi',
      confirmed: 'Siparis onaylandi',
      processing: 'Siparis hazirlaniyor',
      out_for_delivery: 'Siparis yolda',
      shipped: 'Siparis kargoda',
      delivered: 'Teslim edildi',
      cancelled: 'Iptal edildi',
      trackingNumber: 'Takip numarasi',
      orderNumber: 'Siparis numarasi',
      currentStatus: 'Guncel durum',
      items: 'Urunler',
      trackHint: 'Siparisinizi takip etmek icin bu sayfaya istediginiz zaman donebilirsiniz.',
    },
    en: {
      pending_payment: 'Waiting for payment confirmation',
      pending: 'Order received',
      confirmed: 'Order approved',
      processing: 'Order is being prepared',
      out_for_delivery: 'Order is on the way',
      shipped: 'Order is in shipment',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      trackingNumber: 'Tracking number',
      orderNumber: 'Order number',
      currentStatus: 'Current status',
      items: 'Items',
      trackHint: 'You can return to this page anytime to follow your order updates.',
    },
  }[language] || {};

  const content = {
    ar: {
      title: 'شكراً لطلبك!',
      description: 'تم استلام طلبك بنجاح. سنراجع تفاصيل الطلب ونرسل لك التحديثات قريباً.',
      paymentReference: 'مرجع الدفع',
      viewOrders: 'عرض طلباتي',
      continueShopping: 'متابعة التسوق',
      loadingStatus: 'جاري تحميل حالة الطلب...',
      statusUnavailable: 'حالة الطلب غير متاحة حالياً.',
      uploadReceiptTitle: 'رفع إيصال الدفع',
      uploadReceiptDescription: 'ارفع صورة التحويل أو ملف PDF لتأكيد الطلب.',
      uploadReceiptAction: 'رفع إيصال الدفع',
      uploading: 'جاري الرفع...',
      receiptUploaded: 'تم رفع إيصال الدفع بنجاح',
      receiptUploadFailed: 'فشل رفع إيصال الدفع',
    },
    tr: {
      title: 'Siparisiniz Icin Tesekkurler!',
      description: 'Siparisiniz basariyla alindi. Siparis detaylarinizi yakinda sizinle paylasacagiz.',
      paymentReference: 'Odeme Referansi',
      viewOrders: 'Siparislerimi Gor',
      continueShopping: 'Alisverise Devam Et',
      loadingStatus: 'Siparis durumu yukleniyor...',
      statusUnavailable: 'Siparis durumu su anda kullanilamiyor.',
      uploadReceiptTitle: 'Odeme Dekontu Yukle',
      uploadReceiptDescription: 'Siparisi onaylamak icin havale ekran goruntusunu veya PDF belgesini yukleyin.',
      uploadReceiptAction: 'Odeme Dekontunu Yukle',
      uploading: 'Yukleniyor...',
      receiptUploaded: 'Odeme dekontu basariyla yuklendi',
      receiptUploadFailed: 'Odeme dekontu yuklenemedi',
    },
    en: {
      title: 'Thank You For Your Order!',
      description: "Your order has been successfully placed. We'll review it and send you updates shortly.",
      paymentReference: 'Payment Reference',
      viewOrders: 'View My Orders',
      continueShopping: 'Continue Shopping',
      loadingStatus: 'Loading order status...',
      statusUnavailable: 'Order status is not available right now.',
      uploadReceiptTitle: 'Upload Payment Receipt',
      uploadReceiptDescription: 'Please upload your transfer screenshot or PDF document to confirm the order.',
      uploadReceiptAction: 'Upload Payment Receipt',
      uploading: 'Uploading...',
      receiptUploaded: 'Receipt uploaded successfully',
      receiptUploadFailed: 'Failed to upload receipt',
    },
  }[language] || {
    title: 'Thank You For Your Order!',
    description: "Your order has been successfully placed. We'll review it and send you updates shortly.",
    paymentReference: 'Payment Reference',
    viewOrders: 'View My Orders',
    continueShopping: 'Continue Shopping',
    loadingStatus: 'Loading order status...',
    statusUnavailable: 'Order status is not available right now.',
    uploadReceiptTitle: 'Upload Payment Receipt',
    uploadReceiptDescription: 'Please upload your transfer screenshot or PDF document to confirm the order.',
    uploadReceiptAction: 'Upload Payment Receipt',
    uploading: 'Uploading...',
    receiptUploaded: 'Receipt uploaded successfully',
    receiptUploadFailed: 'Failed to upload receipt',
  };

  const handleUpload = async () => {
    if (!file || !id) return;
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('receipt', file);
      await api.post(`/orders/${id}/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadSuccess(true);
      toast.success(content.receiptUploaded);
    } catch (err) {
      console.error(err);
      toast.error(content.receiptUploadFailed);
    } finally {
      setIsUploading(false);
    }
  };

  const currentStatusLabel = orderStatus?.status
    ? (statusLabels[orderStatus.status] || orderStatus.status)
    : '';

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center text-[var(--text-primary)]">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>

      <h1 className="mb-4 text-4xl font-serif text-[var(--text-primary)]">{content.title}</h1>
      <p className="mb-8 max-w-md text-[var(--text-secondary)]">{content.description}</p>

      {id && (
        <div className="mb-8 w-full max-w-2xl rounded-[24px] border border-[#e8d7c2] bg-[#fdfaf6] p-6 text-left shadow-sm">
          {statusLoading ? (
            <p className="text-sm text-gray-500">{content.loadingStatus}</p>
          ) : orderStatus ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[18px] border border-[#eadcc8] bg-white p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#8b5e34]">
                    {statusLabels.orderNumber}
                  </p>
                  <p className="text-sm font-medium text-[#2b1911]">
                    {orderStatus.invoiceNumber || orderStatus._id}
                  </p>
                </div>
                <div className="rounded-[18px] border border-[#eadcc8] bg-white p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#8b5e34]">
                    {statusLabels.currentStatus}
                  </p>
                  <p className="text-sm font-medium text-[#2b1911]">{currentStatusLabel}</p>
                </div>
              </div>

              {orderStatus.trackingNumber ? (
                <div className="rounded-[18px] border border-[#eadcc8] bg-white p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#8b5e34]">
                    {statusLabels.trackingNumber}
                  </p>
                  <p className="text-sm font-medium text-[#2b1911]">{orderStatus.trackingNumber}</p>
                </div>
              ) : null}

              {Array.isArray(orderStatus.items) && orderStatus.items.length > 0 ? (
                <div className="rounded-[18px] border border-[#eadcc8] bg-white p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#8b5e34]">
                    {statusLabels.items}
                  </p>
                  <div className="space-y-2">
                    {orderStatus.items.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex items-center justify-between text-sm text-[#2b1911]"
                      >
                        <span>{item.name}</span>
                        <span>x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <p className="text-sm text-gray-500">{statusLabels.trackHint}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">{content.statusUnavailable}</p>
          )}
        </div>
      )}

      {paymentIntent && (
        <div className="mb-8 w-full max-w-sm rounded border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-left">
          <p className="mb-1 text-sm text-[var(--text-secondary)]">{content.paymentReference}</p>
          <p className="truncate font-medium text-[var(--text-primary)]">{paymentIntent.id}</p>
        </div>
      )}

      {id && !uploadSuccess && (
        <div className="mb-8 w-full max-w-md rounded-[20px] border border-[#e8d7c2] bg-[#fdfaf6] p-6 shadow-sm">
          <h3 className="mb-4 font-serif text-lg text-[#2b1911]">{content.uploadReceiptTitle}</h3>
          <p className="mb-4 text-sm text-gray-500">{content.uploadReceiptDescription}</p>
          <div className="mb-4 text-left">
            <input
              type="file"
              accept="image/jpeg, image/png, application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-[#f3e8db] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#4a2c17] hover:file:bg-[#ead7bf]"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full rounded bg-[#4A2C17] py-3 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-[#8B6914] disabled:opacity-50"
          >
            {isUploading ? content.uploading : content.uploadReceiptAction}
          </button>
        </div>
      )}

      {uploadSuccess && (
        <div className="mb-8 w-full max-w-md rounded border border-green-200 bg-green-50 p-4">
          <p className="flex items-center justify-center gap-2 font-medium text-green-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {content.receiptUploaded}
          </p>
        </div>
      )}

      <div className="space-x-4">
        <Link
          to="/shop"
          className="inline-block bg-[#2f1f15] px-8 py-3 font-medium uppercase tracking-widest text-white transition-colors hover:bg-gold"
        >
          {content.viewOrders}
        </Link>
        <Link
          to="/shop"
          className="inline-block border border-[var(--border-color)] bg-[var(--bg-card)] px-8 py-3 font-medium uppercase tracking-widest transition-colors hover:opacity-90"
        >
          {content.continueShopping}
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
