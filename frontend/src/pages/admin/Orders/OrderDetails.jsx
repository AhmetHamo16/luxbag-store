import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { backendOrigin } from '../../../services/api';
import { orderService } from '../../../services/orderService';
import Loader from '../../../components/shared/Loader';
import useTranslation from '../../../hooks/useTranslation';
import useCurrencyStore from '../../../store/useCurrencyStore';
import toast from 'react-hot-toast';

const OrderDetails = () => {
  const { t, language } = useTranslation('admin');
  const formatPrice = useCurrencyStore((state) => state.formatPrice);
  const ui = {
    en: {
      loadError: 'Failed to load order details',
      statusError: 'Failed to update status',
      trackingError: 'Failed to bind tracking.',
      paidError: 'Failed to mark as paid',
      guestCustomer: 'Guest Customer',
      noEmail: 'No email provided',
      printAddress: 'Print Address',
      printInvoice: 'Print Invoice',
      placedOn: 'Placed on',
      verifyCodPaid: 'Verify COD Paid',
      confirmPayment: 'Confirm Payment',
      rejectPayment: 'Reject Payment',
      markShipped: 'Mark as Shipped',
      markDelivered: 'Mark as Delivered',
      cancelOrder: 'Cancel Order',
      subtotal: 'Subtotal',
      grandTotal: 'Grand Total',
      statusTracking: 'Status & Tracking',
      fulfillmentState: 'Fulfillment State',
      paymentState: 'Payment State',
      enlargeHint: 'Click image to enlarge',
      trackingToken: 'Tracking Token',
      unassignedSequence: 'Unassigned Sequence',
      customerProfile: 'Customer Profile',
      shippingDestination: 'Shipping Destination',
    },
    ar: {
      loadError: 'فشل تحميل تفاصيل الطلب',
      statusError: 'فشل تحديث الحالة',
      trackingError: 'فشل حفظ رقم التتبع',
      paidError: 'فشل تحديث حالة الدفع',
      guestCustomer: 'عميل ضيف',
      noEmail: 'لا يوجد بريد إلكتروني',
      printAddress: 'طباعة العنوان',
      printInvoice: 'طباعة الفاتورة',
      placedOn: 'تم إنشاء الطلب بتاريخ',
      verifyCodPaid: 'تأكيد دفع COD',
      confirmPayment: 'تأكيد الدفع',
      rejectPayment: 'رفض الدفع',
      markShipped: 'تحديده كمشحون',
      markDelivered: 'تحديده كمسلّم',
      cancelOrder: 'إلغاء الطلب',
      subtotal: 'الإجمالي الفرعي',
      grandTotal: 'الإجمالي النهائي',
      statusTracking: 'الحالة والتتبع',
      fulfillmentState: 'حالة التنفيذ',
      paymentState: 'حالة الدفع',
      enlargeHint: 'اضغط على الصورة للتكبير',
      trackingToken: 'رمز التتبع',
      unassignedSequence: 'لم يتم تعيينه بعد',
      customerProfile: 'بيانات العميل',
      shippingDestination: 'عنوان الشحن',
    },
    tr: {
      loadError: 'Siparis detaylari yuklenemedi',
      statusError: 'Durum guncellenemedi',
      trackingError: 'Takip numarasi kaydedilemedi',
      paidError: 'Odeme guncellenemedi',
      guestCustomer: 'Misafir Musteri',
      noEmail: 'E-posta yok',
      printAddress: 'Adres Yazdir',
      printInvoice: 'Fatura Yazdir',
      placedOn: 'Olusturma tarihi',
      verifyCodPaid: 'COD Odemesini Onayla',
      confirmPayment: 'Odemeyi Onayla',
      rejectPayment: 'Odemeyi Reddet',
      markShipped: 'Kargolandi Olarak Isaretle',
      markDelivered: 'Teslim Edildi Olarak Isaretle',
      cancelOrder: 'Siparisi Iptal Et',
      subtotal: 'Ara Toplam',
      grandTotal: 'Genel Toplam',
      statusTracking: 'Durum ve Takip',
      fulfillmentState: 'Siparis Durumu',
      paymentState: 'Odeme Durumu',
      enlargeHint: 'Buyutmek icin gorseli tiklayin',
      trackingToken: 'Takip Kodu',
      unassignedSequence: 'Henuz atanmadi',
      customerProfile: 'Musteri Profili',
      shippingDestination: 'Teslimat Adresi',
    },
  }[language];
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrderById(id);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || ui.loadError);
    } finally {
      setLoading(false);
    }
  };

   
  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    let trackingNumber = order.trackingNumber || null;
    if (newStatus === 'shipped' && !trackingNumber) {
      trackingNumber = window.prompt("Enter tracking number for this shipment (optional):");
    }

    if (window.confirm(`Update this order's status to ${newStatus}?`)) {
      try {
        await orderService.updateOrderStatus(order._id, newStatus, trackingNumber);
        fetchOrder();
      } catch (err) {
        console.error(err);
        toast.error(ui.statusError);
      }
    }
  };

  const updateTracking = async () => {
     let trackingNumber = window.prompt("Update tracking number:", order.trackingNumber || "");
     if (trackingNumber !== null) {
        try {
           await orderService.updateOrderStatus(order._id, order.status, trackingNumber);
           fetchOrder();
        } catch {
           toast.error(ui.trackingError);
        }
     }
  };

  const handleManualPayment = async () => {
    if (window.confirm(t?.orders?.verifyCodConfirm || 'Mark this Cash On Delivery (COD) order as officially Paid?')) {
      try {
        await orderService.markAsPaid(order._id);
        fetchOrder();
      } catch (err) {
        console.error(err);
        toast.error(ui.paidError);
      }
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you certain you want to forcefully cancel this order? This action is heavily audited.')) {
      try {
        await orderService.cancelOrder(order._id);
        fetchOrder();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to cancel order');
      }
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const printShippingLabel = () => {
    const customerName = order.user?.name || order.shippingAddress?.fullName || ui.guestCustomer;
    const email = order.user?.email || order.shippingAddress?.email || ui.noEmail;
    const phone = order.shippingAddress?.phone || 'No phone provided';
    const street = order.shippingAddress?.street || '';
    const cityLine = `${order.shippingAddress?.city || ''}${order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} ${order.shippingAddress?.zipCode || ''}`.trim();
    const country = order.shippingAddress?.country || '';

    const printWindow = window.open('', '_blank', 'width=720,height=900');
    if (!printWindow) {
      toast.error('Unable to open print window');
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
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
      </html>`);
    printWindow.document.close();
  };

  const resolveAssetUrl = (value) => {
    if (!value) return '';
    if (typeof value === 'object') return resolveAssetUrl(value.url);
    if (typeof value === 'string' && value.includes('\\uploads\\')) {
      return `${backendOrigin}${value.slice(value.lastIndexOf('\\uploads\\')).replace(/\\/g, '/')}`;
    }
    if (typeof value === 'string' && value.startsWith('/uploads/')) {
      return `${backendOrigin}${value}`;
    }
    return value;
  };

  if (loading) return <div className="p-8"><Loader /></div>;
  if (error) return <div className="p-8 text-red-600 font-medium">Error: {error}</div>;
  if (!order) return <div className="p-8 text-black">Order not found.</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12 print:p-0">
      
      {/* Header and Controls - Hidden When Printing */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 print:hidden">
        <div>
          <Link to="/admin/orders" className="text-sm font-medium text-gray-500 hover:text-black mb-2 inline-block">
            &larr; {t?.common?.back || 'Back'}
          </Link>
          <h1 className="text-3xl font-serif text-black tracking-tight">{t?.orders?.title || 'Order'} #{order._id}</h1>
          <p className="text-sm text-gray-500 mt-1">{ui.placedOn} {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {order.payment?.method === 'cod' && order.payment?.status !== 'paid' && (
            <button 
              onClick={handleManualPayment}
              className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 text-sm font-bold rounded shadow-sm transition-colors"
            >
              {ui.verifyCodPaid}
            </button>
          )}

          {order.payment?.method === 'iban' && order.status === 'pending_payment' && (
            <>
              <button 
                onClick={() => handleStatusChange('processing')}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 text-sm font-bold rounded shadow-sm transition-colors"
              >
                {ui.confirmPayment}
              </button>
              <button 
                onClick={() => handleStatusChange('cancelled')}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 text-sm font-bold rounded shadow-sm transition-colors"
              >
                {ui.rejectPayment}
              </button>
            </>
          )}

          {order.status === 'processing' && (
            <button 
              onClick={() => handleStatusChange('shipped')}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm font-bold rounded shadow-sm transition-colors"
            >
              {ui.markShipped}
            </button>
          )}
          
          {order.status === 'shipped' && (
            <button 
              onClick={() => handleStatusChange('delivered')}
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 text-sm font-bold rounded shadow-sm transition-colors"
            >
              {ui.markDelivered}
            </button>
          )}
          
          <button 
            onClick={printShippingLabel}
            className="rounded-full border border-[#c9ab83] bg-gradient-to-r from-[#1f130d] via-[#4a2c17] to-[#7b5532] px-5 py-2.5 text-sm font-bold uppercase tracking-[0.24em] text-[#f7efe4] shadow-[0_12px_30px_rgba(74,44,23,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(74,44,23,0.24)]"
          >
            {ui.printAddress}
          </button>

          <button 
            onClick={printInvoice}
            className="flex items-center gap-2 rounded-full border border-[#d9c8af] bg-white px-5 py-2.5 text-sm font-bold uppercase tracking-[0.24em] text-[#2c1810] shadow-[0_10px_24px_rgba(36,21,15,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#fcf7f0]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.728 9H17.27a.75.75 0 01.75.75v5.5a.75.75 0 01-.75.75H6.728a.75.75 0 01-.75-.75v-5.5a.75.75 0 01.75-.75z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h3a2.25 2.25 0 0 1 2.25 2.25V9m-6.75 12h6.75a2.25 2.25 0 0 0 2.25-2.25v-2.625H5.25v2.625A2.25 2.25 0 0 0 7.5 21Z" />
            </svg>
            {ui.printInvoice}
          </button>
          
          {order.status !== 'cancelled' && (
            <button 
              onClick={handleCancelOrder}
              className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-sm font-bold rounded shadow-sm transition-colors"
            >
              {ui.cancelOrder}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Items and Transaction Summary */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white border border-gray-200 rounded p-6 print:border-none print:shadow-none">
            <h2 className="text-lg font-serif mb-6 border-b pb-2">{t?.orders?.items || 'Items'}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500">
                    <th className="pb-3 font-medium">Item Details</th>
                    <th className="pb-3 font-medium">Subdocument UUID</th>
                    <th className="pb-3 font-medium text-center">Qty</th>
                    <th className="pb-3 font-medium text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-4">
                        <div className="font-medium text-black">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-1 capitalize">
                          {item.color && <span>Color: {item.color} </span>}
                          {item.size && <span> | Size: {item.size}</span>}
                        </div>
                      </td>
                      <td className="py-4 text-xs font-mono text-gray-400">
                        {item.variant || item.product?._id || "Root Schema"}
                      </td>
                      <td className="py-4 text-center text-sm font-medium">{item.quantity}</td>
                      <td className="py-4 text-right text-sm font-medium">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 border-t pt-6 flex flex-col items-end w-full space-y-2 text-sm">
              <div className="flex justify-between w-64 text-gray-600">
                <span>{ui.subtotal}</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between w-64 text-gray-600">
                <span>Shipping</span>
                <span>{formatPrice(order.shippingCost || 0)}</span>
              </div>
              <div className="flex justify-between w-64 text-xl font-medium text-black pt-2 border-t">
                <span>{ui.grandTotal}</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: Information Cards */}
        <div className="space-y-6">
          
          <div className="bg-white border border-gray-200 rounded p-6 shadow-sm print:border-black print:shadow-none">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 border-b pb-2">{ui.statusTracking}</h2>
            
            <div className="mb-4">
              <p className="text-xs text-gray-400 uppercase mb-1">{ui.fulfillmentState}</p>
              <select 
                 value={order.status}
                 onChange={(e) => handleStatusChange(e.target.value)}
                 className="w-full border border-gray-300 p-2 text-sm font-medium uppercase tracking-wide bg-gray-50 print:appearance-none print:border-none print:bg-white"
              >
                 <option value="pending">{t?.common?.pending || 'Pending'}</option>
                 <option value="processing">{t?.common?.processing || 'Processing'}</option>
                 <option value="shipped">{t?.common?.shipped || 'Shipped'}</option>
                 <option value="delivered">{t?.common?.delivered || 'Delivered'}</option>
                 <option value="cancelled">{t?.common?.cancelled || 'Cancelled'}</option>
              </select>
            </div>
            
            <div className="mb-2 border-t pt-4">
              <p className="text-xs text-gray-400 uppercase mb-1">{ui.paymentState}</p>
              <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                   <span className={`px-2 py-1 rounded text-xs font-bold tracking-wide uppercase ${order.payment?.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {order.payment?.status}
                   </span>
                   <span className="text-xs text-gray-500 font-mono uppercase bg-gray-50 px-2 py-1 border border-gray-200 rounded">
                      {order.payment?.method}
                   </span>
                 </div>
                 {order.payment?.receiptImage && (
                   <div className="mt-2">
                     <p className="text-xs text-gray-400 uppercase mb-1">Transfer Receipt</p>
                     <img loading="lazy" src={resolveAssetUrl(order.payment.receiptImage)} alt="Receipt" className="w-full max-w-xs border border-gray-200 rounded shadow-sm cursor-pointer" onClick={() => window.open(resolveAssetUrl(order.payment.receiptImage), '_blank')} />
                     <p className="text-[10px] text-gray-400 mt-1">{ui.enlargeHint}</p>
                   </div>
                 )}
              </div>
            </div>
            
            <div className="mt-6 border-t pt-4">
               <div className="flex justify-between items-center mb-1">
                 <p className="text-xs text-gray-400 uppercase">{ui.trackingToken}</p>
                 <button onClick={updateTracking} className="text-[10px] text-blue-600 font-bold hover:underline print:hidden">Edit Array</button>
               </div>
               <p className="text-sm font-mono text-black font-medium break-all bg-gray-50 p-2 border rounded">
                 {order.trackingNumber || ui.unassignedSequence}
               </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded p-6 shadow-sm print:border-black print:shadow-none">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 border-b pb-2">{ui.customerProfile}</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase">Target UID</p>
                <p className="font-mono text-black">{order.user?._id || 'Guest Order'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Registered Name</p>
                <p className="font-medium text-black capitalize">{order.user?.name || order.shippingAddress?.fullName || ui.guestCustomer}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Email Identity</p>
                {(order.user?.email || order.shippingAddress?.email) ? (
                  <a href={`mailto:${order.user?.email || order.shippingAddress?.email}`} className="text-blue-600 hover:underline">{order.user?.email || order.shippingAddress?.email}</a>
                ) : (
                  <span className="text-gray-500">{ui.noEmail}</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded p-6 shadow-sm print:border-black print:shadow-none">
            <div className="mb-4 flex items-center justify-between gap-3 border-b pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">{ui.shippingDestination}</h2>
              <button onClick={printShippingLabel} className="print:hidden rounded-full border border-[#c9ab83] bg-gradient-to-r from-[#1f130d] via-[#4a2c17] to-[#7b5532] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#f7efe4] shadow-[0_10px_26px_rgba(74,44,23,0.15)] transition-all duration-300 hover:-translate-y-0.5">
                {ui.printAddress}
              </button>
            </div>
            <address className="not-italic text-sm text-black leading-relaxed">
              {order.shippingAddress?.fullName && <>{order.shippingAddress.fullName}<br /></>}
              {order.shippingAddress?.phone && <>{order.shippingAddress.phone}<br /></>}
              {order.shippingAddress?.street}<br />
              {order.shippingAddress?.city}{order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress?.zipCode}<br />
              {order.shippingAddress?.country}
            </address>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
