import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useLangStore from '../../store/useLangStore';
import { orderService } from '../../services/orderService';
import { settingsService } from '../../services/settingsService';
import toast from 'react-hot-toast';
import { enableNotificationAudio, getNotificationTone, isNotificationLooping, playNotificationTone, setNotificationTone, stopNotificationTone } from '../../utils/notifications';

const labels = {
  en: {
    cashier: 'Cashier Desk',
    pointOfSale: 'Point Of Sale',
    salesScreen: 'Sales Screen',
    returnToStore: 'Return To Store',
    logout: 'Logout',
    quickShift: 'Shift Control',
    orderAlerts: 'Order Alerts',
    noAlerts: 'No new online orders.',
    newOrderArrived: 'A new online order just arrived.',
    testSound: 'Test Alert Sound',
    stopSound: 'Stop Alert Sound',
    stopForNow: 'Stop For Now',
    preparing: 'Preparing',
    paymentPending: 'Payment verification is still required.',
    alertSilenced: 'Alert sound stopped',
    orderPreparingNow: 'The order is now being prepared.',
    quickTools: 'Quick Tools',
    scannerShortcut: 'Barcode focus',
    searchShortcut: 'Search focus',
    soundStatus: 'Sound Status',
    soundOn: 'Playing',
    soundOff: 'Ready',
    notificationTone: 'Notification Tone',
    toneChanged: 'Notification tone updated',
    customTone: 'Custom Tone',
    messageTone: 'Message Style',
    luxuryTone: 'Luxury Bell',
    classicTone: 'Classic Chime',
    softTone: 'Soft Gentle',
    cashierReminder: 'Cashier Reminder',
    cashierReminderText: 'Open the shift, scan items, then complete the sale from the summary panel.',
    alertsUpdated: 'Alerts refresh automatically every 15 seconds.'
  },
  ar: {
    cashier: 'مكتب الكاشير',
    pointOfSale: 'نقطة البيع',
    salesScreen: 'شاشة المبيعات',
    returnToStore: 'العودة إلى المتجر',
    logout: 'تسجيل الخروج',
    quickShift: 'إدارة الوردية',
    orderAlerts: 'تنبيهات الطلبات',
    noAlerts: 'لا توجد طلبات جديدة حاليًا.',
    newOrderArrived: 'وصل طلب جديد من المتجر الآن.',
    testSound: 'اختبار صوت الإشعار',
    stopSound: 'إيقاف صوت الإشعار',
    stopForNow: 'إيقاف الآن',
    preparing: 'قيد التجهيز',
    paymentPending: 'ما زال الطلب بانتظار التحقق من الدفع.',
    alertSilenced: 'تم إيقاف صوت التنبيه',
    orderPreparingNow: 'تم تحويل الطلب إلى قيد التجهيز.',
    quickTools: 'أدوات سريعة',
    scannerShortcut: 'تركيز الباركود',
    searchShortcut: 'تركيز البحث',
    soundStatus: 'حالة الصوت',
    soundOn: 'يعمل الآن',
    soundOff: 'جاهز',
    notificationTone: 'نغمة الإشعارات',
    toneChanged: 'تم تغيير نغمة الإشعارات',
    customTone: 'النغمة الخاصة',
    messageTone: 'نغمة الرسالة',
    luxuryTone: 'نغمة فاخرة',
    classicTone: 'نغمة كلاسيكية',
    softTone: 'نغمة هادئة',
    cashierReminder: 'تذكير للكاشير',
    cashierReminderText: 'افتحي الوردية أولًا، امسحي المنتجات، ثم أتمي البيع من صندوق الملخص.',
    alertsUpdated: 'يتم تحديث التنبيهات تلقائيًا كل 15 ثانية.'
  },
  tr: {
    cashier: 'Kasiyer Masasi',
    pointOfSale: 'Satis Noktasi',
    salesScreen: 'Satis Ekrani',
    returnToStore: 'Magazaya Don',
    logout: 'Cikis Yap',
    quickShift: 'Vardiya Kontrolu',
    orderAlerts: 'Siparis Uyarilari',
    noAlerts: 'Yeni online siparis yok.',
    newOrderArrived: 'Magazaya yeni bir online siparis geldi.',
    testSound: 'Bildirim Sesini Test Et',
    stopSound: 'Bildirim Sesini Durdur',
    stopForNow: 'Simdilik Durdur',
    preparing: 'Hazirlaniyor',
    paymentPending: 'Odeme dogrulamasi halen gerekli.',
    alertSilenced: 'Uyari sesi durduruldu',
    orderPreparingNow: 'Siparis hazirlaniyor durumuna alindi.',
    quickTools: 'Hizli Araclar',
    scannerShortcut: 'Barkod odagi',
    searchShortcut: 'Arama odagi',
    soundStatus: 'Ses Durumu',
    soundOn: 'Calisiyor',
    soundOff: 'Hazir',
    notificationTone: 'Bildirim Sesi',
    toneChanged: 'Bildirim sesi degistirildi',
    customTone: 'Ozel Ses',
    messageTone: 'Mesaj Tarzi',
    luxuryTone: 'Luks Zil',
    classicTone: 'Klasik Cingil',
    softTone: 'Yumusak Ses',
    cashierReminder: 'Kasiyer Notu',
    cashierReminderText: 'Once vardiyayi ac, urunleri tara, sonra ozet kutusundan satisi tamamla.',
    alertsUpdated: 'Uyarilar her 15 saniyede otomatik yenilenir.'
  }
};

const CashierLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLangStore();
  const { user, logout } = useAuthStore();
  const ui = labels[language] || labels.en;
  const [alerts, setAlerts] = useState([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [isAlertTonePlaying, setIsAlertTonePlaying] = useState(false);
  const [selectedTone, setSelectedTone] = useState(getNotificationTone());
  const lastAlertIdRef = useRef(null);
  const alertsBootstrappedRef = useRef(false);
  const toneOptions = [
    { value: 'custom', label: ui.customTone },
    { value: 'message', label: ui.messageTone },
    { value: 'luxury', label: ui.luxuryTone },
    { value: 'classic', label: ui.classicTone },
    { value: 'soft', label: ui.softTone },
  ];

  useEffect(() => {
    return enableNotificationAudio();
  }, []);

  useEffect(() => {
    const loadNotificationTone = async () => {
      try {
        const res = await settingsService.getSettings();
        const tone = res?.data?.notificationTone || 'custom';
        setNotificationTone(tone);
        setSelectedTone(tone);
      } catch (error) {
        console.error('Failed to load notification tone for cashier', error);
      }
    };

    loadNotificationTone();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTestSound = async () => {
    await playNotificationTone();
    setIsAlertTonePlaying(isNotificationLooping());
    toast.success(ui.newOrderArrived);
  };

  const handleStopSound = () => {
    stopNotificationTone();
    setIsAlertTonePlaying(false);
  };

  const handleToneChange = (event) => {
    const nextTone = event.target.value;
    stopNotificationTone();
    setNotificationTone(nextTone);
    setSelectedTone(nextTone);
    setIsAlertTonePlaying(false);
    toast.success(ui.toneChanged);
  };

  const handleSilenceAlert = () => {
    stopNotificationTone();
    setIsAlertTonePlaying(false);
    toast.success(ui.alertSilenced);
  };

  const handlePrepareAlert = async (order) => {
    try {
      if (order?.status === 'pending_payment') {
        handleSilenceAlert();
        toast(ui.paymentPending, { icon: '⏳' });
        return;
      }

      await orderService.markOrderPreparing(order._id);
      stopNotificationTone();
      setIsAlertTonePlaying(false);
      setAlerts((prev) => prev.filter((entry) => entry._id !== order._id));
      toast.success(ui.orderPreparingNow);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update order');
    }
  };

  useEffect(() => {
    let intervalId;

    const loadAlerts = async ({ notify = false } = {}) => {
      try {
        const res = await orderService.getOrderAlerts(8);
        const nextAlerts = res.data || [];
        setAlerts(nextAlerts);

        if (!nextAlerts.length && isNotificationLooping()) {
          stopNotificationTone();
          setIsAlertTonePlaying(false);
        }

        const latestId = nextAlerts[0]?._id || null;
        if (!alertsBootstrappedRef.current) {
          alertsBootstrappedRef.current = true;
          lastAlertIdRef.current = latestId;
          return;
        }

        if (notify && latestId && latestId !== lastAlertIdRef.current) {
          playNotificationTone();
          setIsAlertTonePlaying(true);
          toast.success(ui.newOrderArrived);
        }

        lastAlertIdRef.current = latestId;
      } catch (error) {
        console.error('Failed to load cashier alerts', error);
      }
    };

    if (user?.role === 'cashier' || user?.role === 'admin') {
      loadAlerts();
      intervalId = window.setInterval(() => loadAlerts({ notify: true }), 15000);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [ui.newOrderArrived, user?.role]);

  return (
    <div className="flex min-h-screen bg-[#f6efe6] text-[#25170f]">
      <aside className="hidden w-80 border-r border-[#2b2341] bg-[#1d1730] p-8 text-white lg:flex lg:flex-col shadow-[18px_0_40px_rgba(20,13,34,0.14)]">
        <div>
          <p className="text-3xl font-serif tracking-[0.25em] text-[#d1a85d]">MELORA</p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.35em] text-[#f3e8d4]">{ui.pointOfSale}</p>
        </div>

        <div className="mt-12 rounded-[2rem] border border-[#3f355a] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[#f0dfbe]">{ui.cashier}</p>
          <p className="mt-3 text-2xl font-semibold text-[#fff8ef]">{user?.name || 'Staff'}</p>
          <p className="mt-2 break-all text-sm text-[#f5ead9]">{user?.email}</p>
        </div>

        <div className="mt-6 rounded-[2rem] border border-[#3f355a] bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[#f0dfbe]">{ui.quickShift}</p>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={() => setLanguage('en')} className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${language === 'en' ? 'bg-[#d1a85d] text-[#1d1730]' : 'bg-white/10 text-[#fff8ef] hover:bg-white/15'}`}>EN</button>
            <button onClick={() => setLanguage('ar')} className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${language === 'ar' ? 'bg-[#d1a85d] text-[#1d1730]' : 'bg-white/10 text-[#fff8ef] hover:bg-white/15'}`}>AR</button>
            <button onClick={() => setLanguage('tr')} className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${language === 'tr' ? 'bg-[#d1a85d] text-[#1d1730]' : 'bg-white/10 text-[#fff8ef] hover:bg-white/15'}`}>TR</button>
          </div>
        </div>

        <div className="relative mt-6 rounded-[2rem] border border-[#3f355a] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5">
          <button onClick={() => setAlertsOpen((prev) => !prev)} className="flex w-full items-center justify-between text-left">
            <span className="text-xs uppercase tracking-[0.3em] text-[#f0dfbe]">{ui.orderAlerts}</span>
            <span className="flex h-8 min-w-[32px] items-center justify-center rounded-full bg-[#d1a85d] px-2 text-xs font-bold text-[#1d1730]">{alerts.length}</span>
          </button>

          {alertsOpen && (
            <div className="mt-4 space-y-3">
              {alerts.length > 0 ? alerts.map((alert) => (
                <div key={alert._id} className="rounded-2xl border border-[#4f436c] bg-white/5 p-4">
                  <p className="text-sm font-semibold text-[#fff8ef]">{alert.customerName}</p>
                  <p className="mt-1 text-xs text-[#f0dfbe]">{alert.invoiceNumber || alert._id?.slice(-8)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSilenceAlert}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                    >
                      {ui.stopForNow}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrepareAlert(alert)}
                      className="rounded-lg border border-[#d7c1a2] bg-[#f6ead8] px-3 py-1.5 text-[11px] font-semibold text-[#5f4321] hover:bg-[#eddcc6]"
                    >
                      {ui.preparing}
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-[#f5ead9]">{ui.noAlerts}</p>
              )}
            </div>
          )}
        </div>

        <nav className="mt-10 space-y-3">
          <button
            type="button"
            onClick={handleTestSound}
            className="block w-full rounded-2xl border border-[#d1a85d] bg-[#f6e7bf] px-5 py-4 text-sm font-semibold text-[#1d1730] transition-colors hover:bg-[#edd8a1]"
          >
            {ui.testSound}
          </button>
          {isAlertTonePlaying && (
            <button
              type="button"
              onClick={handleStopSound}
              className="block w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              {ui.stopSound}
            </button>
          )}
          <Link
            to="/cashier"
            className={`block rounded-2xl px-5 py-4 text-sm font-semibold transition-colors ${
              location.pathname === '/cashier'
                ? 'bg-[#d1a85d] text-[#1d1730]'
                : 'bg-white/10 text-[#fff8ef] hover:bg-white/15'
            }`}
          >
            {ui.salesScreen}
          </Link>
          <Link
            to="/"
            className="block rounded-2xl px-5 py-4 text-sm font-semibold text-[#fff8ef] transition-colors hover:bg-white/15"
          >
            {ui.returnToStore}
          </Link>
        </nav>

        <div className="mt-8 space-y-4">
          <div className="rounded-[2rem] border border-[#3f355a] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f0dfbe]">{ui.quickTools}</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-[#4f436c] bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#d9c5a0]">{ui.scannerShortcut}</p>
                <p className="mt-2 text-sm font-semibold text-[#fff8ef]">Alt + B</p>
              </div>
              <div className="rounded-2xl border border-[#4f436c] bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#d9c5a0]">{ui.searchShortcut}</p>
                <p className="mt-2 text-sm font-semibold text-[#fff8ef]">Alt + S</p>
              </div>
              <div className="rounded-2xl border border-[#4f436c] bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#d9c5a0]">{ui.soundStatus}</p>
                <p className={`mt-2 text-sm font-semibold ${isAlertTonePlaying ? 'text-[#f5d58e]' : 'text-[#fff8ef]'}`}>
                  {isAlertTonePlaying ? ui.soundOn : ui.soundOff}
                </p>
              </div>
              <div className="rounded-2xl border border-[#4f436c] bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#d9c5a0]">{ui.notificationTone}</p>
                <select
                  value={selectedTone}
                  onChange={handleToneChange}
                  className="mt-3 w-full rounded-xl border border-[#5f537b] bg-[#251d3b] px-3 py-2 text-sm font-semibold text-[#fff8ef] outline-none"
                >
                  {toneOptions.map((tone) => (
                    <option key={tone.value} value={tone.value}>{tone.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#3f355a] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f0dfbe]">{ui.cashierReminder}</p>
            <p className="mt-4 text-sm leading-7 text-[#f5ead9]">{ui.cashierReminderText}</p>
            <p className="mt-3 text-xs text-[#d8c7ae]">{ui.alertsUpdated}</p>
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full rounded-2xl border border-[#4f436c] px-5 py-4 text-sm font-semibold text-[#fff8ef] transition-colors hover:bg-white/10"
          >
            {ui.logout}
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="border-b border-[#eadbca] bg-white/85 px-6 py-5 backdrop-blur-sm lg:hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#8c6a45]">{ui.pointOfSale}</p>
              <h1 className="mt-2 font-serif text-2xl text-[#25170f]">{ui.cashier}</h1>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleTestSound} className="rounded-xl bg-[#d1a85d] px-3 py-2 text-xs font-semibold text-[#1d1730]">
                {ui.testSound}
              </button>
              <select
                value={selectedTone}
                onChange={handleToneChange}
                className="rounded-xl border border-[#d9c8af] bg-white px-3 py-2 text-xs font-semibold text-[#25170f]"
              >
                {toneOptions.map((tone) => (
                  <option key={tone.value} value={tone.value}>{tone.label}</option>
                ))}
              </select>
              {isAlertTonePlaying && (
                <button onClick={handleStopSound} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                  {ui.stopSound}
                </button>
              )}
              <button onClick={() => setAlertsOpen((prev) => !prev)} className="relative rounded-full border border-[#d9c8af] bg-white px-3 py-2 text-sm font-semibold text-[#25170f]">
                🔔
                {alerts.length > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#d1a85d] px-1 text-[10px] font-bold text-[#1d1730]">{alerts.length}</span>}
              </button>
              <button onClick={() => setLanguage('en')} className={`rounded-full px-3 py-2 text-xs font-semibold ${language === 'en' ? 'bg-[#2f1f15] text-white' : 'bg-[#f4eadf] text-[#7a6653]'}`}>EN</button>
              <button onClick={() => setLanguage('ar')} className={`rounded-full px-3 py-2 text-xs font-semibold ${language === 'ar' ? 'bg-[#2f1f15] text-white' : 'bg-[#f4eadf] text-[#7a6653]'}`}>AR</button>
              <button onClick={() => setLanguage('tr')} className={`rounded-full px-3 py-2 text-xs font-semibold ${language === 'tr' ? 'bg-[#2f1f15] text-white' : 'bg-[#f4eadf] text-[#7a6653]'}`}>TR</button>
              <Link to="/" className="text-sm font-semibold text-[#8c6a45]">{ui.returnToStore}</Link>
              <button onClick={handleLogout} className="rounded-xl border border-[#d9c8af] px-4 py-2 text-sm font-semibold text-[#25170f]">
                {ui.logout}
              </button>
            </div>
          </div>

          {alertsOpen && (
            <div className="mt-4 space-y-3 rounded-2xl border border-[#eadbca] bg-white p-4">
              {alerts.length > 0 ? alerts.map((alert) => (
                <div key={alert._id} className="rounded-2xl border border-[#eee1d0] bg-[#faf5ee] p-3">
                  <p className="text-sm font-semibold text-[#25170f]">{alert.customerName}</p>
                  <p className="mt-1 text-xs text-[#8c6a45]">{alert.invoiceNumber || alert._id?.slice(-8)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSilenceAlert}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700"
                    >
                      {ui.stopForNow}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrepareAlert(alert)}
                      className="rounded-lg border border-[#d7c1a2] bg-[#f6ead8] px-3 py-1.5 text-[11px] font-semibold text-[#5f4321]"
                    >
                      {ui.preparing}
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-[#7a6653]">{ui.noAlerts}</p>
              )}
            </div>
          )}
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default CashierLayout;
