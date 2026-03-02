import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/product/ProductCard';
import Loader from '../../components/shared/Loader';
import { productService } from '../../services/productService';
import useTranslation from '../../hooks/useTranslation';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [sortOption, setSortOption] = useState('-createdAt');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterTrigger, setFilterTrigger] = useState(0);
  
  const { t, language } = useTranslation('shop');
  
  // Real categories could be fetched, but for now we define a few basic ones plus empty string for All
  const categories = [
    { name: t.allCategories || 'All', value: '' },
    { name: 'Tote', value: 'Tote' },
    { name: 'Clutch', value: 'Clutch' },
    { name: 'Crossbody', value: 'Crossbody' },
    { name: 'Satchel', value: 'Satchel' },
    { name: 'Handbag', value: 'Handbag' }
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts({});
      let fetched = data.data || [];
      
      // Frontend Filtering due to simple backend
      if (activeCategory) {
         fetched = fetched.filter(p => {
             const catName = p.category?.name?.en || p.category?.name || '';
             return catName === activeCategory;
         });
      }
      if (minPrice) fetched = fetched.filter(p => p.price >= Number(minPrice));
      if (maxPrice) fetched = fetched.filter(p => p.price <= Number(maxPrice));

      if (sortOption === 'price-low') fetched.sort((a,b) => a.price - b.price);
      else if (sortOption === 'price-high') fetched.sort((a,b) => b.price - a.price);
      else fetched.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setProducts(fetched);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, sortOption, filterTrigger, language]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif mb-4">{t.title}</h1>
        <p className="text-gray-500 max-w-2xl mx-auto"></p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-1/4">
          <div className="sticky top-28 space-y-10">
            
            {/* Category Filter */}
            <div>
              <h3 className="text-lg font-medium tracking-wide border-b border-gray-200 pb-2 mb-4">Categories</h3>
              <ul className="space-y-3">
                {categories.map(cat => (
                  <li key={cat.value}>
                    <button 
                      onClick={() => setActiveCategory(cat.value)}
                      className={`text-sm ${activeCategory === cat.value ? 'text-gold font-medium' : 'text-gray-500 hover:text-black'} transition-colors`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter Placeholder */}
            <div>
              <h3 className="text-lg font-medium tracking-wide border-b border-gray-200 pb-2 mb-4">{t.priceRange}</h3>
              <div className="flex items-center space-x-4 mb-4">
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder={t.min} className="w-full border border-gray-300 p-2 text-sm focus:border-gold outline-none" />
                <span>-</span>
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder={t.max} className="w-full border border-gray-300 p-2 text-sm focus:border-gold outline-none" />
              </div>
              <button onClick={() => setFilterTrigger(prev => prev + 1)} className="w-full bg-black text-white text-sm py-2 hover:bg-gold transition-colors">{t.apply}</button>
            </div>

          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="w-full lg:w-3/4">
          
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <span className="text-sm text-gray-500">Showing {products.length} products</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-sm border-none bg-transparent focus:ring-0 cursor-pointer font-medium"
              >
                <option value="-createdAt">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.length > 0 ? products.map(product => (
                <ProductCard key={product._id} product={product} />
              )) : (
                <p className="col-span-full py-8 text-center text-gray-500">No products found matching your criteria.</p>
              )}
            </div>
          )}

        </main>

      </div>
    </div>
  );
};

export default Shop;
