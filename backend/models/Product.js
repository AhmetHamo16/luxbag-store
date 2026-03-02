const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true },
    tr: { type: String, required: true },
    en: { type: String, required: true }
  },
  description: {
    ar: { type: String, required: true },
    tr: { type: String, required: true },
    en: { type: String, required: true }
  },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  images: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, default: 'Melora' },
  colors: [{ type: String }],
  material: { type: String },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }],
  weight: { type: Number }, // for shipping
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
