import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Loader from '../../components/shared/Loader';
import { productService } from '../../services/productService';
import useCartStore from '../../store/cartStore';
import useLangStore from '../../store/useLangStore';
import { translations } from '../../i18n/translations';

const ProductDetail = () => {
  const { id } = useParams(); // URL param acts as slug/id
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(state => state.addItem);
  const { language } = useLangStore();
  const t = translations[language].product;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductBySlug(id);
        const prodData = data.data;
        setProduct(prodData);
        if (prodData.images && prodData.images.length > 0) {
          setMainImage(prodData.images[0]);
        }
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const increment = () => {
    if (product && quantity < product.stock) setQuantity(prev => prev + 1);
  };
  
  const decrement = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  if (loading) return <Loader />;
  if (!product) return <div className="text-center py-20 text-xl font-serif">Product Not Found</div>;

  // Extract multilingual fields
  const name = product.name?.[language] || product.name?.en || 'Unknown';
  const description = product.description?.[language] || product.description?.en || '';
  const categoryName = product.category?.name?.[language] || product.category?.name?.en || 'Category';

  const handleAddToCart = (e) => {
    addItem(product, quantity);
    const btn = e.target;
    const oldText = btn.innerText;
    btn.innerText = 'ADDED TO CART!';
    setTimeout(() => { btn.innerText = oldText; }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Breadcrumb */}
      <nav className="text-sm mb-8 text-gray-500">
        <Link to="/" className="hover:text-black transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-black">{categoryName}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
        
        {/* Image Gallery */}
        <div className="w-full md:w-1/2 flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-4 overflow-x-auto md:w-24 shrink-0">
            {product.images?.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setMainImage(img)}
                className={`border-2 ${mainImage === img ? 'border-gold' : 'border-transparent'} overflow-hidden transition-all`}
              >
                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-24 object-cover object-center" />
              </button>
            ))}
          </div>
          <div className="flex-1 bg-gray-100 aspect-4/5 relative overflow-hidden">
            <img src={mainImage} className="absolute inset-0 w-full h-full object-cover object-center" alt={name} />
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <h1 className="text-4xl font-serif mb-4 text-black">{name}</h1>
          <div className="text-2xl font-medium text-black mb-6">${product.price}</div>
          
          <p className="text-gray-600 leading-relaxed mb-8 text-sm whitespace-pre-line">
            {description}
          </p>

          {/* Stock Display */}
          <div className="mb-6">
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10 border-t border-b border-gray-200 py-8">
            {/* Quantity Selector */}
            <div className="flex items-center border border-gray-300 w-fit">
              <button onClick={decrement} className="px-4 py-3 hover:bg-gray-100 transition-colors">-</button>
              <span className="px-4 py-3 min-w-12 text-center font-medium">{quantity}</span>
              <button onClick={increment} className="px-4 py-3 hover:bg-gray-100 transition-colors">+</button>
            </div>
            
            {/* Add to Cart - Wire this later */}
            <button onClick={handleAddToCart} className="flex-1 bg-black text-white px-8 py-3 font-medium tracking-wide hover:bg-gold transition-colors duration-300">
              {product.stock > 0 ? t.addToCart : t.outOfStock}
            </button>
          </div>
          
          <div className="space-y-4 text-sm">
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium mb-2 uppercase tracking-wide">{t.features}</h4>
              <p className="text-gray-500">100% Genuine Materials. Wipe clean with a soft, dry cloth.</p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium mb-2 uppercase tracking-wide">Delivery & Returns</h4>
              <p className="text-gray-500">Free standard shipping on all orders. Returns accepted within 30 days.</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ProductDetail;
