import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../../services/productService';
import Loader from '../../../components/shared/Loader';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    nameEn: '', nameAr: '', nameTr: '',
    descEn: '', descAr: '', descTr: '',
    price: '', salePrice: '',
    category: '', 
    brand: '',
    stock: '', sku: '',
    isActive: true, isFeatured: false
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchProd = async () => {
      try {
        setFetching(true);
        // We're querying the same endpoint which usually takes a slug or ID depends on backend impl.
        const res = await productService.getProductBySlug(id); // Usually gets by ID as well inside product controller
        const data = res.data;
        
        setFormData({
          nameEn: data.name?.en || '',
          nameAr: data.name?.ar || '',
          nameTr: data.name?.tr || '',
          descEn: data.description?.en || '',
          descAr: data.description?.ar || '',
          descTr: data.description?.tr || '',
          price: data.price || '',
          salePrice: data.salePrice || '',
          category: data.category?._id || data.category || '',
          brand: data.brand || '',
          stock: data.stock || '',
          sku: data.sku || '',
          isActive: data.isActive ?? true,
          isFeatured: data.isFeatured ?? false
        });
      } catch (err) {
        console.error(err);
        alert('Failed fetching product');
      } finally {
        setFetching(false);
      }
    };
    fetchProd();
  }, [id]);

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
      data.append('name[en]', formData.nameEn);
      data.append('name[ar]', formData.nameAr || formData.nameEn);
      data.append('name[tr]', formData.nameTr || formData.nameEn);
      data.append('description[en]', formData.descEn);
      data.append('description[ar]', formData.descAr || formData.descEn);
      data.append('description[tr]', formData.descTr || formData.descEn);
      data.append('price', formData.price);
      if (formData.salePrice) data.append('salePrice', formData.salePrice);
      data.append('brand', formData.brand);
      data.append('stock', formData.stock);
      data.append('sku', formData.sku);
      if (formData.category) data.append('category', formData.category);
      data.append('isActive', formData.isActive);
      data.append('isFeatured', formData.isFeatured);
      
      for(let i = 0; i < images.length; i++) {
        data.append('images', images[i]);
      }
      
      await productService.updateProduct(id, data);
      navigate('/admin/products');
    } catch (error) {
      console.error("Failed to edit product", error);
      alert(error.response?.data?.message || 'Failed to edit product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/admin/products" className="hover:text-black transition-colors">Products</Link>
        <span>/</span>
        <span className="text-black font-medium">Edit Product</span>
      </div>

      <h1 className="text-2xl font-serif text-black mb-8">Edit Product {id}</h1>

      <form className="space-y-8" onSubmit={handleSubmit}>
        
        {/* Basic Information Block - Same as AddProduct */}
        <div className="bg-white p-6 md:p-8 rounded shadow-sm border border-gray-100">
          <h2 className="text-lg font-medium text-black mb-6 border-b border-gray-100 pb-2">Basic Information</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name (English)</label>
                <input required type="text" name="nameEn" value={formData.nameEn} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name (Arabic)</label>
                <input type="text" name="nameAr" value={formData.nameAr} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black text-right" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name (Turkish)</label>
                <input type="text" name="nameTr" value={formData.nameTr} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (English)</label>
              <textarea required rows="4" name="descEn" value={formData.descEn} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Regular Price ($)</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price ($)</label>
                  <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
               </div>
            </div>
          </div>
        </div>

        {/* Organization Block */}
        <div className="bg-white p-6 md:p-8 rounded shadow-sm border border-gray-100">
          <h2 className="text-lg font-medium text-black mb-6 border-b border-gray-100 pb-2">Organization & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category ID</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 text-black border-gray-300 focus:ring-black rounded shadow-sm" />
              <span className="text-sm font-medium text-gray-700">Product is Active (Visible on Store)</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 text-black border-gray-300 focus:ring-black rounded shadow-sm" />
              <span className="text-sm font-medium text-gray-700">Feature this product on Homepage</span>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded shadow-sm border border-gray-100">
          <h2 className="text-lg font-medium text-black mb-6 border-b border-gray-100 pb-2">Media Upload</h2>
          <input type="file" multiple onChange={handleFileChange} accept="image/*" className="w-full border border-dashed border-gray-300 p-6 text-center cursor-pointer mb-2" />
          <p className="text-xs text-gray-500">New images will overwrite or append (depending on backend). Leave empty to keep existing.</p>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Link to="/admin/products" className="px-6 py-3 border border-gray-300 text-sm font-medium text-black hover:bg-white transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-black text-white text-sm font-medium hover:bg-gold transition-colors shadow-sm disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Product'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditProduct;
