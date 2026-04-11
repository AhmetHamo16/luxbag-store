import React, { useState, useEffect } from 'react';
import { categoryService } from '../../../services/categoryService';
import Loader from '../../../components/shared/Loader';
import useTranslation from '../../../hooks/useTranslation';
import useLangStore from '../../../store/useLangStore';
import toast from 'react-hot-toast';

const uiMap = {
  en: {
    saveOrderFailed: 'Failed to save order', toggleFailed: 'Failed to toggle visibility', updated: 'Category updated successfully', added: 'Category added successfully',
    saveFailed: 'Failed to save category', deleteFailed: 'Failed to delete category', deleteConfirm: 'Are you sure you want to delete this category?',
    noCategories: 'No categories found.', unsavedSorting: 'You have unsaved sorting changes.', saveNewOrder: 'Save New Order'
  },
  ar: {
    saveOrderFailed: 'تعذر حفظ الترتيب', toggleFailed: 'تعذر تحديث الظهور', updated: 'تم تحديث الفئة بنجاح', added: 'تمت إضافة الفئة بنجاح',
    saveFailed: 'تعذر حفظ الفئة', deleteFailed: 'تعذر حذف الفئة', deleteConfirm: 'هل تريدين حذف هذه الفئة؟',
    noCategories: 'لا توجد فئات.', unsavedSorting: 'لديك تغييرات ترتيب غير محفوظة.', saveNewOrder: 'حفظ الترتيب الجديد'
  },
  tr: {
    saveOrderFailed: 'Siralama kaydedilemedi', toggleFailed: 'Gorunurluk guncellenemedi', updated: 'Kategori basariyla guncellendi', added: 'Kategori basariyla eklendi',
    saveFailed: 'Kategori kaydedilemedi', deleteFailed: 'Kategori silinemedi', deleteConfirm: 'Bu kategoriyi silmek istediginize emin misiniz?',
    noCategories: 'Kategori bulunamadi.', unsavedSorting: 'Kaydedilmemis siralama degisiklikleriniz var.', saveNewOrder: 'Yeni Siralamayi Kaydet'
  }
};

const CategoryManager = () => {
  const { t } = useTranslation('admin');
  const { language } = useLangStore();
  const ui = uiMap[language] || uiMap.en;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ nameEn: '', nameAr: '', nameTr: '', descriptionEn: '' });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const getErrorMessage = (err) => {
    const apiMessage = err?.response?.data?.message;
    if (!apiMessage) return ui.saveFailed;
    if (apiMessage.includes('duplicate key') || apiMessage.includes('slug_1')) {
      return language === 'ar'
        ? 'هذه الفئة موجودة بالفعل أو أن اسمها الإنجليزي مكرر.'
        : language === 'tr'
          ? 'Bu kategori zaten var veya Ingilizce adi tekrar ediyor.'
          : 'This category already exists or its English name creates a duplicate slug.';
    }
    return apiMessage;
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories(true);
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

  const moveUp = async (index) => {
    if (index === 0) return;
    const newCats = [...categories];
    const temp = newCats[index - 1];
    newCats[index - 1] = newCats[index];
    newCats[index] = temp;
    
    setCategories(newCats);
    setIsReordering(true);
  };

  const moveDown = async (index) => {
    if (index === categories.length - 1) return;
    const newCats = [...categories];
    const temp = newCats[index + 1];
    newCats[index + 1] = newCats[index];
    newCats[index] = temp;
    
    setCategories(newCats);
    setIsReordering(true);
  };

  const saveReorder = async () => {
    try {
      const orderedIds = categories.map(c => c._id);
      await categoryService.reorderCategories(orderedIds);
      setIsReordering(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(ui.saveOrderFailed);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await categoryService.toggleCategoryStatus(id);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(ui.toggleFailed);
    }
  };

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
        toast.success(ui.updated);
      } else {
        await categoryService.createCategory(data);
        toast.success(ui.added);
      }
      
      setFormData({ nameEn: '', nameAr: '', nameTr: '', descriptionEn: '' });
      setImageFile(null);
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err));
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
    if (window.confirm(ui.deleteConfirm)) {
      try {
        await categoryService.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        console.error(err);
        toast.error(ui.deleteFailed);
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-serif text-black mb-8">{t?.categories?.title || 'Category Management'}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 shadow-sm border border-gray-100 rounded">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">{editingId ? t?.categories?.editCategory || 'Edit Category' : t?.categories?.addCategory || 'Add New Category'}</h2>
              {editingId && (
                <button 
                  onClick={() => { setEditingId(null); setFormData({ nameEn: '', nameAr: '', nameTr: '', descriptionEn: '' }); }}
                  className="text-xs text-gray-500 hover:text-black"
                >
                  {t?.common?.cancel || 'Cancel Edit'}
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t?.categories?.name || 'Name'} (EN)</label>
                <input required value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t?.categories?.name || 'Name'} (AR)</label>
                <input required value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm text-right" dir="rtl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t?.categories?.name || 'Name'} (TR)</label>
                <input required value={formData.nameTr} onChange={e => setFormData({...formData, nameTr: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t?.common?.description || 'Description'}</label>
                <textarea value={formData.descriptionEn} onChange={e => setFormData({...formData, descriptionEn: e.target.value})} className="w-full border p-2 focus:outline-none focus:border-black text-sm" rows="3"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t?.categories?.image || 'Category Image'}</label>
                <input type="file" onChange={e => setImageFile(e.target.files[0])} accept="image/*" className="w-full border p-2 text-sm focus:outline-none focus:border-black" />
                {editingId && <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing image</p>}
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 font-medium text-sm hover:bg-gold transition-colors">
                {editingId ? t?.common?.save || 'Save Changes' : t?.categories?.addCategory || 'Add Category'}
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
                  <tr className="bg-[#1a1a2e] text-white text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium w-24 rounded-tl-sm">Order</th>
                    <th className="px-6 py-4 font-medium">{t?.categories?.name || 'Name'} (EN)</th>
                    <th className="px-6 py-4 font-medium">{t?.categories?.name || 'Name'} (AR)</th>
                    <th className="px-6 py-4 font-medium">{t?.categories?.name || 'Name'} (TR)</th>
                    <th className="px-6 py-4 font-medium text-center">{t?.common?.status || 'Status'}</th>
                    <th className="px-6 py-4 font-medium text-right rounded-tr-sm">{t?.common?.actions || 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map((cat, index) => (
                    <tr key={cat._id} className={`transition-colors flex-col sm:table-row ${cat.isActive ? (index % 2 === 0 ? 'bg-white' : 'bg-gray-50') : 'bg-gray-100 opacity-75'} hover:bg-gray-100`}>
                      <td className="px-6 py-4 text-sm text-black flex flex-col gap-1 items-start w-24">
                        <button onClick={() => moveUp(index)} disabled={index === 0} className={`text-[10px] px-2 py-0.5 border rounded ${index === 0 ? 'text-gray-300 border-gray-100' : 'hover:bg-gray-100'}`}>▲ UP</button>
                        <button onClick={() => moveDown(index)} disabled={index === categories.length - 1} className={`text-[10px] px-2 py-0.5 border rounded ${index === categories.length - 1 ? 'text-gray-300 border-gray-100' : 'hover:bg-gray-100'}`}>▼ DN</button>
                      </td>
                      <td className="px-6 py-4 text-sm text-black font-medium">{cat.name?.en}</td>
                      <td className="px-6 py-4 text-sm text-black" dir="rtl">{cat.name?.ar}</td>
                      <td className="px-6 py-4 text-sm text-black">{cat.name?.tr}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => toggleStatus(cat._id)} className={`text-[10px] font-bold px-2 py-1 rounded ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                          {cat.isActive ? t?.common?.active || 'VISIBLE' : t?.common?.inactive || 'HIDDEN'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-right space-x-2">
                        <button onClick={() => handleEditClick(cat)} className="inline-block bg-blue-600 text-white px-3 py-1.5 rounded-sm hover:bg-blue-700 text-[10px] font-bold uppercase tracking-wide shadow-sm transition-colors border-none align-middle">
                          {t?.common?.edit || 'Edit'}
                        </button>
                        <button onClick={() => handleDelete(cat._id)} className="bg-red-600 text-white px-3 py-1.5 rounded-sm hover:bg-red-700 text-[10px] font-bold uppercase tracking-wide shadow-sm transition-colors border-none align-middle">
                          {t?.common?.delete || 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-6 text-gray-500">{ui.noCategories}</td></tr>
                  )}
                </tbody>
              </table>
            )}
            {isReordering && (
              <div className="p-4 bg-yellow-50 border-t border-yellow-100 flex justify-between items-center">
                <span className="text-sm text-yellow-800 font-medium">{ui.unsavedSorting}</span>
                <button onClick={saveReorder} className="bg-black text-white px-4 py-2 text-sm font-medium rounded hover:bg-gray-800">
                  {ui.saveNewOrder}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CategoryManager;
