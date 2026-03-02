import React from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useLangStore from '../../store/useLangStore';

const ProductCard = ({ product }) => {
  const addItem = useCartStore(state => state.addItem);
  const { language } = useLangStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product, 1);
    // Simple toast alternative
    const btn = e.target;
    const oldText = btn.innerText;
    btn.innerText = 'ADDED!';
    setTimeout(() => { btn.innerText = oldText; }, 1500);
  };

  const name = product.name?.[language] || product.name?.en || 'Unknown';
  const image = product.images?.[0] || product.image || 'https://via.placeholder.com/400';

  return (
    <div className="group relative">
      {/* Image Container */}
      <div className="relative w-full aspect-4/5 bg-gray-100 overflow-hidden mb-4">
        {product.isSale && (
          <span className="absolute top-4 left-4 bg-gold text-white text-xs font-bold px-3 py-1 z-10">
            SALE
          </span>
        )}
        <Link to={`/product/${product._id || product.id}`} className="block w-full h-full">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        
        {/* Hover Actions */}
        <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-in-out bg-linear-to-t from-black/50 to-transparent">
          <button onClick={handleAddToCart} className="w-full bg-white text-black hover:bg-gold hover:text-white transition-colors duration-300 py-3 font-medium text-sm tracking-wide">
            ADD TO CART
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="text-center">
        <Link to={`/product/${product._id || product.id}`}>
          <h3 className="text-sm font-medium text-black hover:text-gold transition-colors duration-300 truncate">
            {name}
          </h3>
        </Link>
        <div className="mt-2 flex justify-center items-center space-x-2">
          {product.isSale ? (
            <>
              <span className="text-gray-400 line-through text-sm">${product.oldPrice}</span>
              <span className="text-gold font-medium">${product.price}</span>
            </>
          ) : (
            <span className="text-black font-medium">${product.price}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
