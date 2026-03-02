import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import Loader from '../../components/shared/Loader';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ street: '', city: '', postalCode: '', country: '' });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await userService.getProfile();
      setAddresses(res.data?.addresses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const newAddresses = [...addresses, formData];
      await userService.manageAddresses(newAddresses);
      setFormData({ street: '', city: '', postalCode: '', country: '' });
      fetchAddresses();
    } catch (err) {
      console.error(err);
      alert('Failed to add address');
    }
  };

  const handleDeleteAddress = async (index) => {
    if (window.confirm('Delete this address?')) {
      try {
        const newAddresses = [...addresses];
        newAddresses.splice(index, 1);
        await userService.manageAddresses(newAddresses);
        fetchAddresses();
      } catch (err) {
        console.error(err);
        alert('Failed to delete address');
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-serif mb-6 border-b border-gray-200 pb-4">My Addresses</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Address List */}
        <div>
          <h3 className="text-lg font-medium mb-4">Saved Addresses</h3>
          {loading ? (
            <Loader />
          ) : addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((addr, idx) => (
                <div key={idx} className="bg-white p-4 shadow-sm border border-gray-100 rounded flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{addr.street}</p>
                    <p className="text-sm text-gray-500">{addr.city}, {addr.postalCode}</p>
                    <p className="text-sm text-gray-500">{addr.country}</p>
                  </div>
                  <button onClick={() => handleDeleteAddress(idx)} className="text-red-500 text-sm font-medium hover:text-red-700">Delete</button>
                </div>
              ))}
            </div>
          ) : (
             <div className="bg-white p-6 border border-gray-100 text-center text-gray-500 text-sm">
               No addresses saved yet.
             </div>
          )}
        </div>

        {/* Add Address Form */}
        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded">
          <h3 className="text-lg font-medium mb-4">Add New Address</h3>
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Street Address</label>
              <input required value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input required value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input required value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
            </div>
            <button type="submit" className="w-full bg-black text-white py-2 font-medium text-sm hover:bg-gold transition-colors">
              Save Address
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Addresses;
