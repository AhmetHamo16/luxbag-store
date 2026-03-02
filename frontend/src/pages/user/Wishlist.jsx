import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import Loader from '../../components/shared/Loader';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await userService.getProfile();
      setWishlist(res.data?.wishlist || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await userService.toggleWishlist(productId);
      fetchWishlist();
    } catch (err) {
      console.error(err);
      alert('Failed to remove item');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-serif mb-6 border-b border-gray-200 pb-4">My Wishlist</h2>
      
      {loading ? (
        <Loader />
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(product => (
            <div key={product._id} className="group relative">
              <div className="w-full h-80 bg-gray-200 overflow-hidden relative">
                <img src={product.images && product.images[0]} alt={product.name?.en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <button 
                  onClick={() => handleRemove(product._id)}
                  className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <Link to={`/product/${product.slug}`}>{product.name?.en || product.name}</Link>
                  </h3>
                </div>
                <p className="text-sm font-medium text-gray-900">${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 border border-gray-100 text-center">
          <p className="text-gray-500 text-sm mb-4">Your wishlist is empty.</p>
          <Link to="/shop" className="text-sm font-medium text-black underline hover:text-gold transition-colors">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
