import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api from '../../services/api';
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

  const handleUpload = async () => {
    if (!file || !id) return;
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('receipt', file);
      await api.post(`/orders/${id}/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadSuccess(true);
      toast.success('Receipt uploaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload receipt');
    } finally {
      setIsUploading(false);
    }
  };

  const content = {
    ar: {
      title: 'شكراً لطلبك!',
      description: 'تم استلام طلبك بنجاح. سنراجع تفاصيل الطلب ونرسل لك التحديثات قريبًا.',
      paymentReference: 'مرجع الدفع',
      viewOrders: 'عرض طلباتي',
      continueShopping: 'متابعة التسوق',
    },
    tr: {
      title: 'Siparisiniz Icin Tesekkurler!',
      description: 'Siparisiniz basariyla alindi. Siparis detaylarinizi yakinda sizinle paylasacagiz.',
      paymentReference: 'Odeme Referansi',
      viewOrders: 'Siparislerimi Gor',
      continueShopping: 'Alisverise Devam Et',
    },
    en: {
      title: 'Thank You For Your Order!',
      description: "Your order has been successfully placed. We'll review it and send you updates shortly.",
      paymentReference: 'Payment Reference',
      viewOrders: 'View My Orders',
      continueShopping: 'Continue Shopping',
    },
  }[language] || {
    title: 'Thank You For Your Order!',
    description: "Your order has been successfully placed. We'll review it and send you updates shortly.",
    paymentReference: 'Payment Reference',
    viewOrders: 'View My Orders',
    continueShopping: 'Continue Shopping',
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center text-[var(--text-primary)]">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>

      <h1 className="mb-4 text-4xl font-serif text-[var(--text-primary)]">{content.title}</h1>
      <p className="mb-8 max-w-md text-[var(--text-secondary)]">{content.description}</p>

      {paymentIntent && (
        <div className="mb-8 w-full max-w-sm rounded border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-left">
          <p className="mb-1 text-sm text-[var(--text-secondary)]">{content.paymentReference}</p>
          <p className="truncate font-medium text-[var(--text-primary)]">{paymentIntent.id}</p>
        </div>
      )}

      {id && !uploadSuccess && (
        <div className="mb-8 w-full max-w-md rounded-[20px] border border-[#e8d7c2] bg-[#fdfaf6] p-6 shadow-sm">
          <h3 className="mb-4 font-serif text-lg text-[#2b1911]">Upload Payment Receipt</h3>
          <p className="mb-4 text-sm text-gray-500">Please upload your transfer screenshot or PDF document to confirm the order.</p>
          <div className="mb-4 text-left">
            <input 
              type="file" 
              accept="image/jpeg, image/png, application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#f3e8db] file:text-[#4a2c17] hover:file:bg-[#ead7bf]"
            />
          </div>
          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full bg-[#4A2C17] text-white py-3 rounded text-sm uppercase tracking-widest font-medium disabled:opacity-50 hover:bg-[#8B6914] transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Upload Payment Receipt'}
          </button>
        </div>
      )}

      {uploadSuccess && (
        <div className="mb-8 w-full max-w-md rounded bg-green-50 p-4 border border-green-200">
          <p className="font-medium text-green-800 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Receipt uploaded successfully
          </p>
        </div>
      )}

      <div className="space-x-4">
        <Link to="/user/dashboard" className="inline-block bg-[#2f1f15] px-8 py-3 font-medium uppercase tracking-widest text-white transition-colors hover:bg-gold">
          {content.viewOrders}
        </Link>
        <Link to="/shop" className="inline-block border border-[var(--border-color)] bg-[var(--bg-card)] px-8 py-3 font-medium uppercase tracking-widest transition-colors hover:opacity-90">
          {content.continueShopping}
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
