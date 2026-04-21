import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { settingsService } from '../../services/settingsService';
import Loader from '../../components/shared/Loader';
import useTranslation from '../../hooks/useTranslation';
import useCurrencyStore from '../../store/useCurrencyStore';
import useLangStore from '../../store/useLangStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Package, Users, DollarSign, ShoppingBag, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProductFallbackImage, resolveAssetUrl as resolveSharedAssetUrl } from '../../utils/assets';

const dashboardUi = {
  en: {
    monthlyTarget: 'Monthly Target',
    weeklyTarget: 'Weekly Target',
    achieved: 'Achieved',
    remaining: 'Remaining',
    overTarget: 'Over Target',
    progress: 'Progress',
    setTargetFirst: 'Set a target first',
    monthRevenue: "Revenue pace against this month's goal",
    weekRevenue: "Revenue pace against this week's goal",
    posOverview: 'POS Overview',
    posMonth: 'POS This Month',
    topPosProducts: 'Top POS Products',
    recentPosSales: 'Recent POS Sales',
    cashierShifts: 'Cashier Shifts',
    warehouse: 'Warehouse Snapshot',
    monthlyPlaceholder: 'Enter monthly target',
    weeklyPlaceholder: 'Enter weekly target',
    saveTargets: 'Save Targets',
    targetHelpMonth: 'The admin can set the monthly goal right here and track progress instantly.',
    targetHelpWeek: 'Use the weekly goal to monitor short-term momentum for the boutique.',
    sales: 'Sales',
    invoices: 'Invoices',
    bestDay: 'Best Day',
    bestDaySales: 'Best Day Sales',
    sold: 'sold',
    noPosSales: 'No POS sales recorded yet.',
    noRecentPosSales: 'No recent POS sales yet.',
    opened: 'Opened',
    closed: 'Closed',
    expected: 'Expected',
    actual: 'Actual',
    variance: 'Variance',
    stillOpen: 'Still Open',
    staff: 'Staff',
    saveSuccess: 'Targets saved successfully.',
    saveFailed: 'Failed to save targets.',
    title: 'Dashboard',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    allTime: 'All Time',
    exportCsv: 'Export Orders (CSV)',
    revenueOverview: 'Revenue Overview (Last 30 Days)',
    ordersByStatus: 'Orders by Status',
    topProductsTitle: 'Top Products',
    recentOrdersTitle: 'Recent Orders',
    viewAllOrders: 'View All Orders',
    noTopProducts: 'No data available',
    noRecentOrders: 'No recent orders',
    orderId: 'Order ID',
    customer: 'Customer',
    date: 'Date',
    total: 'Total',
    status: 'Status',
    criticalStock: 'Critical Stock Alerts',
    leftInWarehouse: 'left in warehouse',
    pendingPayment: 'Pending Payment'
  },
  ar: {
    monthlyTarget: 'الهدف الشهري',
    weeklyTarget: 'الهدف الأسبوعي',
    achieved: 'المحقق',
    remaining: 'المتبقي',
    overTarget: 'فوق الهدف',
    progress: 'التقدم',
    setTargetFirst: 'حددي الهدف أولًا',
    monthRevenue: 'معدل التقدم نحو هدف هذا الشهر',
    weekRevenue: 'معدل التقدم نحو هدف هذا الأسبوع',
    posOverview: 'نظرة عامة على مبيعات الكاشير',
    posMonth: 'مبيعات POS هذا الشهر',
    topPosProducts: 'أفضل منتجات POS',
    recentPosSales: 'آخر مبيعات POS',
    cashierShifts: 'ورديات الكاشير',
    warehouse: 'ملخص المستودع',
    monthlyPlaceholder: 'أدخلي الهدف الشهري',
    weeklyPlaceholder: 'أدخلي الهدف الأسبوعي',
    saveTargets: 'حفظ الأهداف',
    targetHelpMonth: 'يمكن للأدمن تحديد الهدف الشهري من هنا ومتابعة التقدم مباشرة.',
    targetHelpWeek: 'استخدمي الهدف الأسبوعي لمتابعة زخم المبيعات خلال الأسبوع.',
    sales: 'المبيعات',
    invoices: 'الفواتير',
    bestDay: 'أفضل يوم',
    bestDaySales: 'مبيعات أفضل يوم',
    sold: 'مباع',
    noPosSales: 'لا توجد مبيعات POS بعد.',
    noRecentPosSales: 'لا توجد مبيعات POS حديثة بعد.',
    opened: 'فُتحت',
    closed: 'أُغلقت',
    expected: 'المتوقع',
    actual: 'الفعلي',
    variance: 'الفارق',
    stillOpen: 'ما زالت مفتوحة',
    staff: 'الموظف',
    saveSuccess: 'تم حفظ الأهداف بنجاح.',
    saveFailed: 'تعذر حفظ الأهداف.',
    title: 'لوحة القيادة',
    today: 'اليوم',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    thisYear: 'هذا العام',
    allTime: 'كل الوقت',
    exportCsv: 'تصدير الطلبات (CSV)',
    revenueOverview: 'نظرة الإيرادات خلال آخر 30 يومًا',
    ordersByStatus: 'الطلبات حسب الحالة',
    topProductsTitle: 'أفضل المنتجات',
    recentOrdersTitle: 'أحدث الطلبات',
    viewAllOrders: 'عرض كل الطلبات',
    noTopProducts: 'لا توجد بيانات متاحة',
    noRecentOrders: 'لا توجد طلبات حديثة',
    orderId: 'رقم الطلب',
    customer: 'العميل',
    date: 'التاريخ',
    total: 'الإجمالي',
    status: 'الحالة',
    criticalStock: 'تنبيهات المخزون الحرج',
    leftInWarehouse: 'متبقي في المستودع',
    pendingPayment: 'بانتظار الدفع'
  },  tr: {
    monthlyTarget: 'Aylik Hedef',
    weeklyTarget: 'Haftalik Hedef',
    achieved: 'Ulasilan',
    remaining: 'Kalan',
    overTarget: 'Hedef Ustu',
    progress: 'Ilerleme',
    setTargetFirst: 'Once hedef belirleyin',
    monthRevenue: 'Bu ayin hedefe gore satis hizi',
    weekRevenue: 'Bu haftanin hedefe gore satis hizi',
    posOverview: 'POS Ozeti',
    posMonth: 'Bu Ay POS',
    topPosProducts: 'En İyi POS Ürünleri',
    recentPosSales: 'Son POS Satislari',
    cashierShifts: 'Kasiyer Vardiyalari',
    warehouse: 'Depo Ozeti',
    monthlyPlaceholder: 'Aylik hedef girin',
    weeklyPlaceholder: 'Haftalik hedef girin',
    saveTargets: 'Hedefleri Kaydet',
    targetHelpMonth: 'Admin aylik hedefi buradan belirleyebilir ve ilerlemeyi aninda izleyebilir.',
    targetHelpWeek: 'Haftalik hedefle kisa vadeli satis temposunu takip edin.',
    sales: 'Satis',
    invoices: 'Fisler',
    bestDay: 'En Iyi Gun',
    bestDaySales: 'En Iyi Gun Satisi',
    sold: 'satildi',
    noPosSales: 'Henüz POS satışı yok.',
    noRecentPosSales: 'Henüz son POS satışı yok.',
    opened: 'Acilis',
    closed: 'Kapanis',
    expected: 'Beklenen',
    actual: 'Gerceklesen',
    variance: 'Fark',
    stillOpen: 'Hala Acik',
    staff: 'Personel',
    saveSuccess: 'Hedefler basariyla kaydedildi.',
    saveFailed: 'Hedefler kaydedilemedi.',
    title: 'Kontrol Paneli',
    today: 'Bugun',
    thisWeek: 'Bu Hafta',
    thisMonth: 'Bu Ay',
    thisYear: 'Bu Yil',
    allTime: 'Tum Zamanlar',
    exportCsv: 'Siparişleri Dışa Aktar (CSV)',
    revenueOverview: 'Gelir Gorunumu (Son 30 Gun)',
    ordersByStatus: 'Duruma Gore Siparisler',
    topProductsTitle: 'En İyi Ürünler',
    recentOrdersTitle: 'Son Siparisler',
    viewAllOrders: 'Tum Siparisleri Gor',
    noTopProducts: 'Veri bulunamadi',
    noRecentOrders: 'Son sipariş yok',
    orderId: 'Siparis No',
    customer: 'Müşteri',
    date: 'Tarih',
    total: 'Toplam',
    status: 'Durum',
    criticalStock: 'Kritik Stok Uyarilari',
    leftInWarehouse: 'depoda kalan',
    pendingPayment: 'Ödeme Bekliyor'
  }
};

const AdminDashboard = () => {
  const { t } = useTranslation('admin');
  const formatPrice = useCurrencyStore(state => state.formatPrice);
  const { language } = useLangStore();
  const ui = dashboardUi[language] || dashboardUi.en;
  const [stats, setStats] = useState({
    totalRevenue: '0.00',
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    inventoryStats: { totalUnits: 0, lowStockCount: 0, outOfStockCount: 0 },
    visitorStats: { today: 0, week: 0, month: 0, allTime: 0 }
  });
  const [trends, setTrends] = useState({ revenue: 0, orders: 0, users: 0 });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [posShifts, setPosShifts] = useState([]);
  const [posSummary, setPosSummary] = useState({
    today: { totalSales: 0, invoices: 0, pieces: 0, estimatedProfit: 0, discountTotal: 0 },
    month: { totalSales: 0, invoices: 0, bestDay: null, salesByDay: [] },
    topProducts: [],
    lowProducts: [],
    recentSales: []
  });
  const [monthlySalesTarget, setMonthlySalesTarget] = useState(0);
  const [weeklySalesTarget, setWeeklySalesTarget] = useState(0);
  const [monthlyTargetInput, setMonthlyTargetInput] = useState('0');
  const [weeklyTargetInput, setWeeklyTargetInput] = useState('0');
  const [savingTargets, setSavingTargets] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all'); // 'today', 'week', 'month', 'year', 'all'

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [res, posRes, shiftsRes, settingsRes] = await Promise.all([
          orderService.getAdminStats(timeframe),
          orderService.getPosSummary(),
          orderService.getPosShifts(6),
          settingsService.getSettings()
        ]);
        const data = res.data;
        
        setStats({
          totalRevenue: data.totalRevenue,
          totalOrders: data.totalOrders,
          totalProducts: data.totalProducts,
          totalUsers: data.totalUsers,
          inventoryStats: data.inventoryStats || { totalUnits: 0, lowStockCount: 0, outOfStockCount: 0 },
          visitorStats: data.visitorStats || { today: 0, week: 0, month: 0, allTime: 0 }
        });
        
        setTrends(data.trends || { revenue: 0, orders: 0, users: 0 });
        setChartData(data.revenueByDay || []);
        setPieData(data.ordersByStatus || []);
        setLowStockAlerts(data.lowStockAlerts || []);
        setTopProducts(data.topProducts || []);
        setPosSummary(posRes.data || posRes || {
          today: { totalSales: 0, invoices: 0, pieces: 0, estimatedProfit: 0, discountTotal: 0 },
          month: { totalSales: 0, invoices: 0, bestDay: null, salesByDay: [] },
          topProducts: [],
          lowProducts: [],
          recentSales: []
        });
        setPosShifts(shiftsRes.data || []);
        const nextMonthlyTarget = Number(settingsRes?.data?.monthlySalesTarget || 0);
        const nextWeeklyTarget = Number(settingsRes?.data?.weeklySalesTarget || 0);
        setMonthlySalesTarget(nextMonthlyTarget);
        setWeeklySalesTarget(nextWeeklyTarget);
        setMonthlyTargetInput(String(nextMonthlyTarget || ''));
        setWeeklyTargetInput(String(nextWeeklyTarget || ''));

        // Fetch recent orders
        const ordersRes = await orderService.getAllOrders('', 'All', 1, 5);
        setRecentOrders(ordersRes.data || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [timeframe]);

  const handleExportCSV = async () => {
    try {
      const url = orderService.exportOrdersCSV();
      // Needs authorization header attached if strictly protected,
      // Workaround: We can fetch it as blob then trigger download
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
      toast.error(ui.exportCsv);
      console.error(err);
    }
  };

  const COLORS = ['#8B6914', '#1a1a2e', '#4f46e5', '#10b981', '#f43f5e'];
  const monthSales = Number(posSummary.month?.totalSales || 0);
  const weeklySales = Number((posSummary.month?.salesByDay || []).slice(-7).reduce((sum, item) => sum + Number(item.total || item.revenue || 0), 0));
  const targetProgress = monthlySalesTarget > 0 ? (monthSales / monthlySalesTarget) * 100 : 0;
  const progressWidth = Math.min(targetProgress, 100);
  const remainingTarget = Math.max(monthlySalesTarget - monthSales, 0);
  const exceededTarget = Math.max(monthSales - monthlySalesTarget, 0);
  const weeklyProgress = weeklySalesTarget > 0 ? (weeklySales / weeklySalesTarget) * 100 : 0;
  const weeklyProgressWidth = Math.min(weeklyProgress, 100);
  const weeklyRemaining = Math.max(weeklySalesTarget - weeklySales, 0);
  const weeklyExceeded = Math.max(weeklySales - weeklySalesTarget, 0);

  const saveSalesTargets = async () => {
    try {
      setSavingTargets(true);
      const nextMonthly = Number(monthlyTargetInput || 0);
      const nextWeekly = Number(weeklyTargetInput || 0);
      await settingsService.updateSettings({ monthlySalesTarget: nextMonthly, weeklySalesTarget: nextWeekly });
      setMonthlySalesTarget(nextMonthly);
      setWeeklySalesTarget(nextWeekly);
      toast.success(ui.saveSuccess);
    } catch (error) {
      console.error(error);
      toast.error(ui.saveFailed);
    } finally {
      setSavingTargets(false);
    }
  };

  const resolveAssetUrl = (value, fallback = '/placeholder.jpg') => resolveSharedAssetUrl(value, fallback);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif text-black">{ui.title}</h1>
        
        <div className="flex gap-4">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 p-2 text-sm focus:outline-none focus:border-black rounded bg-white shadow-sm"
          >
            <option value="today">{ui.today}</option>
            <option value="week">{ui.thisWeek}</option>
            <option value="month">{ui.thisMonth}</option>
            <option value="year">{ui.thisYear}</option>
            <option value="all">{ui.allTime}</option>
          </select>
          <button 
            onClick={handleExportCSV}
            className="bg-black text-white px-4 py-2 text-sm font-medium rounded hover:bg-gold transition-colors shadow-sm"
          >
            {ui.exportCsv}
          </button>
        </div>
      </div>
      
      {/* Visitor Stats Grid */}
      <h3 className="text-lg font-serif text-brand mb-4 mt-8">{t?.dashboard?.visitorAnalytics || 'Visitor Analytics'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[
          { label: t?.dashboard?.visitsToday || 'Visits Today', value: stats.visitorStats?.today || 0, icon: Eye },
          { label: t?.dashboard?.visitsWeek || 'Visits This Week', value: stats.visitorStats?.week || 0, icon: Eye },
          { label: t?.dashboard?.visitsMonth || 'Visits This Month', value: stats.visitorStats?.month || 0, icon: Eye },
          { label: t?.dashboard?.visitsAllTime || 'All-Time Visits', value: stats.visitorStats?.allTime || 0, icon: Eye },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
          <div key={`viz-${idx}`} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Icon size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        )})}
      </div>

      {/* Stats Grid */}
      <h3 className="text-lg font-serif text-brand mb-4">{t?.dashboard?.storeOverview || 'Store Overview'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { key: 'totalRevenue', label: t?.dashboard?.totalRevenue || 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, trend: trends.revenue },
          { key: 'totalOrders', label: t?.dashboard?.totalOrders || 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, trend: trends.orders },
          { key: 'totalProducts', label: t?.dashboard?.totalProducts || 'Total Products', value: stats.totalProducts, icon: Package, trend: null },
          { key: 'totalUsers', label: t?.dashboard?.totalUsers || 'Total Users', value: stats.totalUsers, icon: Users, trend: trends.users },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-brand">
                <Icon size={24} />
              </div>
              {stat.trend !== null && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {stat.trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{Math.abs(stat.trend)}%</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        )})}
      </div>

      <h3 className="text-lg font-serif text-brand mb-4 mt-10">{ui.posOverview}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        {[
          { label: language === 'ar' ? 'مبيعات POS اليوم' : language === 'tr' ? 'Bugun POS Satislari' : 'POS Sales Today', value: formatPrice(posSummary.today?.totalSales || 0), tone: 'text-[#25170f] bg-[#fff9f2] border-[#eadbca]' },
          { label: language === 'ar' ? 'فواتير POS اليوم' : language === 'tr' ? 'Bugun POS Fisleri' : 'POS Invoices Today', value: posSummary.today?.invoices || 0, tone: 'text-[#25170f] bg-white border-[#eadbca]' },
          { label: language === 'ar' ? 'قطع POS اليوم' : language === 'tr' ? 'Bugun POS Parcalari' : 'POS Pieces Today', value: posSummary.today?.pieces || 0, tone: 'text-[#25170f] bg-white border-[#eadbca]' },
          { label: language === 'ar' ? 'ربح POS اليوم' : language === 'tr' ? 'Bugun POS Kari' : 'POS Profit Today', value: formatPrice(posSummary.today?.estimatedProfit || 0), tone: 'text-emerald-800 bg-emerald-50 border-emerald-100' },
          { label: language === 'ar' ? 'خصومات POS اليوم' : language === 'tr' ? 'Bugun POS Indirimleri' : 'POS Discounts Today', value: formatPrice(posSummary.today?.discountTotal || 0), tone: 'text-amber-800 bg-amber-50 border-amber-100' },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl border p-6 shadow-sm ${item.tone}`}>
            <p className="text-sm font-medium mb-2">{item.label}</p>
            <h3 className="text-3xl font-bold">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-2xl border border-[#eadbca] bg-[linear-gradient(135deg,#fffaf5,#f5eadf)] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#9d7848]">{ui.monthlyTarget}</p>
            <h2 className="mt-2 text-2xl font-serif text-[#25170f]">{ui.monthRevenue}</h2>
            <p className="mt-2 text-sm text-[#6f5b49]">{ui.targetHelpMonth}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4">
              <label className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.monthlyTarget}</label>
              <input type="number" min="0" value={monthlyTargetInput} onChange={(e) => setMonthlyTargetInput(e.target.value)} placeholder={ui.monthlyPlaceholder} className="mt-2 w-full rounded-xl border border-[#e3d1bd] bg-white px-3 py-2 text-sm font-semibold text-[#25170f] outline-none transition focus:border-[#8b6914] focus:ring-2 focus:ring-[#8b6914]/15" />
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.achieved}</p>
              <p className="mt-2 text-xl font-semibold text-[#25170f]">{formatPrice(monthSales)}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{monthlySalesTarget > 0 && exceededTarget > 0 ? ui.overTarget : ui.remaining}</p>
              <p className={monthlySalesTarget > 0 && exceededTarget > 0 ? 'mt-2 text-xl font-semibold text-emerald-700' : 'mt-2 text-xl font-semibold text-[#25170f]'}>{monthlySalesTarget > 0 ? formatPrice(exceededTarget > 0 ? exceededTarget : remainingTarget) : '?'}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4">
              <button type="button" onClick={saveSalesTargets} disabled={savingTargets} className="mt-6 w-full rounded-xl bg-[#1d1730] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2145] disabled:cursor-not-allowed disabled:opacity-60">{savingTargets ? "..." : ui.saveTargets}</button>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-[#6f5b49]">{ui.progress}</span>
            <span className="font-semibold text-[#25170f]">{monthlySalesTarget > 0 ? (targetProgress.toFixed(1) + "%") : ui.setTargetFirst}</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-white/80">
            <div className={monthlySalesTarget > 0 && targetProgress >= 100 ? "h-full rounded-full transition-all bg-emerald-500" : "h-full rounded-full transition-all bg-[#1d1730]"} style={{ width: (monthlySalesTarget > 0 ? progressWidth : 0) + "%" }} />
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-[#eadbca] bg-[linear-gradient(135deg,#fffdf9,#efe4d7)] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#9d7848]">{ui.weeklyTarget}</p>
            <h2 className="mt-2 text-2xl font-serif text-[#25170f]">{ui.weekRevenue}</h2>
            <p className="mt-2 text-sm text-[#6f5b49]">{ui.targetHelpWeek}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4">
              <label className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.weeklyTarget}</label>
              <input type="number" min="0" value={weeklyTargetInput} onChange={(e) => setWeeklyTargetInput(e.target.value)} placeholder={ui.weeklyPlaceholder} className="mt-2 w-full rounded-xl border border-[#e3d1bd] bg-white px-3 py-2 text-sm font-semibold text-[#25170f] outline-none transition focus:border-[#8b6914] focus:ring-2 focus:ring-[#8b6914]/15" />
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{ui.achieved}</p>
              <p className="mt-2 text-xl font-semibold text-[#25170f]">{formatPrice(weeklySales)}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#9d7848]">{weeklySalesTarget > 0 && weeklyExceeded > 0 ? ui.overTarget : ui.remaining}</p>
              <p className={weeklySalesTarget > 0 && weeklyExceeded > 0 ? 'mt-2 text-xl font-semibold text-emerald-700' : 'mt-2 text-xl font-semibold text-[#25170f]'}>{weeklySalesTarget > 0 ? formatPrice(weeklyExceeded > 0 ? weeklyExceeded : weeklyRemaining) : '?'}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4">
              <button type="button" onClick={saveSalesTargets} disabled={savingTargets} className="mt-6 w-full rounded-xl bg-[#8b6914] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#725611] disabled:cursor-not-allowed disabled:opacity-60">{savingTargets ? "..." : ui.saveTargets}</button>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-[#6f5b49]">{ui.progress}</span>
            <span className="font-semibold text-[#25170f]">{weeklySalesTarget > 0 ? (weeklyProgress.toFixed(1) + "%") : ui.setTargetFirst}</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-white/80">
            <div className={weeklySalesTarget > 0 && weeklyProgress >= 100 ? "h-full rounded-full transition-all bg-emerald-500" : "h-full rounded-full transition-all bg-[#8b6914]"} style={{ width: (weeklySalesTarget > 0 ? weeklyProgressWidth : 0) + "%" }} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-serif text-black">{ui.posMonth}</h2>
          </div>
          <div className="p-6 space-y-4 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>{ui.sales}</span>
              <span className="font-semibold text-black">{formatPrice(posSummary.month?.totalSales || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{ui.invoices}</span>
              <span className="font-semibold text-black">{posSummary.month?.invoices || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{ui.bestDay}</span>
              <span className="font-semibold text-black">{posSummary.month?.bestDay?.date || '?'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{ui.bestDaySales}</span>
              <span className="font-semibold text-black">{formatPrice(posSummary.month?.bestDay?.total || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-serif text-black">{ui.topPosProducts}</h2>
          </div>
          <div className="p-6 space-y-3">
            {(posSummary.topProducts || []).length ? posSummary.topProducts.map((item, index) => (
              <div key={`${item._id || item.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3">
                <div>
                  <p className="font-semibold text-black">{item.name || '?'}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.quantitySold || 0} {ui.sold}</p>
                </div>
                <span className="text-sm font-bold text-brand">{formatPrice(item.revenue || 0)}</span>
              </div>
            )) : (
              <p className="text-sm text-gray-500">{ui.noPosSales}</p>
            )}
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-serif text-black">{ui.recentPosSales}</h2>
          </div>
          <div className="p-6 space-y-3">
            {(posSummary.recentSales || []).length ? posSummary.recentSales.map((sale) => (
              <div key={sale._id} className="rounded-xl border border-gray-100 px-4 py-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-black">{sale.invoiceNumber || String(sale._id || '').slice(-8)}</span>
                  <span className="font-bold text-brand">{formatPrice(sale.total || 0)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-500">
                  <span>{sale.customerName || (language === 'ar' ? 'عميل مباشر' : language === 'tr' ? 'Mağaza Müşterisi' : 'Walk-in Customer')}</span>
                  <span>{new Date(sale.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500">{ui.noRecentPosSales}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-serif text-black">{ui.cashierShifts}</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {posShifts.length ? posShifts.map((shift) => (
            <div key={shift._id} className="grid gap-4 px-6 py-5 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr]">
              <div>
                <p className="text-sm font-semibold text-black">{shift.cashier?.name || ui.staff}</p>
                <p className="mt-1 text-xs text-gray-500">{shift.cashier?.email || ''}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{ui.opened}</p>
                <p className="mt-2 text-sm font-medium text-black">{new Date(shift.openedAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{ui.closed}</p>
                <p className="mt-2 text-sm font-medium text-black">{shift.closedAt ? new Date(shift.closedAt).toLocaleString() : ui.stillOpen}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{ui.expected}</p>
                <p className="mt-2 text-sm font-semibold text-black">{formatPrice(shift.expectedTotal || 0)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{ui.actual}</p>
                <p className="mt-2 text-sm font-semibold text-black">{formatPrice(shift.actualTotal || 0)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{ui.variance}</p>
                <p className={`mt-2 text-sm font-semibold ${Number(shift.varianceTotal || 0) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatPrice(shift.varianceTotal || 0)}</p>
              </div>
            </div>
          )) : (
            <div className="px-6 py-8 text-sm text-gray-500">{language === 'ar' ? 'لا توجد ورديات كاشير مسجلة بعد.' : language === 'tr' ? 'Henüz kasiyer vardiyası yok.' : 'No cashier shifts recorded yet.'}</div>
          )}
        </div>
      </div>

      <h3 className="text-lg font-serif text-brand mb-4">{ui.warehouse}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: language === 'ar' ? 'القطع المتوفرة' : language === 'tr' ? 'Mevcut Parcalar' : 'Available Pieces', value: stats.inventoryStats?.totalUnits || 0, tone: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { label: language === 'ar' ? 'مخزون حرج (1-2)' : language === 'tr' ? 'Kritik Stok (1-2)' : 'Critical Stock (1-2)', value: stats.inventoryStats?.lowStockCount || 0, tone: 'text-amber-700 bg-amber-50 border-amber-100' },
          { label: language === 'ar' ? 'نفد المخزون' : language === 'tr' ? 'Stokta Yok' : 'Out of Stock', value: stats.inventoryStats?.outOfStockCount || 0, tone: 'text-red-700 bg-red-50 border-red-100' },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl border p-6 shadow-sm ${item.tone}`}>
            <p className="text-sm font-medium mb-2">{item.label}</p>
            <h3 className="text-3xl font-bold">{item.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-serif text-brand mb-6">Revenue Overview (Last 30 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} tickFormatter={(val) => formatPrice(val)} />
                <RechartsTooltip formatter={(value) => formatPrice(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="revenue" stroke="#8B6914" strokeWidth={3} dot={{r: 4, fill: '#8B6914', strokeWidth: 0}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-serif text-brand mb-6">{t?.dashboard?.ordersByStatus || 'Orders by Status'}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-red-700">
            <AlertTriangle size={24} />
            <h3 className="text-lg font-bold">Critical Stock Alerts</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {lowStockAlerts.map(prod => (
              <div key={prod.id} className="bg-white p-3 rounded-lg flex items-center gap-3 shadow-sm border border-red-100">
                <img
                  loading="lazy"
                  src={resolveAssetUrl(prod.image, getProductFallbackImage({ name: { en: prod.name } }))}
                  alt={prod.name}
                  className="w-12 h-12 object-cover rounded"
                  onError={(event) => {
                    event.currentTarget.src = getProductFallbackImage({ name: { en: prod.name } });
                  }}
                />
                <div>
                  <p className="text-xs font-medium text-gray-900 line-clamp-1">{prod.name}</p>
                  <p className="text-xs font-bold text-red-600 mt-1">{prod.stock} left in warehouse</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Products Table */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden md:col-span-1 flex flex-col">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-serif text-black">{t?.dashboard?.topProducts || 'Top Products'}</h2>
          </div>
          <div className="p-6 grow flex flex-col justify-center">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 10, fill: '#64748b'}} width={100} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="quantitySold" fill="#8B6914" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 text-sm">No data available</p>
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden md:col-span-2">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-serif text-black">{t?.dashboard?.recentOrders || 'Recent Orders'}</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-[#8B6914] hover:text-black transition-colors">
            {t?.common?.all || 'View All Orders'}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell">Date</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell">Total</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/orders/${order._id}`}>
                  <td className="px-6 py-4 text-sm font-bold text-brand">#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{order.shippingAddress?.fullName || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700 hidden sm:table-cell">{formatPrice(order.totalAmount || order.total || 0)}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      order.status === 'pending_payment' ? 'bg-red-600 text-white' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status === 'pending_payment' ? '● Pending Payment' : order.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">No recent orders</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


