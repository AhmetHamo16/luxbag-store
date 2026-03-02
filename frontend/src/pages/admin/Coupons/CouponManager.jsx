import React, { useState, useEffect } from 'react';
import { couponService } from '../../../services/couponService';
import Loader from '../../../components/shared/Loader';

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ code: '', discount: '', expiryDate: '', maxUses: '' });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponService.getCoupons();
      setCoupons(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await couponService.createCoupon({
        code: formData.code.toUpperCase(),
        discount: Number(formData.discount),
        expiryDate: formData.expiryDate,
        maxUses: Number(formData.maxUses) || 100
      });
      setFormData({ code: '', discount: '', expiryDate: '', maxUses: '' });
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert('Failed to add coupon');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponService.deleteCoupon(id);
        fetchCoupons();
      } catch (err) {
        console.error(err);
        alert('Failed to delete coupon');
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-serif text-black mb-8">Coupon Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 shadow-sm border border-gray-100 rounded">
            <h2 className="text-lg font-medium mb-4">Add New Coupon</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm uppercase" placeholder="e.g. SUMMER10" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount %</label>
                <input required type="number" min="1" max="100" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input required type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Uses</label>
                <input required type="number" min="1" value={formData.maxUses} onChange={e => setFormData({...formData, maxUses: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 font-medium text-sm hover:bg-gold transition-colors">
                Add Coupon
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
                  <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4 font-medium">Code</th>
                    <th className="px-6 py-4 font-medium">Discount</th>
                    <th className="px-6 py-4 font-medium">Expiry</th>
                    <th className="px-6 py-4 font-medium">Uses</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-white transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-black">{coupon.code}</td>
                      <td className="px-6 py-4 text-sm text-black">{coupon.discount}%</td>
                      <td className="px-6 py-4 text-sm text-black">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-black">{coupon.uses} / {coupon.maxUses}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <button onClick={() => handleDelete(coupon._id)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr><td colSpan="5" className="text-center py-6 text-gray-500">No coupons found.</td></tr>
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
