import React, { useState, useEffect } from 'react';
import { couponService } from '../../../services/couponService';
import Loader from '../../../components/shared/Loader';
import useTranslation from '../../../hooks/useTranslation';
import useCurrencyStore from '../../../store/useCurrencyStore';
import toast from 'react-hot-toast';

const CouponManager = () => {
  const { t, language } = useTranslation('admin');
  const formatPrice = useCurrencyStore((state) => state.formatPrice);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    code: '', 
    discountValue: '', 
    discountType: 'percentage', 
    expiryDate: '', 
    maxUses: '',
    maxUsesPerUser: '1',
    minPurchaseAmount: ''
  });

  const ui = {
    title: t?.coupons?.title || 'Coupon Management',
    addCoupon: t?.coupons?.addCoupon || 'Add Coupon',
    code: t?.coupons?.code || 'Code',
    type: t?.coupons?.type || (language === 'ar' ? 'نوع الخصم' : language === 'tr' ? 'Indirim Turu' : 'Type'),
    value: t?.coupons?.value || (language === 'ar' ? 'قيمة الخصم' : language === 'tr' ? 'Indirim Degeri' : 'Value'),
    expiry: t?.coupons?.expiry || 'Expiry',
    globalUses: t?.coupons?.usageLimit || (language === 'ar' ? 'إجمالي الاستخدامات' : language === 'tr' ? 'Toplam Kullanim' : 'Global Uses'),
    perUser: t?.coupons?.perUser || (language === 'ar' ? 'لكل مستخدم' : language === 'tr' ? 'Kullanici Basina' : 'Uses / User'),
    minPurchase: t?.coupons?.minPurchase || (language === 'ar' ? 'الحد الأدنى للطلب' : language === 'tr' ? 'Minimum Sepet Tutari' : 'Minimum Purchase'),
    percentOption: language === 'ar' ? 'نسبة مئوية (%)' : language === 'tr' ? 'Yuzde (%)' : 'Percentage (%)',
    fixedOption: language === 'ar' ? 'قيمة ثابتة (₺)' : language === 'tr' ? 'Sabit Tutar (₺)' : 'Fixed Amount (₺)',
    freeShippingOption: language === 'ar' ? 'شحن مجاني' : language === 'tr' ? 'Ucretsiz Kargo' : 'Free Shipping',
    noCoupons: language === 'ar' ? 'لا توجد كوبونات حالياً.' : language === 'tr' ? 'Henuz kupon yok.' : 'No coupons found.',
    uses: language === 'ar' ? 'الاستخدام' : language === 'tr' ? 'Kullanim' : 'Uses',
    actions: t?.common?.actions || (language === 'ar' ? 'الإجراءات' : language === 'tr' ? 'Islemler' : 'Actions'),
    status: t?.common?.status || (language === 'ar' ? 'الحالة' : language === 'tr' ? 'Durum' : 'Status'),
    active: t?.common?.active || (language === 'ar' ? 'نشط' : language === 'tr' ? 'Aktif' : 'ACTIVE'),
    inactive: t?.common?.inactive || (language === 'ar' ? 'معطل' : language === 'tr' ? 'Pasif' : 'DISABLED'),
    delete: t?.common?.delete || (language === 'ar' ? 'حذف' : language === 'tr' ? 'Sil' : 'Delete'),
    edit: language === 'ar' ? 'تعديل' : language === 'tr' ? 'Duzenle' : 'Edit',
    cancelEdit: language === 'ar' ? 'إلغاء التعديل' : language === 'tr' ? 'Duzenlemeyi Iptal Et' : 'Cancel Edit',
    limitLabel: language === 'ar' ? 'الحد' : language === 'tr' ? 'Limit' : 'Limit',
    expired: language === 'ar' ? 'منتهي' : language === 'tr' ? 'Suresi Doldu' : 'Expired',
    addSuccess: language === 'ar' ? 'تمت إضافة الكوبون بنجاح' : language === 'tr' ? 'Kupon basariyla eklendi' : 'Coupon added successfully',
    updateSuccess: language === 'ar' ? 'تم تحديث الكوبون بنجاح' : language === 'tr' ? 'Kupon basariyla guncellendi' : 'Coupon updated successfully',
    toggleSuccess: language === 'ar' ? 'تم تحديث حالة الكوبون' : language === 'tr' ? 'Kupon durumu guncellendi' : 'Coupon status updated',
    deleteSuccess: language === 'ar' ? 'تم حذف الكوبون' : language === 'tr' ? 'Kupon silindi' : 'Coupon deleted',
    addError: language === 'ar' ? 'فشل في إضافة الكوبون' : language === 'tr' ? 'Kupon eklenemedi' : 'Failed to add coupon',
    toggleError: language === 'ar' ? 'فشل في تحديث حالة الكوبون' : language === 'tr' ? 'Kupon durumu guncellenemedi' : 'Failed to toggle coupon status',
    deleteError: language === 'ar' ? 'فشل في حذف الكوبون' : language === 'tr' ? 'Kupon silinemedi' : 'Failed to delete coupon',
    confirmDelete: language === 'ar' ? 'هل تريد حذف هذا الكوبون؟' : language === 'tr' ? 'Bu kuponu silmek istiyor musunuz?' : 'Are you sure you want to delete this coupon?',
    totalAllowed: language === 'ar' ? 'إجمالي مرات الاستخدام' : language === 'tr' ? 'Toplam kullanim hakki' : 'Total allowed uses',
    perUserPlaceholder: language === 'ar' ? 'مرة لكل مستخدم' : language === 'tr' ? 'Kullanici basina adet' : 'Per user limit',
    minPurchasePlaceholder: language === 'ar' ? 'مثال: 1500' : language === 'tr' ? 'Orn: 1500' : 'e.g. 1500',
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponService.getCoupons();
      setCoupons(Array.isArray(res?.data) ? res.data : (res?.data?.data || res?.data || []));
    } catch (error) {
      console.error(error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      code: '',
      discountValue: '',
      discountType: 'percentage',
      expiryDate: '',
      maxUses: '',
      maxUsesPerUser: '1',
      minPurchaseAmount: ''
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discountValue: formData.discountType === 'free_shipping' ? 0 : Number(formData.discountValue),
        discountType: formData.discountType,
        expiryDate: formData.expiryDate,
        maxUses: Number(formData.maxUses) || 100,
        maxUsesPerUser: Number(formData.maxUsesPerUser) || 1,
        minPurchaseAmount: Number(formData.minPurchaseAmount) || 0
      };

      if (editingId) {
        await couponService.updateCoupon(editingId, payload);
        toast.success(ui.updateSuccess);
      } else {
        await couponService.createCoupon(payload);
        toast.success(ui.addSuccess);
      }

      resetForm();
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || ui.addError);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await couponService.toggleCouponStatus(id);
      toast.success(ui.toggleSuccess);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || ui.toggleError);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(ui.confirmDelete)) {
      try {
        await couponService.deleteCoupon(id);
        toast.success(ui.deleteSuccess);
        fetchCoupons();
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || ui.deleteError);
      }
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon._id);
    setFormData({
      code: coupon.code || '',
      discountValue: coupon.discountType === 'free_shipping' ? '' : String(coupon.discountValue || ''),
      discountType: coupon.discountType || 'percentage',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().slice(0, 10) : '',
      maxUses: String(coupon.maxUses || ''),
      maxUsesPerUser: String(coupon.maxUsesPerUser || '1'),
      minPurchaseAmount: String(coupon.minPurchaseAmount || '')
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <h1 className="text-2xl font-serif text-black mb-8">{ui.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 shadow-sm border border-gray-100 rounded">
            <div className="flex items-center justify-between mb-4 gap-3">
              <h2 className="text-lg font-medium">{editingId ? ui.edit : ui.addCoupon}</h2>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-xs font-medium text-gray-500 hover:text-black transition-colors">
                  {ui.cancelEdit}
                </button>
              )}
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{ui.code}</label>
                <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm uppercase" placeholder="e.g. SUMMER10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{ui.type}</label>
                  <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm">
                    <option value="percentage">{ui.percentOption}</option>
                    <option value="fixed">{ui.fixedOption}</option>
                    <option value="free_shipping">{ui.freeShippingOption}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{ui.value}</label>
                  <input required={formData.discountType !== 'free_shipping'} disabled={formData.discountType === 'free_shipping'} type="number" min="1" max={formData.discountType === 'percentage' ? "100" : undefined} value={formData.discountType === 'free_shipping' ? '0' : formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm disabled:bg-gray-100 disabled:text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{ui.expiry}</label>
                <input required type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{ui.globalUses}</label>
                  <input required type="number" min="1" value={formData.maxUses} onChange={e => setFormData({...formData, maxUses: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" placeholder={ui.totalAllowed} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{ui.perUser}</label>
                  <input required type="number" min="1" value={formData.maxUsesPerUser} onChange={e => setFormData({...formData, maxUsesPerUser: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" placeholder={ui.perUserPlaceholder} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{ui.minPurchase}</label>
                <input type="number" min="0" value={formData.minPurchaseAmount} onChange={e => setFormData({...formData, minPurchaseAmount: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" placeholder={ui.minPurchasePlaceholder} />
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 font-medium text-sm hover:bg-gold transition-colors">
                {editingId ? ui.edit : ui.addCoupon}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm border border-gray-100 rounded overflow-hidden">
            {loading ? <Loader /> : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1a1a2e] text-white text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium rounded-tl-sm">{ui.code}</th>
                    <th className="px-6 py-4 font-medium">{t?.coupons?.discount || 'Discount'}</th>
                    <th className="px-6 py-4 font-medium">{ui.expiry}</th>
                    <th className="px-6 py-4 font-medium text-center">{ui.uses}</th>
                    <th className="px-6 py-4 font-medium text-center">{ui.status}</th>
                    <th className="px-6 py-4 font-medium text-right rounded-tr-sm">{ui.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {coupons.map((coupon, index) => (
                    <tr key={coupon._id} className={`transition-colors ${coupon.isActive ? (index % 2 === 0 ? 'bg-white' : 'bg-gray-50') : 'bg-gray-100 opacity-75'} hover:bg-gray-100`}>
                      <td className="px-6 py-4 text-sm font-bold text-black">{coupon.code}</td>
                      <td className="px-6 py-4 text-sm text-black font-medium">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}%`
                          : coupon.discountType === 'free_shipping'
                            ? ui.freeShippingOption
                            : formatPrice(coupon.discountValue)}
                      </td>
                      <td className="px-6 py-4 text-sm text-black">
                        <div>{new Date(coupon.expiryDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'ar' ? 'ar-SA' : 'en-US')}</div>
                        {coupon.minPurchaseAmount > 0 && (
                          <div className="text-[10px] text-[#8b6b4b] font-medium mt-1">{ui.minPurchase}: {formatPrice(coupon.minPurchaseAmount)}</div>
                        )}
                        {new Date() > new Date(coupon.expiryDate) && <div className="text-[10px] text-red-500 font-bold uppercase mt-1">{ui.expired}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-600">
                        <div className="font-medium text-black">{coupon.usedCount} / {coupon.maxUses}</div>
                        <div className="text-[10px]">{ui.limitLabel}: {coupon.maxUsesPerUser}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleToggleStatus(coupon._id)} className={`text-[10px] font-bold px-2 py-1 rounded ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                          {coupon.isActive ? ui.active : ui.inactive}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(coupon)} className="bg-blue-600 text-white px-3 py-1.5 rounded-sm hover:bg-blue-700 text-[10px] font-bold uppercase tracking-wide shadow-sm transition-colors border-none align-middle">
                            {ui.edit}
                          </button>
                          <button onClick={() => handleDelete(coupon._id)} className="bg-red-600 text-white px-3 py-1.5 rounded-sm hover:bg-red-700 text-[10px] font-bold uppercase tracking-wide shadow-sm transition-colors border-none align-middle">
                            {ui.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-6 text-gray-500">{ui.noCoupons}</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CouponManager;
