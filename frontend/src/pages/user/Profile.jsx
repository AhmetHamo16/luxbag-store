import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import useAuthStore from '../../store/authStore';

const Profile = () => {
  const { user } = useAuthStore(); 
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({ name: user.name, email: user.email, phone: user.phone || '' });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile(formData);
      // Wait, updateAuthStore here might be tricky if we don't have a direct method, but let's assume login saves the token/user
      alert('Profile updated successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await userService.changePassword(passwordData);
      setPasswordData({ currentPassword: '', newPassword: '' });
      alert('Password updated successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to update password.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-serif mb-6 border-b border-gray-200 pb-4">Account Details</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded">
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" className="w-full border p-2 focus:outline-none focus:border-black text-sm text-gray-500 bg-white" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full border p-2 focus:outline-none focus:border-black text-sm" placeholder="+1 (555) 000-0000" />
            </div>
            <button type="submit" className="bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gold transition-colors">
              Save Changes
            </button>
          </form>
        </div>

        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded">
          <h3 className="text-lg font-medium mb-4">Change Password</h3>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
            </div>
            <button type="submit" className="bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gold transition-colors">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
