import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../../../services/productService';
import { categoryService } from '../../../services/categoryService';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    nameEn: '', nameAr: '', nameTr: '',
    descEn: '', descAr: '', descTr: '',
    price: '', salePrice: '',
    category: '', 
    brand: 'Melora',
    stock: '', sku: '',
    isFeatured: false
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data.data || []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };
  const handleFileChange = (e) => setImages(e.target.files);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      // Multilingual fields
      data.append('name[en]', formData.nameEn);
      data.append('name[ar]', formData.nameAr || formData.nameEn);
      data.append('name[tr]', formData.nameTr || formData.nameEn);
      data.append('description[en]', formData.descEn);
      data.append('description[ar]', formData.descAr || formData.descEn);
      data.append('description[tr]', formData.descTr || formData.descEn);
      
      // Standard fields
      data.append('price', formData.price);
      if (formData.salePrice) data.append('salePrice', formData.salePrice);
      data.append('brand', formData.brand);
      data.append('stock', formData.stock);
      data.append('sku', formData.sku);
      data.append('isFeatured', formData.isFeatured);
      
      // Note: category needs to be a valid MongoDB ObjectID for the Category model.
      if (formData.category) data.append('category', formData.category);
      
      // Append files
      for(let i = 0; i < images.length; i++) {
        data.append('images', images[i]);
      }
      
      await productService.createProduct(data);
      navigate('/admin/products');
    } catch (error) {
      console.error("Failed to add product", error);
      alert(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/admin/products" className="hover:text-black transition-colors">Products</Link>
        <span>/</span>
        <span className="text-black font-medium">Add New Product</span>
      </div>

      <h1 className="text-2xl font-serif text-black mb-8">Add New Product</h1>

      <form className="space-y-8" onSubmit={handleSubmit}>
        
        <div className="bg-white p-6 md:p-8 rounded shadow-sm border border-gray-100">
          <h2 className="text-lg font-medium text-black mb-6 border-b border-gray-100 pb-2">Basic Information</h2>
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name (English)</label>
                <input required type="text" name="nameEn" value={formData.nameEn} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="e.g. Elegance Tote" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name (Arabic)</label>
                <input type="text" name="nameAr" value={formData.nameAr} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black text-right" placeholder="الاسم بالعربية" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name (Turkish)</label>
                <input type="text" name="nameTr" value={formData.nameTr} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="Türkçe isim" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (English)</label>
              <textarea required rows="4" name="descEn" value={formData.descEn} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="Brief description..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Regular Price ($)</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="0.00" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price ($)</label>
                  <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="0.00" />
               </div>
            </div>

          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded shadow-sm border border-gray-100">
          <h2 className="text-lg font-medium text-black mb-6 border-b border-gray-100 pb-2">Organization & Inventory</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select required name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black bg-white">
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name.en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="e.g. Melora" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Initial Stock</label>
              <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="MEL-001" />
            </div>
          </div>

          <div className="mt-6 flex items-center">
            <input type="checkbox" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded" />
            <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
              Feature on Homepage
            </label>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded shadow-sm border border-gray-100">
          <h2 className="text-lg font-medium text-black mb-6 border-b border-gray-100 pb-2">Media Upload</h2>
          <input type="file" multiple onChange={handleFileChange} accept="image/*" className="w-full border border-dashed border-gray-300 p-6 text-center cursor-pointer mb-2" />
          <p className="text-xs text-gray-500">Select up to 5 images (PNG, JPG). Uploading to Cloudinary automatically.</p>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Link to="/admin/products" className="px-6 py-3 border border-gray-300 text-sm font-medium text-black hover:bg-white transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-black text-white text-sm font-medium hover:bg-gold transition-colors shadow-sm disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddProduct;
