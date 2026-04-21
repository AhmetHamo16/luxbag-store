import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { orderService } from '../../services/orderService';
import useLangStore from '../../store/useLangStore';

const STATUS_FLOW = [
  'pending_payment',
  'pending',
  'confirmed',
  'processing',
  'out_for_delivery',
  'shipped',
  'delivered',
];

const STATUS_THEMES = {
  pending_payment: {
    accent: 'from-amber-200 via-[#e8c28c] to-[#c79145]',
    pill: 'bg-amber-100 text-amber-900',
  },
  pending: {
    accent: 'from-[#ead8c1] via-[#d9bb94] to-[#b7844d]',
    pill: 'bg-[#f1e5d6] text-[#5f3a1b]',
  },
  confirmed: {
    accent: 'from-emerald-200 via-emerald-300 to-emerald-500',
    pill: 'bg-emerald-100 text-emerald-900',
  },
  processing: {
    accent: 'from-[#d7d0ff] via-[#afa2ff] to-[#7f6ee8]',
    pill: 'bg-indigo-100 text-indigo-900',
  },
  out_for_delivery: {
    accent: 'from-sky-200 via-sky-300 to-sky-500',
    pill: 'bg-sky-100 text-sky-900',
  },
  shipped: {
    accent: 'from-blue-200 via-blue-300 to-blue-600',
    pill: 'bg-blue-100 text-blue-900',
  },
  delivered: {
    accent: 'from-[#d6f7e8] via-[#99e7be] to-[#2fb573]',
    pill: 'bg-green-100 text-green-900',
  },
  cancelled: {
    accent: 'from-rose-200 via-rose-300 to-rose-500',
    pill: 'bg-rose-100 text-rose-900',
  },
};

const getSafeImage = (item) => {
  if (typeof item?.image === 'string' && item.image.trim()) return item.image;
  if (typeof item?.productImage === 'string' && item.productImage.trim()) return item.productImage;
  if (typeof item?.image?.url === 'string' && item.image.url.trim()) return item.image.url;
  return '/placeholder.jpg';
};

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

  const content = {
    ar: {
      title: 'تم استلام طلبكم بأناقة',
      description:
        'رحلة طلبكم مع ميلورا بدأت الآن. من هذه الصفحة يمكنكم متابعة الحالة الحالية، تفاصيل الطلب، وأي تحديث جديد لحظة بلحظة.',
      eyebrow: 'MELORA ORDER',
      heroNote: 'تجربة متابعة أفخم، أوضح، وأكثر رقيًا.',
      paymentReference: 'مرجع الدفع',
      viewOrders: 'متابعة الطلب',
      continueShopping: 'متابعة التسوق',
      loadingStatus: 'جاري تحميل حالة الطلب...',
      statusUnavailable: 'حالة الطلب غير متاحة حاليًا.',
      uploadReceiptTitle: 'رفع إيصال الدفع',
      uploadReceiptDescription: 'ارفع صورة التحويل أو ملف PDF لتأكيد الطلب ومتابعة مراجعته بسرعة.',
      uploadReceiptAction: 'رفع إيصال الدفع',
      uploading: 'جاري الرفع...',
      receiptUploaded: 'تم رفع إيصال الدفع بنجاح',
      receiptUploadFailed: 'فشل رفع إيصال الدفع',
      orderJourney: 'رحلة الطلب',
      orderDetails: 'تفاصيل الطلب',
      items: 'المنتجات',
      currentStatus: 'الحالة الحالية',
      orderNumber: 'رقم الطلب',
      trackingNumber: 'رقم التتبع',
      trackHint: 'يمكنكم العودة إلى هذه الصفحة في أي وقت لمتابعة أحدث تطورات الطلب.',
      timelineHint: 'نحدّث حالة الطلب هنا كلما انتقل إلى مرحلة جديدة.',
      receiptPanel: 'تأكيد الدفع',
      summaryCard: 'ملخص أنيق لطلبكم',
      supportLine: 'فريق ميلورا يراجع طلبكم بعناية ليصلكم بأفضل صورة ممكنة.',
      productsCount: 'عدد القطع',
      receiptReady: 'تم استلام الإيصال',
    },
    tr: {
      title: 'Siparisiniz zarif bir sekilde alindi',
      description:
        'Melora siparis yolculugunuz simdi basladi. Bu sayfadan siparisinizin mevcut durumunu, urun detaylarini ve yeni guncellemeleri rahatlikla takip edebilirsiniz.',
      eyebrow: 'MELORA ORDER',
      heroNote: 'Daha guclu, daha seckin, daha zarif bir takip deneyimi.',
      paymentReference: 'Odeme Referansi',
      viewOrders: 'Siparisi Takip Et',
      continueShopping: 'Alisverise Devam Et',
      loadingStatus: 'Siparis durumu yukleniyor...',
      statusUnavailable: 'Siparis durumu su anda kullanilamiyor.',
      uploadReceiptTitle: 'Odeme Dekontu Yukle',
      uploadReceiptDescription: 'Siparisinizi hizli sekilde dogrulamak icin havale ekran goruntusunu veya PDF dekontunu yukleyin.',
      uploadReceiptAction: 'Odeme Dekontunu Yukle',
      uploading: 'Yukleniyor...',
      receiptUploaded: 'Odeme dekontu basariyla yuklendi',
      receiptUploadFailed: 'Odeme dekontu yuklenemedi',
      orderJourney: 'Siparis Yolculugu',
      orderDetails: 'Siparis Detaylari',
      items: 'Urunler',
      currentStatus: 'Guncel durum',
      orderNumber: 'Siparis numarasi',
      trackingNumber: 'Takip numarasi',
      trackHint: 'Siparisinizin en yeni guncellemelerini gormek icin bu sayfaya dilediginiz zaman donebilirsiniz.',
      timelineHint: 'Her yeni asamada siparis durumunu burada guncelliyoruz.',
      receiptPanel: 'Odeme dogrulamasi',
      summaryCard: 'Siparisiniz icin zarif bir ozet',
      supportLine: 'Melora ekibi siparisinizi ozenle inceliyor ve en iyi sekilde hazirliyor.',
      productsCount: 'Urun adedi',
      receiptReady: 'Dekont alindi',
    },
    en: {
      title: 'Your order has been received in style',
      description:
        'Your Melora order journey begins here. From this page, you can follow the latest status, order details, and every new update with ease.',
      eyebrow: 'MELORA ORDER',
      heroNote: 'A more elevated, refined, and premium tracking experience.',
      paymentReference: 'Payment Reference',
      viewOrders: 'Track This Order',
      continueShopping: 'Continue Shopping',
      loadingStatus: 'Loading order status...',
      statusUnavailable: 'Order status is not available right now.',
      uploadReceiptTitle: 'Upload Payment Receipt',
      uploadReceiptDescription: 'Upload your transfer screenshot or PDF receipt so your order can be reviewed more quickly.',
      uploadReceiptAction: 'Upload Payment Receipt',
      uploading: 'Uploading...',
      receiptUploaded: 'Receipt uploaded successfully',
      receiptUploadFailed: 'Failed to upload receipt',
      orderJourney: 'Order Journey',
      orderDetails: 'Order Details',
      items: 'Items',
      currentStatus: 'Current status',
      orderNumber: 'Order number',
      trackingNumber: 'Tracking number',
      trackHint: 'You can return to this page anytime to follow the latest progress of your order.',
      timelineHint: 'We update this journey every time your order moves to a new stage.',
      receiptPanel: 'Payment Confirmation',
      summaryCard: 'A refined overview of your order',
      supportLine: 'The Melora team is reviewing your order with care to deliver it in the best possible way.',
      productsCount: 'Total pieces',
      receiptReady: 'Receipt received',
    },
  }[language] || {};

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
    },
  }[language] || {};

  const statusDescriptions = {
    ar: {
      pending_payment: 'ننتظر مراجعة إشعار الدفع قبل الانتقال للخطوة التالية.',
      pending: 'تم استلام الطلب وهو الآن قيد المراجعة الأولية.',
      confirmed: 'تم اعتماد الطلب وبدء ترتيبات التجهيز.',
      processing: 'يجري تجهيز الطلب بعناية قبل الإرسال.',
      out_for_delivery: 'الطلب غادر وهو في الطريق إليكم.',
      shipped: 'تم تسليم الطلب لشركة الشحن.',
      delivered: 'اكتملت الرحلة وتم التسليم بنجاح.',
      cancelled: 'تم إلغاء هذا الطلب.',
    },
    tr: {
      pending_payment: 'Odeme bildiriminiz kontrol ediliyor.',
      pending: 'Siparisiniz alindi ve ilk inceleme asamasinda.',
      confirmed: 'Siparisiniz onaylandi ve hazirliga alindi.',
      processing: 'Siparisiniz ozenle hazirlaniyor.',
      out_for_delivery: 'Siparisiniz size dogru yolda.',
      shipped: 'Siparisiniz kargo firmasina teslim edildi.',
      delivered: 'Siparis yolculugu tamamlandi.',
      cancelled: 'Bu siparis iptal edildi.',
    },
    en: {
      pending_payment: 'We are reviewing your payment confirmation.',
      pending: 'Your order has been received and is under first review.',
      confirmed: 'Your order has been approved and moved into preparation.',
      processing: 'Your order is being prepared with care.',
      out_for_delivery: 'Your order is already on its way to you.',
      shipped: 'Your order has been handed to the shipping carrier.',
      delivered: 'Your order journey has been completed successfully.',
      cancelled: 'This order has been cancelled.',
    },
  }[language] || {};

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

  const currentStatus = orderStatus?.status || 'pending';
  const currentStatusLabel = statusLabels[currentStatus] || currentStatus;
  const currentTheme = STATUS_THEMES[currentStatus] || STATUS_THEMES.pending;

  const timelineSteps = useMemo(() => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    const finalIndex = currentIndex === -1 ? 1 : currentIndex;

    return STATUS_FLOW.filter((status) => status !== 'pending_payment' || orderStatus?.paymentMethod === 'iban' || currentStatus === 'pending_payment')
      .map((status, index) => {
        const stepIndex = STATUS_FLOW.indexOf(status);
        const reached = currentStatus === 'cancelled' ? false : stepIndex <= finalIndex;
        const active = status === currentStatus;
        return {
          key: status,
          label: statusLabels[status] || status,
          description: statusDescriptions[status] || '',
          reached,
          active,
          index,
        };
      });
  }, [currentStatus, orderStatus?.paymentMethod, statusDescriptions, statusLabels]);

  return (
    <div className="relative overflow-hidden bg-[#f7f1ea] px-4 py-10 text-[var(--text-primary)] md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-[-10%] top-0 h-72 w-72 rounded-full bg-[#ead8c4] blur-3xl" />
        <div className="absolute right-[-5%] top-24 h-80 w-80 rounded-full bg-[#d7bb9b] blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#efe4d8] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[34px] border border-[#ead8c4] bg-[#fffaf5] shadow-[0_25px_80px_rgba(76,45,24,0.10)]">
          <div className={`bg-gradient-to-br ${currentTheme.accent} px-6 py-10 text-white md:px-10`}>
            <div className="max-w-3xl">
              <p className="mb-4 text-xs uppercase tracking-[0.5em] text-white/80">{content.eyebrow}</p>
              <h1 className="mb-4 max-w-2xl font-serif text-4xl leading-tight md:text-6xl">{content.title}</h1>
              <p className="max-w-2xl text-sm leading-7 text-white/85 md:text-base">{content.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${currentTheme.pill}`}>
                  {currentStatusLabel}
                </span>
                <span className="rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/80">
                  {content.heroNote}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-8 px-6 py-8 md:px-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-8">
              {id && (
                <div className="rounded-[28px] border border-[#ead8c4] bg-[#fffdf9] p-6 shadow-sm">
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.34em] text-[#9a7657]">{content.orderJourney}</p>
                      <h2 className="font-serif text-2xl text-[#28170f]">{content.summaryCard}</h2>
                    </div>
                    <p className="max-w-sm text-sm leading-7 text-[#7a6350]">{content.timelineHint}</p>
                  </div>

                  {statusLoading ? (
                    <p className="text-sm text-[#7a6350]">{content.loadingStatus}</p>
                  ) : orderStatus ? (
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-[22px] border border-[#efe2d5] bg-white p-5">
                          <p className="mb-2 text-xs uppercase tracking-[0.26em] text-[#9a7657]">{content.orderNumber}</p>
                          <p className="break-all text-sm font-semibold text-[#28170f]">{orderStatus.invoiceNumber || orderStatus._id}</p>
                        </div>
                        <div className="rounded-[22px] border border-[#efe2d5] bg-white p-5">
                          <p className="mb-2 text-xs uppercase tracking-[0.26em] text-[#9a7657]">{content.currentStatus}</p>
                          <p className="text-sm font-semibold text-[#28170f]">{currentStatusLabel}</p>
                        </div>
                        <div className="rounded-[22px] border border-[#efe2d5] bg-white p-5">
                          <p className="mb-2 text-xs uppercase tracking-[0.26em] text-[#9a7657]">{content.productsCount}</p>
                          <p className="text-sm font-semibold text-[#28170f]">{Array.isArray(orderStatus.items) ? orderStatus.items.length : 0}</p>
                        </div>
                      </div>

                      {orderStatus.trackingNumber ? (
                        <div className="rounded-[24px] border border-[#efe2d5] bg-white p-5">
                          <p className="mb-2 text-xs uppercase tracking-[0.26em] text-[#9a7657]">{content.trackingNumber}</p>
                          <p className="text-sm font-semibold text-[#28170f]">{orderStatus.trackingNumber}</p>
                        </div>
                      ) : null}

                      <div className="rounded-[24px] border border-[#efe2d5] bg-white p-5">
                        <div className="space-y-5">
                          {timelineSteps.map((step) => (
                            <div key={step.key} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                                    step.active
                                      ? 'border-[#3d2416] bg-[#3d2416] text-white'
                                      : step.reached
                                        ? 'border-[#b88654] bg-[#f3e6d7] text-[#5d3b22]'
                                        : 'border-[#e8d7c4] bg-[#fbf6f0] text-[#c5ae96]'
                                  }`}
                                >
                                  {step.reached ? '•' : step.index + 1}
                                </div>
                                {step.index !== timelineSteps.length - 1 ? (
                                  <div className={`mt-2 h-10 w-px ${step.reached ? 'bg-[#d1b18b]' : 'bg-[#eee2d4]'}`} />
                                ) : null}
                              </div>
                              <div className="pb-2">
                                <p className={`text-sm font-semibold ${step.active ? 'text-[#28170f]' : 'text-[#6d5542]'}`}>{step.label}</p>
                                <p className="mt-1 max-w-xl text-sm leading-7 text-[#8a715c]">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <p className="text-sm leading-7 text-[#7a6350]">{content.trackHint}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-[#7a6350]">{content.statusUnavailable}</p>
                  )}
                </div>
              )}

              {Array.isArray(orderStatus?.items) && orderStatus.items.length > 0 ? (
                <div className="rounded-[28px] border border-[#ead8c4] bg-[#fffdf9] p-6 shadow-sm">
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.34em] text-[#9a7657]">{content.orderDetails}</p>
                      <h2 className="font-serif text-2xl text-[#28170f]">{content.items}</h2>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {orderStatus.items.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex items-center gap-4 rounded-[22px] border border-[#efe2d5] bg-white p-4"
                      >
                        <img
                          src={getSafeImage(item)}
                          alt={item.name}
                          className="h-20 w-20 rounded-[18px] object-cover"
                          onError={(event) => {
                            event.currentTarget.src = '/placeholder.jpg';
                          }}
                        />
                        <div className="min-w-0 flex-1 text-left">
                          <p className="truncate font-medium text-[#28170f]">{item.name}</p>
                          <p className="mt-1 text-sm text-[#8a715c]">x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="space-y-6">
              {paymentIntent ? (
                <div className="rounded-[28px] border border-[#ead8c4] bg-[#fffdf9] p-6 shadow-sm">
                  <p className="mb-2 text-xs uppercase tracking-[0.34em] text-[#9a7657]">{content.paymentReference}</p>
                  <p className="break-all text-sm font-semibold text-[#28170f]">{paymentIntent.id}</p>
                </div>
              ) : null}

              {id && !uploadSuccess ? (
                <div className="rounded-[28px] border border-[#ead8c4] bg-[#fffdf9] p-6 shadow-sm">
                  <p className="mb-2 text-xs uppercase tracking-[0.34em] text-[#9a7657]">{content.receiptPanel}</p>
                  <h3 className="font-serif text-2xl text-[#28170f]">{content.uploadReceiptTitle}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#7a6350]">{content.uploadReceiptDescription}</p>

                  <div className="mt-5 rounded-[22px] border border-dashed border-[#d7bea2] bg-[#fcf7f1] p-4 text-left">
                    <input
                      type="file"
                      accept="image/jpeg, image/png, application/pdf"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="block w-full text-sm text-[#7a6350] file:mr-4 file:rounded-full file:border-0 file:bg-[#f3e8db] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#4a2c17] hover:file:bg-[#ead7bf]"
                    />
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className="mt-5 w-full rounded-full bg-[#2f1f15] px-6 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-[#6b4a31] disabled:opacity-50"
                  >
                    {isUploading ? content.uploading : content.uploadReceiptAction}
                  </button>
                </div>
              ) : null}

              {uploadSuccess ? (
                <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                  <p className="mb-2 text-xs uppercase tracking-[0.34em] text-emerald-700">{content.receiptPanel}</p>
                  <h3 className="font-serif text-2xl text-emerald-950">{content.receiptReady}</h3>
                  <p className="mt-3 text-sm leading-7 text-emerald-800">{content.receiptUploaded}</p>
                </div>
              ) : null}

              <div className="rounded-[28px] border border-[#ead8c4] bg-[#2c1d14] p-6 text-white shadow-sm">
                <p className="mb-2 text-xs uppercase tracking-[0.34em] text-[#d8b792]">{content.orderDetails}</p>
                <h3 className="font-serif text-2xl">{content.supportLine}</h3>
                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    to={id ? `/order-confirmation/${id}` : '/shop'}
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#2c1d14] transition hover:bg-[#f2e7da]"
                  >
                    {content.viewOrders}
                  </Link>
                  <Link
                    to="/shop"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
                  >
                    {content.continueShopping}
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrderSuccess;
