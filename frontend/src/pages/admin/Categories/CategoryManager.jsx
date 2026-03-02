import React, { useState, useEffect } from 'react';
import { categoryService } from '../../../services/categoryService';
import Loader from '../../../components/shared/Loader';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ nameEn: '', nameAr: '', nameTr: '', descriptionEn: '' });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name[en]', formData.nameEn);
      data.append('name[ar]', formData.nameAr);
      data.append('name[tr]', formData.nameTr);
      data.append('description[en]', formData.descriptionEn);
      data.append('description[ar]', formData.descriptionEn);
      data.append('description[tr]', formData.descriptionEn);
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingId) {
        await categoryService.updateCategory(editingId, data);
        alert('Category updated successfully');
      } else {
        await categoryService.createCategory(data);
        alert('Category added successfully');
      }
      
      setFormData({ nameEn: '', nameAr: '', nameTr: '', descriptionEn: '' });
      setImageFile(null);
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Failed to save category');
    }
  };

  const handleEditClick = (cat) => {
    setEditingId(cat._id);
    setFormData({
      nameEn: cat.name?.en || '',
      nameAr: cat.name?.ar || '',
      nameTr: cat.name?.tr || '',
      descriptionEn: cat.description?.en || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        console.error(err);
        alert('Failed to delete category');
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-serif text-black mb-8">Category Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 shadow-sm border border-gray-100 rounded">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
              {editingId && (
                <button 
                  onClick={() => { setEditingId(null); setFormData({ nameEn: '', nameAr: '', nameTr: '', descriptionEn: '' }); }}
                  className="text-xs text-gray-500 hover:text-black"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name (EN)</label>
                <input required value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name (AR)</label>
                <input required value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm text-right" dir="rtl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name (TR)</label>
                <input required value={formData.nameTr} onChange={e => setFormData({...formData, nameTr: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={formData.descriptionEn} onChange={e => setFormData({...formData, descriptionEn: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" rows="3"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category Image</label>
                <input type="file" onChange={e => setImageFile(e.target.files[0])} accept="image/*" className="w-full border p-2 text-sm focus:outline-none focus:border-black" />
                {editingId && <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing image</p>}
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 font-medium text-sm hover:bg-gold transition-colors">
                {editingId ? 'Save Changes' : 'Add Category'}
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
                    <th className="px-6 py-4 font-medium">Name (EN)</th>
                    <th className="px-6 py-4 font-medium">Name (AR)</th>
                    <th className="px-6 py-4 font-medium">Name (TR)</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-white transition-colors">
                      <td className="px-6 py-4 text-sm text-black">{cat.name?.en}</td>
                      <td className="px-6 py-4 text-sm text-black" dir="rtl">{cat.name?.ar}</td>
                      <td className="px-6 py-4 text-sm text-black">{cat.name?.tr}</td>
                      <td className="px-6 py-4 text-sm text-right space-x-3">
                        <button onClick={() => handleEditClick(cat)} className="text-indigo-600 hover:text-indigo-800 font-medium">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(cat._id)} className="text-red-600 hover:text-red-800 font-medium">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-6 text-gray-500">No categories found.</td></tr>
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

export default CategoryManager;
