import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../../components/shared/Loader';
import { productService } from '../../../services/productService';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts({ limit: 100 });
      setProducts(data.data.products);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        fetchProducts(); // Refresh list
      } catch (error) {
        console.error("Error deleting product", error);
        alert('Failed to delete product');
      }
    }
  };

  const toggleStatus = async (id, field, currentValue) => {
    try {
      await productService.updateProduct(id, { [field]: !currentValue });
      fetchProducts();
    } catch (error) {
      console.error(`Error toggling ${field}`, error);
      alert('Action failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif text-black">Products</h1>
        <Link 
          to="/admin/products/add" 
          className="bg-black text-white px-6 py-2 text-sm font-medium tracking-wide hover:bg-gold transition-colors shadow-sm"
        >
          Add New Product
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded overflow-hidden">
        {/* Toolbar / Search Header */}
        <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full sm:w-64 border border-gray-300 p-2 text-sm focus:outline-none focus:border-black"
          />
          <div className="flex gap-4 w-full sm:w-auto">
             <select className="border border-gray-300 p-2 text-sm focus:outline-none focus:border-black bg-white w-full sm:w-auto">
               <option>All Categories</option>
             </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <Loader />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-medium">Image</th>
                  <th className="px-6 py-4 font-medium">Product Name</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length > 0 ? products.map((product) => {
                  const name = product.name?.en || product.name?.ar || product.name || 'Unknown';
                  const categoryName = product.category?.name?.en || product.category?.name?.ar || product.category?.name || 'Uncategorized';
                  const image = product.images?.[0] || 'https://via.placeholder.com/100';
                  
                  return (
                    <tr key={product._id} className="hover:bg-white transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden border border-gray-100">
                          <img src={image} alt={name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-black">
                        {name}
                        <div className="text-xs text-gray-500 font-normal mt-1">{product._id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{categoryName}</td>
                      <td className="px-6 py-4 text-sm font-medium text-black">${product.price}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-y-1">
                        <div>
                          <button onClick={() => toggleStatus(product._id, 'isActive', product.isActive)} className={`text-xs px-2 py-1 rounded-full ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                        <div>
                           <button onClick={() => toggleStatus(product._id, 'isFeatured', product.isFeatured)} className={`text-xs px-2 py-1 rounded-full ${product.isFeatured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                            {product.isFeatured ? '★ Featured' : 'Not Featured'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-right space-x-3">
                        <Link to={`/admin/products/edit/${product._id}`} className="text-indigo-600 hover:text-indigo-900 font-medium">Edit</Link>
                        <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500">No products found. Add some!</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductList;
