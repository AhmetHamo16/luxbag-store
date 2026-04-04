import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { orderService } from '../../services/orderService';
import useCartStore from '../../store/cartStore';
import useLangStore from '../../store/useLangStore';
import { translations } from '../../i18n/translations';
import useCurrencyStore from '../../store/useCurrencyStore';
import { userService } from '../../services/userService';
import { settingsService } from '../../services/settingsService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { resolveProductImage } from '../../utils/assets';
import { couponService } from '../../services/couponService';

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
  
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();

  // Load real cart data from Zustand store
  const { items: cartItems, getTotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { language } = useLangStore();
  
  const currentCountry = watch('country');
  const isTurkey = language === 'tr' || currentCountry === 'Turkey';
  
  const formatPrice = useCurrencyStore(state => state.formatPrice);
  const t = translations[language].checkout;
  const ui = {
    en: {
      savedAddresses: 'Saved Addresses',
      paymentMethod: 'Payment Method',
      editShipping: 'Edit Shipping',
      bankTransfer: 'Direct Bank Transfer',
      accountHolder: 'Account Holder',
      amountToTransfer: 'Amount To Transfer',
      uploadPrompt: 'Upload a clear screenshot of your bank transfer receipt (JPEG, PNG)',
      uploading: 'Uploading...',
      browseFiles: 'Browse Files',
      processing: 'Processing...',
      submitTransfer: 'I Transferred - Submit Order',
      apply: 'Apply',
      shippingDiscount: 'Shipping Discount',
      discount: 'Discount',
      copy: 'Copy',
      copied: 'copied',
      copyFailed: 'Failed to copy',
      cartEmpty: 'Your cart is empty',
      returnToShop: 'Return to Shop',
      accountHolderLabel: 'Account holder',
    },
    ar: {
      savedAddresses: 'العناوين المحفوظة',
      paymentMethod: 'طريقة الدفع',
      editShipping: 'تعديل الشحن',
      bankTransfer: 'تحويل بنكي مباشر',
      accountHolder: 'اسم صاحب الحساب',
      amountToTransfer: 'المبلغ المطلوب تحويله',
      uploadPrompt: 'ارفعي صورة واضحة لإيصال التحويل البنكي بصيغة JPEG أو PNG',
      uploading: 'جارٍ الرفع...',
      browseFiles: 'اختيار الملف',
      processing: 'جارٍ المعالجة...',
      submitTransfer: 'حوّلت المبلغ - تأكيد الطلب',
      apply: 'تطبيق',
      shippingDiscount: 'خصم الشحن',
      discount: 'الخصم',
      copy: 'نسخ',
      copied: 'تم النسخ',
      copyFailed: 'فشل النسخ',
      cartEmpty: 'سلتك فارغة',
      returnToShop: 'العودة إلى المتجر',
      accountHolderLabel: 'اسم الحساب',
    },
    tr: {
      savedAddresses: 'Kayitli Adresler',
      paymentMethod: 'Odeme Yontemi',
      editShipping: 'Teslimati Duzenle',
      bankTransfer: 'Havale / EFT',
      accountHolder: 'Hesap Sahibi',
      amountToTransfer: 'Transfer Edilecek Tutar',
      uploadPrompt: 'Banka transfer dekontunun net bir ekran goruntusunu yukleyin (JPEG, PNG)',
      uploading: 'Yukleniyor...',
      browseFiles: 'Dosya Sec',
      processing: 'Isleniyor...',
      submitTransfer: 'Transferi Yaptim - Siparisi Gonder',
      apply: 'Uygula',
      shippingDiscount: 'Kargo Indirimi',
      discount: 'Indirim',
      copy: 'Kopyala',
      copied: 'kopyalandi',
      copyFailed: 'Kopyalanamadi',
      cartEmpty: 'Sepetiniz bos',
      returnToShop: 'Magazaya Don',
      accountHolderLabel: 'Hesap sahibi',
    },
  }[language];
  const feedbackCopy = {
    en: {
      couponApplied: 'Coupon applied successfully!',
      couponInvalid: 'Invalid coupon code.',
      uploadReceiptRequired: 'Please upload your transfer receipt before submitting.',
      createOrderFailed: 'Failed to create order, please try again.',
    },
    ar: {
      couponApplied: 'تم تطبيق الكوبون بنجاح',
      couponInvalid: 'رمز الكوبون غير صحيح',
      uploadReceiptRequired: 'ارفعي إيصال التحويل قبل إرسال الطلب',
      createOrderFailed: 'تعذر إنشاء الطلب، حاولي مرة أخرى',
    },
    tr: {
      couponApplied: 'Kupon basariyla uygulandi!',
      couponInvalid: 'Gecersiz kupon kodu.',
      uploadReceiptRequired: 'Siparisi gondermeden once transfer dekontunu yukleyin.',
      createOrderFailed: 'Siparis olusturulamadi, lutfen tekrar deneyin.',
    },
  }[language] || {
    couponApplied: 'Coupon applied successfully!',
    couponInvalid: 'Invalid coupon code.',
    uploadReceiptRequired: 'Please upload your transfer receipt before submitting.',
    createOrderFailed: 'Failed to create order, please try again.',
  };

  const subtotal = getTotal();
  const [adminSettings, setAdminSettings] = useState(null);
  const threshold = adminSettings?.freeShippingThreshold ?? 500;
  const baseShippingVal = adminSettings?.shippingCost ?? 25;
  const shippingCost = subtotal > threshold || subtotal === 0 ? 0 : baseShippingVal;
  const total = subtotal + shippingCost - discountAmount;

  useEffect(() => {
    settingsService.getSettings().then(res => {
      if(res.data) setAdminSettings(res.data);
    }).catch(console.error);

    if (isAuthenticated) {
      userService.getProfile().then(res => {
         if (res.data && res.data.addresses) setSavedAddresses(res.data.addresses);
      }).catch(console.error);
    }
  }, [isAuthenticated]);

  const handleSelectAddress = (addr, idx) => {
    setSelectedAddressIndex(idx);
    const fullName = addr.fullName || '';
    setValue('firstName', fullName.split(' ')[0] || '');
    setValue('lastName', fullName.split(' ').slice(1).join(' ') || '');
    setValue('phone', addr.phone || '');
    setValue('address', addr.street || '');
    setValue('city', addr.city || '');
    setValue('zipCode', addr.zipCode || addr.postalCode || '');
    setValue('country', addr.country || 'TR');
  };

  const onShippingSubmit = (data) => {
    setShippingData(data);
    setStep(2); // Proceed to Payment Step
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    couponService.validateCoupon({
      code: couponCode,
      purchaseAmount: subtotal,
      shippingCost
    }).then((response) => {
      setDiscountAmount(Number(response.discountAmount || 0));
      setAppliedCoupon(response.data || null);
      toast.success(feedbackCopy.couponApplied);
    }).catch((error) => {
      setDiscountAmount(0);
      setAppliedCoupon(null);
      toast.error(error?.response?.data?.message || feedbackCopy.couponInvalid);
    });
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
      // Immediately clear any past upload error by having valid state
    }
  };

  const handleIBANSubmit = async () => {
    try {
      if (!receiptFile) return toast.error(t.uploadReceiptRequired || feedbackCopy.uploadReceiptRequired);
      setIsUploading(true);
      
      const rawItems = cartItems || [];
      if (!rawItems || rawItems.length === 0) {
        setIsUploading(false);
        return toast.error('Your cart is empty');
      }

      const cleanItems = rawItems.map(item => ({
        product: item._id || item.product?._id || item.product,
        name: item.name?.en || item.name?.ar || item.name?.tr || item.name || item.product?.name?.en || item.product?.name || 'Melora Product',
        quantity: item.quantity,
        price: item.price || item.product?.price,
        image: resolveProductImage(item, '')
      }));

      const orderData = {
        items: cleanItems,
        shippingAddress: {
          fullName: `${shippingData.firstName || ''} ${shippingData.lastName || ''}`.trim(),
          email: shippingData.email || '',
          phone: shippingData.phone || '',
          street: shippingData.address,
          city: shippingData.city,
          zipCode: shippingData.zipCode || '00000',
          country: shippingData.country || 'TR',
        },
        payment: {
          method: 'iban',
          receiptImage: '' // Handled by backend multer
        },
        coupon: {
          code: appliedCoupon?.code || couponCode || null,
          discount: discountAmount
        },
        subtotal,
        shippingCost,
        discountAmount,
        total,
      };

      const formData = new FormData();
      formData.append('receipt', receiptFile);
      formData.append('orderData', JSON.stringify(orderData));

      const response = await orderService.createOrder(formData);

      if (response.success) {
        clearCart();
        navigate(`/order-confirmation/${response.order._id}`);
      }
    } catch (error) {
      console.error("=== CHECKOUT SUBMIT ERROR ===", error.response?.data || error.message);
      toast.error(error.response?.data?.message || feedbackCopy.createOrderFailed);
    } finally {
      setIsUploading(false);
    }
  };

  const copyText = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} ${ui.copied}`);
    } catch {
      toast.error(`${ui.copyFailed} ${label.toLowerCase()}`);
    }
  };

  const luxeCopyButtonClass = "inline-flex min-w-[110px] items-center justify-center rounded-full border border-[#b9986b] bg-gradient-to-r from-[#1f130d] via-[#4a2c17] to-[#7b5532] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#f7efe4] shadow-[0_10px_30px_rgba(74,44,23,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(74,44,23,0.28)]";

  if (cartItems.length === 0 && step === 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif mb-4">{ui.cartEmpty}</h2>
        <button onClick={() => navigate('/shop')} className="bg-black text-white px-8 py-3 hover:bg-gold transition-colors">{ui.returnToShop}</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans text-black">
      
      {/* Checkout Progress */}
      <div className="flex justify-center items-center mb-12">
        <div className={`flex items-center ${step >= 1 ? 'text-black font-medium' : 'text-gray-400'}`}>
          <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
          {t.shippingInfo}
        </div>
        <div className={`w-12 h-px mx-4 ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${step >= 2 ? 'text-black font-medium' : 'text-gray-400'}`}>
          <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
          {t.paymentInfo}
        </div>
        <div className={`w-12 h-px mx-4 ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${step >= 3 ? 'text-black font-medium' : 'text-gray-400'}`}>
          <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 ${step >= 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>3</span>
          Confirmation
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Main Form Area */}
        <div className="w-full lg:w-2/3">
          
          {step === 1 && (
            <div className="bg-white p-8 rounded shadow-sm border border-gray-100">
              <h2 className="text-2xl font-serif mb-6">{t.shippingAddress || 'Shipping Address'}</h2>
              
              {savedAddresses.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-widest mb-4">{ui.savedAddresses}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleSelectAddress(addr, idx)}
                        className={`p-4 border rounded cursor-pointer transition-colors ${selectedAddressIndex === idx ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-brand'}`}
                      >
                        <p className="font-medium text-sm text-brand mb-1">{addr.fullName}</p>
                        <p className="text-xs text-gray-600 mb-1">{addr.street}, {addr.city}</p>
                        <p className="text-xs text-gray-500">{addr.country} • {addr.phone}</p>
                      </div>
                    ))}
                  </div>
                  <div className="my-6 border-t border-gray-200"></div>
                </div>
              )}

              <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t.firstName || 'First Name'}</label>
                    <input {...register("firstName", { required: true })} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black" />
                    {errors.firstName && <span className="text-red-500 text-xs mt-1">Required</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t.lastName || 'Last Name'}</label>
                    <input {...register("lastName", { required: true })} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black" />
                    {errors.lastName && <span className="text-red-500 text-xs mt-1">Required</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t.emailAddress || 'Email Address'}</label>
                    <input type="email" {...register("email", { required: true })} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t.phoneNumber || 'Phone Number'}</label>
                    <input type="tel" {...register("phone", { required: true })} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black" />
                    {errors.phone && <span className="text-red-500 text-xs mt-1">Required</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t.countryLabel || 'Country'}</label>
                  <select {...register("country", { required: true })} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black bg-white">
                    <option value="">{t.selectCountry || 'Select Country'}</option>
                    <option value="Turkey">Turkey</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                  </select>
                  {errors.country && <span className="text-red-500 text-xs mt-1">Required</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t.address1 || 'Address Line 1'}</label>
                  <input {...register("address", { required: true })} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-500">{t.address2 || 'Address Line 2 (Optional)'}</label>
                  <input {...register("addressLine2")} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black" placeholder="" />
                </div>

                <div className={`grid grid-cols-1 gap-6 ${isTurkey ? 'md:grid-cols-1' : 'md:grid-cols-3'}`}>
                  <div className={isTurkey ? '' : 'md:col-span-2'}>
                    <label className="block text-sm font-medium mb-1">{t.city || 'City'}</label>
                    <input {...register("city", { required: true })} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black" />
                  </div>
                  {!isTurkey && (
                    <div className="col-span-1">
                      <label className="block text-sm font-medium mb-1">{t.postalCode || 'Postal Code'}</label>
                      <input {...register("zipCode", { required: !isTurkey })} className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black" />
                      {errors.zipCode && <span className="text-red-500 text-xs mt-1">Required</span>}
                    </div>
                  )}
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-black text-white px-8 py-4 uppercase tracking-widest text-sm font-medium hover:bg-gold transition-colors duration-300">
                    {t.paymentInfo || 'Continue to Payment'}
                  </button>
                </div>

              </form>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-8 rounded shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif">{ui.paymentMethod}</h2>
                <button onClick={() => setStep(1)} className="text-sm underline hover:text-gold transition-colors">{ui.editShipping}</button>
              </div>
              
              <div className="mb-6 p-4 bg-white border border-gray-200 rounded">
                <p className="font-medium text-sm mb-1">{shippingData?.firstName} {shippingData?.lastName}</p>
                <p className="text-sm text-gray-600">{shippingData?.email}</p>
                <p className="text-sm text-gray-600">{shippingData?.address}, {shippingData?.city} {shippingData?.zipCode}</p>
              </div>

               <div className="mb-6 overflow-hidden rounded-[28px] border border-[#e9dcc9] bg-gradient-to-br from-[#fffaf4] via-[#fbf4eb] to-[#f4eadf] text-center shadow-[0_24px_80px_rgba(74,44,23,0.08)]">
                  <div className="border-b border-[#eadcc6] bg-[radial-gradient(circle_at_top,#fff6ea,transparent_65%)] px-6 py-6">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.45em] text-[#8f6b43]">Melora Bank Transfer</p>
                    <h3 className="font-serif text-[30px] text-[#2d1a12]">{ui.bankTransfer}</h3>
                  </div>
                  <div className="px-6 py-6">
                  {language === 'ar' && <p className="text-sm mb-4">يرجى تحويل المبلغ بالضبط إلى الآيبان أدناه ثم رفع إيصال التحويل</p>}
                  {language === 'tr' && <p className="text-sm mb-4">Lütfen tam tutarı aşağıdaki IBAN'a transfer edin ve dekontu yükleyin</p>}
                  {language === 'en' && <p className="text-sm mb-4">Please transfer the exact amount to the IBAN below, then upload your receipt.</p>}
                  
                  <div className="mb-4 rounded-[24px] border border-[#e8d7c2] bg-white/90 p-5 text-left text-black shadow-[0_18px_45px_rgba(74,44,23,0.08)] backdrop-blur-sm">
                     <div className="mb-4 flex items-start justify-between gap-4 border-b border-[#f0e5d7] pb-4">
                       <div>
                         <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8b6b46]">{ui.accountHolder}</p>
                         <p className="font-serif text-lg text-[#2b1911]">{adminSettings?.accountHolder || 'Muhammed Nur Deri'}</p>
                       </div>
                       <button
                         type="button"
                         onClick={() => copyText(adminSettings?.accountHolder || 'Muhammed Nur Deri', ui.accountHolderLabel)}
                         className={luxeCopyButtonClass}
                       >
                         {ui.copy}
                       </button>
                     </div>
                     <div className="mb-4 flex items-start justify-between gap-4 border-b border-[#f0e5d7] pb-4">
                       <div>
                         <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8b6b46]">IBAN</p>
                         <p className="break-all font-mono text-[15px] leading-7 text-[#2b1911]">{adminSettings?.iban || 'TR60 0006 4000 0012 2110 7488 53'}</p>
                       </div>
                       <button
                         type="button"
                         onClick={() => copyText(adminSettings?.iban || 'TR60 0006 4000 0012 2110 7488 53', 'IBAN')}
                         className={luxeCopyButtonClass}
                       >
                         {ui.copy}
                       </button>
                     </div>
                     <div className="flex items-end justify-between gap-4">
                       <div>
                         <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8b6b46]">{ui.amountToTransfer}</p>
                         <p className="mt-2 font-serif text-3xl text-[#8B6914]">{formatPrice(total)}</p>
                       </div>
                       <div className="hidden h-16 w-16 rounded-full border border-[#ead7bf] bg-[radial-gradient(circle,#fff4e8_0%,#f3e8db_65%,#ebdfd0_100%)] md:block" />
                     </div>
                  </div>

                  <div className="mt-6 flex flex-col items-center w-full border-2 border-dashed border-gray-300 p-6 rounded bg-gray-50">
                    {receiptPreview ? (
                      <>
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                          <svg className="w-6 h-6 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <img src={receiptPreview} alt="Receipt Preview" className="w-48 object-contain mb-3 border border-gray-200 shadow-sm rounded-sm" />
                        <p className="text-sm font-bold text-brand">{receiptFile?.name}</p>
                        <label className="mt-3 cursor-pointer text-brand underline text-sm font-medium hover:text-gold transition-colors">
                          Change Receipt
                          <input type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} />
                        </label>
                      </>
                    ) : (
                      <>
                        <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <p className="text-gray-500 text-sm mb-4 text-center">{ui.uploadPrompt}</p>
                        <label className={`cursor-pointer px-6 py-2 rounded uppercase tracking-widest text-xs font-bold transition-colors w-full sm:w-auto text-center ${isUploading ? 'bg-gray-400 text-white' : 'bg-[#4A2C17] text-white hover:bg-[#8B6914]'}`}>
                          {isUploading ? ui.uploading : ui.browseFiles}
                          <input type="file" className="hidden" accept="image/*" onChange={handleReceiptUpload} disabled={isUploading} />
                        </label>
                      </>
                    )}
                  </div>
                  </div>
               </div>
               
               <button 
                 onClick={handleIBANSubmit} 
                 disabled={!receiptFile || isUploading}
                 className="w-full bg-[#4A2C17] text-white py-4 uppercase tracking-widest text-sm font-medium hover:bg-[#8B6914] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
               >
                 {isUploading ? ui.processing : ui.submitTransfer}
               </button>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-3 text-brand">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">256-Bit SSL Secure Payment</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 md:p-8 rounded shadow-sm sticky top-28 border border-gray-100">
            <h3 className="text-xl font-serif mb-6">{t.orderSummary || 'Order Summary'}</h3>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id || item._id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-16 bg-gray-200 overflow-hidden relative">
                      <img loading="lazy" src={resolveProductImage(item, 'https://via.placeholder.com/120')} alt={item.name?.[language] || item.name?.en || item.name || 'Melora bag'} className="w-full h-full object-cover" />
                      
                      <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full z-10">{item.quantity}</span>
                    </div>
                    <span className="text-sm font-medium truncate max-w-[120px]">{item.name?.[language] || item.name?.en || item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-3 mb-6 relative">
              
              {/* Promo Code area */}
              {step === 1 && (
                <div className="mb-6">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={t.promoCode || 'Promo Code'} 
                      value={couponCode} 
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black"
                    />
                    <button type="submit" className="bg-black text-white px-4 py-2 text-sm hover:bg-gold transition-colors">{ui.apply}</button>
                  </form>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t.subtotal || 'Subtotal'}</span>
                <span className="font-medium">{formatPrice(subtotal.toFixed(2))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t.shipping || 'Shipping'}</span>
                <span className="font-medium">{formatPrice(Math.max(0, shippingCost - (appliedCoupon?.discountType === 'free_shipping' ? discountAmount : 0)).toFixed(2))}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{appliedCoupon?.discountType === 'free_shipping' ? ui.shippingDiscount : ui.discount}</span>
                  <span>-{formatPrice(discountAmount.toFixed(2))}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                <span className="text-lg font-serif">{t.total || 'Total'}</span>
                <span className="text-xl font-medium">{formatPrice(total.toFixed(2))}</span>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
