import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard';
import Loader from '../../components/shared/Loader';
import { productService } from '../../services/productService';
import useTranslation from '../../hooks/useTranslation';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation('home');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Using getProducts with limit=6 to represent featured/new arrivals
        const data = await productService.getProducts({ limit: 6 });
        setFeaturedProducts(data.data || []);
      } catch (error) {
        console.error("Error fetching home products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1920&auto=format&fit=crop" 
          alt="Luxury Bag Display" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
          <span className="text-gold tracking-[0.2em] text-sm uppercase mb-4 block">{t.heroTitle}</span>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-8 max-w-4xl mx-auto leading-tight">
            {t.heroSubtitle}
          </h1>
          <Link 
            to="/shop" 
            className="bg-gold text-white px-10 py-4 uppercase tracking-widest text-sm font-medium hover:bg-white hover:text-black transition-all duration-500 ease-out inline-block"
          >
            {t.shopNow}
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif text-black mb-4">{t.featured}</h2>
          <div className="w-24 h-0.5 bg-gold mx-auto"></div>
        </div>
        
        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.length > 0 ? featuredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            )) : (
              <p className="col-span-full text-center text-gray-500">No products available at the moment.</p>
            )}
          </div>
        )}
        
        <div className="text-center mt-16">
          <Link to="/shop" className="inline-block border-b-2 border-black pb-1 text-sm font-medium tracking-widest uppercase hover:text-gold hover:border-gold transition-colors duration-300">
            View All Products
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-16 h-16 mx-auto bg-white flex items-center justify-center rounded-full mb-6">
                <span className="text-2xl text-gold">★</span>
              </div>
              <h3 className="text-lg font-serif mb-3">Premium Quality</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Crafted with the finest materials and meticulous attention to detail.</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto bg-white flex items-center justify-center rounded-full mb-6">
                <span className="text-2xl text-gold">✈</span>
              </div>
              <h3 className="text-lg font-serif mb-3">Free Worldwide Shipping</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Enjoy complimentary express delivery on all orders over $500.</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto bg-white flex items-center justify-center rounded-full mb-6">
                <span className="text-2xl text-gold">↺</span>
              </div>
              <h3 className="text-lg font-serif mb-3">30-Day Returns</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Not completely satisfied? Return it within 30 days for a full refund.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
