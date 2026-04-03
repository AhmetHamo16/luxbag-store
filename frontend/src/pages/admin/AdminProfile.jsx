import React, { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { userService } from '../../services/userService';

const AdminProfile = () => {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return setError('New passwords do not match');
    }

    try {
      setLoading(true);
      
      const payload = {
        name: formData.name,
        email: formData.email
      };
      
      if (formData.newPassword) {
         if (!formData.currentPassword) {
            setLoading(false);
            return setError('Current password is required to set a new password');
         }
         await userService.changePassword({
           currentPassword: formData.currentPassword,
           newPassword: formData.newPassword
         });
      }
      
      await userService.updateProfile(payload);
      
      setSuccess('Profile updated successfully!');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="bg-white p-8 rounded border border-gray-100 shadow-sm flex items-center gap-6">
         <div className="w-24 h-24 bg-[#1a1a2e] text-[#8B6914] rounded-full flex items-center justify-center text-4xl font-serif shadow-inner border-4 border-white ring-1 ring-gray-100">
           {user?.name?.charAt(0) || 'A'}
         </div>
         <div>
            <h1 className="text-2xl font-serif text-black">{user?.name}</h1>
            <p className="text-gray-500">{user?.email}</p>
            <div className="mt-2 flex gap-3">
               <span className="px-3 py-1 bg-brand text-white text-xs font-bold uppercase tracking-wider rounded">{user?.role || 'Admin'}</span>
               <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded border border-gray-200">
                 Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'System Default'}
               </span>
            </div>
         </div>
      </div>

      <div className="bg-white p-8 rounded border border-gray-100 shadow-sm">
        <h2 className="text-lg font-serif mb-6 border-b pb-2">Edit Profile</h2>
        
        {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm border border-red-100">{error}</div>}
        {success && <div className="mb-4 bg-green-50 text-green-700 p-3 rounded text-sm border border-green-100">{success}</div>}
        
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black rounded"
              />
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-md font-medium mb-4">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                 <input 
                   type="password" 
                   name="currentPassword"
                   value={formData.currentPassword}
                   onChange={handleChange}
                   className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black rounded"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                 <input 
                   type="password" 
                   name="newPassword"
                   value={formData.newPassword}
                   onChange={handleChange}
                   className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black rounded"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                 <input 
                   type="password" 
                   name="confirmPassword"
                   value={formData.confirmPassword}
                   onChange={handleChange}
                   className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black rounded"
                 />
               </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-black text-white px-8 py-2 font-medium tracking-wide hover:bg-gold transition-colors disabled:opacity-50 shadow-sm rounded-sm"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default AdminProfile;
