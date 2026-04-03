import React, { useState, useEffect } from 'react';
import { userService } from '../../../services/userService';
import api from '../../../services/api';
import Loader from '../../../components/shared/Loader';
import useTranslation from '../../../hooks/useTranslation';
import useLangStore from '../../../store/useLangStore';
import toast from 'react-hot-toast';

const uiMap = {
  en: {
    confirmDeactivate: 'Are you sure you want to deactivate this user?',
    confirmActivate: 'Are you sure you want to activate this user?',
    confirmRole: 'Change user role to',
    confirmDelete: 'Are you absolutely sure you want to permanently delete this user?',
    statusFailed: 'Failed to update user status',
    roleFailed: 'Failed to update user role',
    deleteFailed: 'Failed to delete user',
    updateFailed: 'Failed to update user details',
    ordersFailed: 'Failed to fetch user orders',
    allRoles: 'All Roles',
    noPhone: 'No phone',
    customer: 'Customer',
    block: 'Block',
    unblock: 'Unblock',
    noUsers: 'No users found.',
    phone: 'Phone',
    orderHistory: 'Order History',
    orderId: 'Order ID',
    date: 'Date',
    noUserOrders: "This user hasn't placed any orders yet."
  },
  ar: {
    confirmDeactivate: 'هل تريدين تعطيل هذا المستخدم؟',
    confirmActivate: 'هل تريدين تفعيل هذا المستخدم؟',
    confirmRole: 'تغيير دور المستخدم إلى',
    confirmDelete: 'هل أنت متأكدة من حذف هذا المستخدم نهائيًا؟',
    statusFailed: 'تعذر تحديث حالة المستخدم',
    roleFailed: 'تعذر تحديث دور المستخدم',
    deleteFailed: 'تعذر حذف المستخدم',
    updateFailed: 'تعذر تحديث بيانات المستخدم',
    ordersFailed: 'تعذر جلب طلبات المستخدم',
    allRoles: 'كل الأدوار',
    noPhone: 'لا يوجد هاتف',
    customer: 'عميل',
    block: 'حظر',
    unblock: 'إلغاء الحظر',
    noUsers: 'لا يوجد مستخدمون.',
    phone: 'الهاتف',
    orderHistory: 'سجل الطلبات',
    orderId: 'رقم الطلب',
    date: 'التاريخ',
    noUserOrders: 'هذا المستخدم لم ينشئ أي طلبات بعد.'
  },
  tr: {
    confirmDeactivate: 'Bu kullaniciyi devre disi birakmak istiyor musunuz?',
    confirmActivate: 'Bu kullaniciyi etkinlestirmek istiyor musunuz?',
    confirmRole: 'Kullanici rolunu sunu olarak degistir',
    confirmDelete: 'Bu kullaniciyi kalici olarak silmek istediginizden emin misiniz?',
    statusFailed: 'Kullanici durumu guncellenemedi',
    roleFailed: 'Kullanici rolu guncellenemedi',
    deleteFailed: 'Kullanici silinemedi',
    updateFailed: 'Kullanici bilgileri guncellenemedi',
    ordersFailed: 'Kullanici siparisleri getirilemedi',
    allRoles: 'Tum Roller',
    noPhone: 'Telefon yok',
    customer: 'Musteri',
    block: 'Engelle',
    unblock: 'Engeli Kaldir',
    noUsers: 'Kullanici bulunamadi.',
    phone: 'Telefon',
    orderHistory: 'Siparis Gecmisi',
    orderId: 'Siparis No',
    date: 'Tarih',
    noUserOrders: 'Bu kullanici henuz siparis vermedi.'
  }
};

const UserList = () => {
  const { t } = useTranslation('admin');
  const { language } = useLangStore();
  const ui = uiMap[language] || uiMap.en;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', phone: '' });

  // Orders Modal State
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers();
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    if (window.confirm(currentStatus ? ui.confirmDeactivate : ui.confirmActivate)) {
      try {
        await userService.updateUserStatus(id, !currentStatus);
        fetchUsers();
      } catch (err) {
        console.error(err);
        toast.error(ui.statusFailed);
      }
    }
  };

  const handleRoleChange = async (id, role) => {
    if (window.confirm(`${ui.confirmRole} ${role}?`)) {
      try {
        await userService.updateUserRole(id, role);
        fetchUsers();
      } catch (err) {
        console.error(err);
        toast.error(ui.roleFailed);
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm(ui.confirmDelete)) {
      try {
        await userService.deleteUser(id);
        fetchUsers();
      } catch (err) {
        console.error(err);
        toast.error(ui.deleteFailed);
      }
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({ name: user.name, email: user.email, phone: user.phone || '' });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUser(editingUser._id, editFormData);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(ui.updateFailed);
    }
  };

  const openOrdersModal = async (user) => {
    setSelectedUserName(user.name);
    setIsOrdersModalOpen(true);
    setOrdersLoading(true);
    try {
      // Typically you'd have a specific endpoint like /api/users/:id/orders
      // Since we don't, we can fetch all admin orders and filter locally for this phase, or better yet, assume the backend has it.
      // Wait, we DO have getOrders in orderController which gets ALL orders for Admins. Let's use that and filter.
      // (In a real massive prod app, we'd add a dedicated route. For now, filter).
      const res = await api.get('/orders'); 
      const filtered = res.data.filter(ord => ord.user?._id === user._id || ord.user === user._id);
      setUserOrders(filtered);
    } catch (err) {
      console.error(err);
      toast.error(ui.ordersFailed);
    } finally {
      setOrdersLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === 'all' || user.role === roleFilter)
  );

  return (
    <div>
      <h1 className="text-2xl font-serif text-black mb-8">{t?.users?.title || 'User Management'}</h1>

      <div className="bg-white shadow-sm border border-gray-100 rounded overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input 
              type="text" 
              placeholder={t?.common?.search || "Search..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-96 border border-gray-300 p-2 text-sm focus:outline-none focus:border-black transition-colors"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-52 border border-gray-300 p-2 text-sm focus:outline-none focus:border-black transition-colors bg-white"
            >
              <option value="all">{ui.allRoles}</option>
              <option value="admin">Admin</option>
              <option value="cashier">Cashier</option>
              <option value="user">{ui.customer}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <Loader />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1a2e] text-white text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium rounded-tl-sm">{t?.users?.name || 'Name'} / Phone</th>
                  <th className="px-6 py-4 font-medium">{t?.users?.email || 'Email'}</th>
                  <th className="px-6 py-4 font-medium">{t?.users?.role || 'Role'} / {t?.common?.status || 'Status'}</th>
                  <th className="px-6 py-4 font-medium">{t?.users?.joinDate || 'Join Date'}</th>
                  <th className="px-6 py-4 font-medium text-right rounded-tr-sm">{t?.common?.actions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr key={user._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-black">{user.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{user.phone || ui.noPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm flex flex-col items-start gap-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'cashier' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                      {user.isActive ? (
                        <span className="text-[10px] text-green-600 font-bold uppercase">{t?.common?.active || 'Active'}</span>
                      ) : (
                        <span className="text-[10px] text-red-600 font-bold uppercase">{t?.common?.blocked || 'Blocked'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex flex-col justify-end gap-2 items-end">
                        <div className="flex gap-2">
                          <button onClick={() => openOrdersModal(user)} className="bg-green-600 text-white px-3 py-1.5 rounded-sm hover:bg-green-700 text-[10px] font-bold uppercase tracking-wide shadow-sm transition-colors border-none align-middle">{t?.users?.orders || 'Orders'}</button>
                          <button onClick={() => openEditModal(user)} className="inline-block bg-blue-600 text-white px-3 py-1.5 rounded-sm hover:bg-blue-700 text-[10px] font-bold uppercase tracking-wide shadow-sm transition-colors border-none align-middle">{t?.common?.edit || 'Edit'}</button>
                        </div>
                        
                        <div className="flex gap-2 w-full justify-end mt-1">
                          <button 
                            onClick={() => handleToggleActive(user._id, user.isActive)}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-sm text-white uppercase tracking-wide transition-colors ${user.isActive ? 'bg-gray-600 hover:bg-gray-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                            disabled={user.role === 'admin'}
                          >
                            {user.isActive ? ui.block : ui.unblock}
                          </button>
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="text-[10px] font-bold px-3 py-1.5 rounded-sm border border-purple-200 bg-purple-50 text-purple-800 uppercase tracking-wide transition-colors"
                          >
                            <option value="user">{ui.customer}</option>
                            <option value="cashier">Cashier</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button onClick={() => handleDeleteUser(user._id)} className="bg-red-600 text-white px-3 py-1.5 rounded-sm hover:bg-red-700 text-[10px] font-bold uppercase tracking-wide shadow-sm transition-colors border-none align-middle" disabled={user.role === 'admin'}>{t?.common?.delete || 'Delete'}</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">{ui.noUsers}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded w-full max-w-md p-6">
            <h2 className="text-xl font-serif mb-4">{t?.users?.editUser || 'Edit User'}</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t?.users?.name || 'Name'}</label>
                <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full border p-2 focus:border-black outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t?.users?.email || 'Email'}</label>
                <input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="w-full border p-2 focus:border-black outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{ui.phone}</label>
                <input type="text" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full border p-2 focus:border-black outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border text-sm">{t?.common?.cancel || 'Cancel'}</button>
                <button type="submit" className="px-4 py-2 bg-black text-white text-sm">{t?.common?.save || 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Orders Modal */}
      {isOrdersModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded w-full max-w-2xl p-6 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h2 className="text-lg font-serif">{ui.orderHistory}: {selectedUserName}</h2>
              <button onClick={() => setIsOrdersModalOpen(false)} className="text-gray-500 hover:text-black font-bold text-xl">&times;</button>
            </div>
            
            <div className="overflow-y-auto flex-1">
              {ordersLoading ? <Loader /> : (
                userOrders.length > 0 ? (
                  <div className="space-y-3">
                    {userOrders.map(order => (
                      <div key={order._id} className="border p-3 rounded text-sm">
                        <div className="flex justify-between font-medium mb-2 border-b pb-1">
                          <span>{ui.orderId}: {order._id}</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 text-xs">
                          <span>{ui.date}: {new Date(order.createdAt).toLocaleDateString()}</span>
                          <span className="uppercase font-bold text-black">{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4 text-sm">{ui.noUserOrders}</p>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
