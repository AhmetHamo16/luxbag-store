import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '../../../components/shared/Loader';
import useLangStore from '../../../store/useLangStore';
import { settingsService } from '../../../services/settingsService';
import { isNotificationLooping, playNotificationTone, setNotificationTone, stopNotificationTone } from '../../../utils/notifications';

const uiMap = {
  en: {
    title: 'Global Settings',
    core: 'Core Attributes',
    commerce: 'Commerce Config',
    bank: 'Bank Transfer Details (IBAN)',
    payments: 'Payment Methods',
    alerts: 'Notification Sound',
    danger: 'Danger Zone',
    storeName: 'Store Name',
    supportEmail: 'Support Email',
    currency: 'Store Currency',
    freeShippingThreshold: 'Free Shipping Threshold',
    shippingCost: 'Base Shipping Cost',
    monthlyTarget: 'Monthly Sales Target',
    weeklyTarget: 'Weekly Sales Target',
    monthlyHint: 'Set a monthly revenue goal so admin and cashier can track progress live.',
    weeklyHint: 'Set a weekly target to track boutique pace more closely.',
    accountHolder: 'Account Holder Name',
    iban: 'IBAN Number',
    cardPayment: 'Enable Credit Card Payments',
    codPayment: 'Enable Cash on Delivery (COD)',
    maintenance: 'Enable Maintenance Mode (takes storefront offline)',
    notificationTone: 'Notification Tone',
    notificationHint: 'Choose the sound used for new-order alerts in admin and cashier screens.',
    customTone: 'Custom Uploaded Tone',
    messageTone: 'Message Style',
    luxuryTone: 'Luxury Bell',
    classicTone: 'Classic Chime',
    softTone: 'Soft Gentle',
    preview: 'Preview',
    stopPreview: 'Stop Sound',
    save: 'Save All Settings',
    saving: 'Saving...',
    success: 'Settings updated successfully.',
    failed: 'Failed to update settings.',
  },
  ar: {
    title: 'الإعدادات العامة',
    core: 'البيانات الأساسية',
    commerce: 'إعدادات المتجر',
    bank: 'بيانات التحويل البنكي (IBAN)',
    payments: 'طرق الدفع',
    alerts: 'نغمة الإشعارات',
    danger: 'المنطقة الحساسة',
    storeName: 'اسم المتجر',
    supportEmail: 'بريد الدعم',
    currency: 'عملة المتجر',
    freeShippingThreshold: 'حد الشحن المجاني',
    shippingCost: 'تكلفة الشحن الأساسية',
    monthlyTarget: 'الهدف الشهري للمبيعات',
    weeklyTarget: 'الهدف الأسبوعي للمبيعات',
    monthlyHint: 'حددي هدفًا شهريًا حتى يتابع الأدمن والكاشير التقدم مباشرة.',
    weeklyHint: 'حددي هدفًا أسبوعيًا لمتابعة وتيرة المبيعات بشكل أدق.',
    accountHolder: 'اسم صاحب الحساب',
    iban: 'رقم الآيبان',
    cardPayment: 'تفعيل الدفع بالبطاقة',
    codPayment: 'تفعيل الدفع عند الاستلام',
    maintenance: 'تفعيل وضع الصيانة وإيقاف واجهة المتجر مؤقتًا',
    notificationTone: 'نغمة الإشعار',
    notificationHint: 'هذه النغمة ستُستخدم عند وصول طلب جديد في شاشة الأدمن والكاشير.',
    customTone: 'النغمة الخاصة المرفوعة',
    messageTone: 'رسالة واضحة',
    luxuryTone: 'جرس فاخر',
    classicTone: 'نغمة كلاسيكية',
    softTone: 'نغمة هادئة',
    preview: 'معاينة',
    stopPreview: 'إيقاف الصوت',
    save: 'حفظ جميع الإعدادات',
    saving: 'جارٍ الحفظ...',
    success: 'تم تحديث الإعدادات بنجاح.',
    failed: 'تعذر تحديث الإعدادات.',
  },
  tr: {
    title: 'Genel Ayarlar',
    core: 'Temel Bilgiler',
    commerce: 'Magaza Ayarlari',
    bank: 'Banka Havalesi Bilgileri (IBAN)',
    payments: 'Odeme Yontemleri',
    alerts: 'Bildirim Sesi',
    danger: 'Kritik Alan',
    storeName: 'Magaza Adi',
    supportEmail: 'Destek E-postasi',
    currency: 'Magaza Para Birimi',
    freeShippingThreshold: 'Ucretsiz Kargo Limiti',
    shippingCost: 'Temel Kargo Ucreti',
    monthlyTarget: 'Aylik Satis Hedefi',
    weeklyTarget: 'Haftalik Satis Hedefi',
    monthlyHint: 'Admin ve kasiyer ekranlarinda ilerlemeyi anlik izlemek icin aylik hedef belirleyin.',
    weeklyHint: 'Haftalik satis temposunu daha yakindan takip etmek icin hedef belirleyin.',
    accountHolder: 'Hesap Sahibi',
    iban: 'IBAN Numarasi',
    cardPayment: 'Kart Odemelerini Etkinlestir',
    codPayment: 'Kapida Odemeyi Etkinlestir',
    maintenance: 'Bakim Modunu Etkinlestir',
    notificationTone: 'Bildirim Turu',
    notificationHint: 'Admin ve kasiyer ekranlarindaki yeni siparis uyarisinda bu ses kullanilir.',
    customTone: 'Yuklenen Ozel Ses',
    messageTone: 'Mesaj Tarzi',
    luxuryTone: 'Luks Zil',
    classicTone: 'Klasik Cingil',
    softTone: 'Yumusak Ses',
    preview: 'Dinle',
    stopPreview: 'Sesi Durdur',
    save: 'Tum Ayarlari Kaydet',
    saving: 'Kaydediliyor...',
    success: 'Ayarlar basariyla guncellendi.',
    failed: 'Ayarlar guncellenemedi.',
  },
};

const shippingHintMap = {
  en: 'Orders at or above this amount get free shipping automatically at checkout.',
  ar: 'الطلبات التي تصل إلى هذا المبلغ أو تتجاوزه تحصل على شحن مجاني تلقائيًا.',
  tr: 'Bu tutara ulasan veya gecen siparislerde kargo otomatik olarak ucretsiz olur.',
};

const AdminSettings = () => {
  const { language } = useLangStore();
  const ui = uiMap[language] || uiMap.en;
  const shippingHint = shippingHintMap[language] || shippingHintMap.en;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewingTone, setPreviewingTone] = useState('');
  const [formData, setFormData] = useState({
    storeName: '',
    storeEmail: '',
    currency: 'TRY',
    freeShippingThreshold: 2000,
    shippingCost: 25,
    monthlySalesTarget: 0,
    weeklySalesTarget: 0,
    notificationTone: 'custom',
    maintenanceMode: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await settingsService.getSettings();
        const data = res?.data || {};
        const nextTone = data.notificationTone || 'custom';

        setFormData({
          storeName: data.storeName || '',
          storeEmail: data.storeEmail || '',
          currency: data.currency || 'TRY',
          freeShippingThreshold: data.freeShippingThreshold ?? 2000,
          shippingCost: data.shippingCost ?? 25,
          monthlySalesTarget: data.monthlySalesTarget ?? 0,
          weeklySalesTarget: data.weeklySalesTarget ?? 0,
          notificationTone: nextTone,
          maintenanceMode: data.maintenanceMode || false,
        });

        setNotificationTone(nextTone);
      } catch (error) {
        console.error('Failed to fetch settings.', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));

    if (name === 'notificationTone') {
      setNotificationTone(nextValue);
      setPreviewingTone('');
      stopNotificationTone();
    }
  };

  const handlePreviewTone = async (tone) => {
    stopNotificationTone();
    setNotificationTone(tone);
    setPreviewingTone(tone);
    await playNotificationTone();
  };

  const handleStopPreview = () => {
    stopNotificationTone();
    setPreviewingTone('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSettings({
        storeName: formData.storeName,
        storeEmail: formData.storeEmail,
        currency: formData.currency,
        freeShippingThreshold: Number(formData.freeShippingThreshold || 0),
        shippingCost: Number(formData.shippingCost || 0),
        monthlySalesTarget: Number(formData.monthlySalesTarget || 0),
        weeklySalesTarget: Number(formData.weeklySalesTarget || 0),
        notificationTone: formData.notificationTone,
        maintenanceMode: formData.maintenanceMode,
      });
      setNotificationTone(formData.notificationTone);
      toast.success(ui.success);
    } catch (error) {
      console.error(error);
      toast.error(ui.failed);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  const toneOptions = [
    { value: 'custom', label: ui.customTone },
    { value: 'message', label: ui.messageTone },
    { value: 'luxury', label: ui.luxuryTone },
    { value: 'classic', label: ui.classicTone },
    { value: 'soft', label: ui.softTone },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-2xl font-serif text-black">{ui.title}</h1>
      <form onSubmit={handleSave} className="space-y-8 rounded border border-gray-100 bg-white p-8 shadow-sm">
        <section>
          <h2 className="mb-4 border-b pb-2 text-lg font-medium">{ui.core}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{ui.storeName}</label>
              <input required type="text" name="storeName" value={formData.storeName} onChange={handleChange} className="w-full border p-2 text-sm focus:border-black focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{ui.supportEmail}</label>
              <input required type="email" name="storeEmail" value={formData.storeEmail} onChange={handleChange} className="w-full border p-2 text-sm focus:border-black focus:outline-none" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 border-b pb-2 text-lg font-medium">{ui.commerce}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{ui.currency}</label>
              <select name="currency" value={formData.currency} onChange={handleChange} className="w-full border bg-white p-2 text-sm focus:border-black focus:outline-none">
                <option value="TRY">TRY (₺)</option>
                <option value="USD">USD ($)</option>
                <option value="SAR">SAR (ر.س)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{ui.freeShippingThreshold}</label>
              <input type="number" name="freeShippingThreshold" value={formData.freeShippingThreshold} onChange={handleChange} className="w-full border p-2 text-sm focus:border-black focus:outline-none" />
              <p className="mt-2 text-xs text-gray-500">{shippingHint}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{ui.shippingCost}</label>
              <input type="number" name="shippingCost" value={formData.shippingCost} onChange={handleChange} className="w-full border p-2 text-sm focus:border-black focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{ui.monthlyTarget}</label>
              <input type="number" min="0" step="0.01" name="monthlySalesTarget" value={formData.monthlySalesTarget} onChange={handleChange} className="w-full border p-2 text-sm focus:border-black focus:outline-none" placeholder="50000" />
              <p className="mt-2 text-xs text-gray-500">{ui.monthlyHint}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{ui.weeklyTarget}</label>
              <input type="number" min="0" step="0.01" name="weeklySalesTarget" value={formData.weeklySalesTarget} onChange={handleChange} className="w-full border p-2 text-sm focus:border-black focus:outline-none" placeholder="12000" />
              <p className="mt-2 text-xs text-gray-500">{ui.weeklyHint}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 border-b pb-2 text-lg font-medium">{ui.alerts}</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{ui.notificationTone}</label>
              <select
                name="notificationTone"
                value={formData.notificationTone}
                onChange={handleChange}
                className="w-full border bg-white p-2 text-sm focus:border-black focus:outline-none"
              >
                {toneOptions.map((tone) => (
                  <option key={tone.value} value={tone.value}>{tone.label}</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">{ui.notificationHint}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {toneOptions.map((tone) => (
                <div key={tone.value} className={`rounded-xl border p-4 ${formData.notificationTone === tone.value ? 'border-[#8B6914] bg-[#fff9f0]' : 'border-gray-200 bg-white'}`}>
                  <p className="text-sm font-semibold text-black">{tone.label}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handlePreviewTone(tone.value)}
                      className="rounded-lg border border-[#d1a85d] bg-[#f6e7bf] px-3 py-2 text-xs font-semibold text-[#1d1730] hover:bg-[#edd8a1]"
                    >
                      {ui.preview}
                    </button>
                    {previewingTone === tone.value && isNotificationLooping() && (
                      <button
                        type="button"
                        onClick={handleStopPreview}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        {ui.stopPreview}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded border border-red-100 bg-red-50 p-6">
          <h2 className="mb-4 border-b border-red-200 pb-2 text-lg font-medium text-red-800">{ui.danger}</h2>
          <label className="flex items-center gap-3">
            <input type="checkbox" name="maintenanceMode" checked={formData.maintenanceMode} onChange={handleChange} className="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500" />
            <span className="text-sm font-bold text-red-900">{ui.maintenance}</span>
          </label>
        </section>

        <div className="mt-8 border-t pt-6">
          <button type="submit" disabled={saving} className="flex items-center bg-black px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gold disabled:opacity-50">
            {saving ? ui.saving : ui.save}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
