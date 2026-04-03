import React, { useState, useEffect } from 'react';
import { securityService } from '../../../services/securityService';
import useAuthStore from '../../../store/authStore';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../components/shared/Loader';
import useTranslation from '../../../hooks/useTranslation';
import useLangStore from '../../../store/useLangStore';
import toast from 'react-hot-toast';

const uiMap = {
  en: {
    changePassword: 'Change Password', currentPassword: 'Current Password', newPassword: 'New Password', confirmNewPassword: 'Confirm New Password',
    updating: 'Updating...', updatePassword: 'Update Password', sessionControl: 'Session Control', sessionHelp: 'Forcefully invalidate all currently active tokens across all devices. This will log everyone out instantly, including you.',
    logoutAll: 'Logout All Sessions', noMatch: 'New passwords do not match', shortPass: 'Password must be at least 6 characters', passUpdated: 'Password updated successfully', passFailed: 'Failed to update password',
    confirmLogoutAll: 'Are you sure you want to terminate all active sessions globally? You will be logged out immediately.', sessionsTerminated: 'All sessions terminated.', sessionsFailed: 'Failed to terminate sessions',
    timestamp: 'Timestamp', admin: 'Admin', action: 'Action', resource: 'Resource', unknown: 'Unknown', noActivity: 'No activity logged yet.'
  },
  ar: {
    changePassword: 'تغيير كلمة المرور', currentPassword: 'كلمة المرور الحالية', newPassword: 'كلمة المرور الجديدة', confirmNewPassword: 'تأكيد كلمة المرور الجديدة',
    updating: 'جارٍ التحديث...', updatePassword: 'تحديث كلمة المرور', sessionControl: 'التحكم بالجلسات', sessionHelp: 'هذا الإجراء ينهي كل الجلسات النشطة على جميع الأجهزة، وسيتم تسجيل خروجك فورًا.',
    logoutAll: 'تسجيل خروج كل الجلسات', noMatch: 'كلمتا المرور الجديدتان غير متطابقتين', shortPass: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل', passUpdated: 'تم تحديث كلمة المرور بنجاح', passFailed: 'تعذر تحديث كلمة المرور',
    confirmLogoutAll: 'هل تريدين إنهاء كل الجلسات النشطة؟ سيتم تسجيل خروجك فورًا.', sessionsTerminated: 'تم إنهاء كل الجلسات.', sessionsFailed: 'تعذر إنهاء الجلسات',
    timestamp: 'الوقت', admin: 'الأدمن', action: 'الإجراء', resource: 'المورد', unknown: 'غير معروف', noActivity: 'لا يوجد سجل نشاط بعد.'
  },
  tr: {
    changePassword: 'Sifreyi Degistir', currentPassword: 'Mevcut Sifre', newPassword: 'Yeni Sifre', confirmNewPassword: 'Yeni Sifreyi Onayla',
    updating: 'Guncelleniyor...', updatePassword: 'Sifreyi Guncelle', sessionControl: 'Oturum Kontrolu', sessionHelp: 'Tum cihazlardaki aktif oturumlari zorla sonlandirir. Siz dahil herkes cikis yapar.',
    logoutAll: 'Tum Oturumlardan Cikis Yap', noMatch: 'Yeni sifreler eslesmiyor', shortPass: 'Sifre en az 6 karakter olmali', passUpdated: 'Sifre basariyla guncellendi', passFailed: 'Sifre guncellenemedi',
    confirmLogoutAll: 'Tum aktif oturumlari sonlandirmak istediginize emin misiniz? Hemen cikis yapacaksiniz.', sessionsTerminated: 'Tum oturumlar sonlandirildi.', sessionsFailed: 'Oturumlar sonlandirilamadi',
    timestamp: 'Zaman', admin: 'Admin', action: 'Islem', resource: 'Kaynak', unknown: 'Bilinmiyor', noActivity: 'Henuz aktivite kaydi yok.'
  }
};

const AdminSecurity = () => {
  const { t } = useTranslation('admin');
  const { language } = useLangStore();
  const ui = uiMap[language] || uiMap.en;
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passLoading, setPassLoading] = useState(false);
  
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await securityService.getActivityLogs();
      setLogs(res.data || []);
    } catch {
      console.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return toast.error(ui.noMatch);
    }
    if (passData.newPassword.length < 6) {
      return toast.error(ui.shortPass);
    }
    
    setPassLoading(true);
    try {
      await securityService.changePassword({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      toast.success(ui.passUpdated);
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || ui.passFailed);
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (window.confirm(ui.confirmLogoutAll)) {
      try {
        await securityService.logoutAllSessions();
        toast.success(ui.sessionsTerminated);
        await logout();
        navigate('/login');
      } catch {
        toast.error(ui.sessionsFailed);
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif text-black">{t?.security?.title || 'Security & Audit'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Actions */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Change Password Form */}
          <div className="bg-white p-6 shadow-sm border border-gray-100 rounded">
            <h2 className="text-lg font-medium border-b pb-2 mb-4">{ui.changePassword}</h2>
            <form onSubmit={submitPasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{ui.currentPassword}</label>
                <input required type="password" name="currentPassword" value={passData.currentPassword} onChange={handlePasswordChange} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{ui.newPassword}</label>
                <input required type="password" name="newPassword" value={passData.newPassword} onChange={handlePasswordChange} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{ui.confirmNewPassword}</label>
                <input required type="password" name="confirmPassword" value={passData.confirmPassword} onChange={handlePasswordChange} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <button type="submit" disabled={passLoading} className="w-full bg-black text-white px-4 py-2 font-medium text-sm rounded hover:bg-gold transition-colors disabled:opacity-50">
                {passLoading ? ui.updating : ui.updatePassword}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 p-6 rounded border border-red-100">
            <h2 className="text-red-800 text-lg font-medium border-b border-red-200 pb-2 mb-4">{ui.sessionControl}</h2>
            <p className="text-xs text-red-700 mb-4">
              {ui.sessionHelp}
            </p>
            <button onClick={handleLogoutAll} className="w-full bg-red-600 text-white px-4 py-2 font-medium text-sm rounded hover:bg-red-700 transition-colors">
              {ui.logoutAll}
            </button>
          </div>
        </div>

        {/* Right Column: Activity Logs */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm border border-gray-100 rounded overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-lg font-medium text-black">{t?.security?.activityLog || 'Admin Activity Log (Last 20)'}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4 font-medium">{ui.timestamp}</th>
                    <th className="px-6 py-4 font-medium">{ui.admin}</th>
                    <th className="px-6 py-4 font-medium">{ui.action}</th>
                    <th className="px-6 py-4 font-medium">{ui.resource}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {logs.length > 0 ? logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-black">
                        {log.admin?.name || ui.unknown}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          log.action === 'DELETE' ? 'bg-red-100 text-red-800' : 
                          log.action === 'POST' ? 'bg-green-100 text-green-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={log.resource}>
                        {log.resource}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-gray-500">{ui.noActivity}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSecurity;
