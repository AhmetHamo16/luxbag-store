const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  size: { type: String, required: true },
  sku: { type: String, required: true },
  stock: { type: Number, required: true, default: 0, min: 0 },
  image: { type: String }, // optional mapped variant image URL
  salePrice: { type: Number }
});

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  altText: { type: String, default: '' },
  isMain: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 }
});

const productSchema = new mongoose.Schema({
  name: {
    ar: { type: String },
    tr: { type: String },
    en: { type: String, required: true }
  },
  description: {
    ar: { type: String },
    tr: { type: String },
    en: { type: String, required: true }
  },
  bagType: { type: String, default: 'general' },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  costPrice: { type: Number, default: 0, min: 0 },
  
  // Advanced Images
  images: [imageSchema],
  
  // Category Link
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  
  // Attributes & Specs
  availableColors: [{ type: String }],
  availableSizes: [{ type: String }],
  specs: {
    brand: { type: String, default: 'Melora' },
    material: { type: String },
    piecesIncluded: { type: Number, default: 1, min: 1 },
    dimensions: {
      height: { type: Number },
      width: { type: Number },
      depth: { type: Number }
    },
    weight: { type: Number }, // in kg or grams
    barcode: { type: String },
    origin: { type: String },
    strapType: { type: String },
    closureType: { type: String }
  },
  
  // Base Item Identification
  sku: { type: String, required: true, unique: true },
  slug: { type: String, required: true }, 
  stock: { type: Number, default: 0 }, // base stock for non-variant products
  
  // Variants Array
  variants: [variantSchema],
  
  // Advanced Stock Control
  stockControl: {
    totalStock: { type: Number, default: 0, min: 0 },
    lowStockAlert: { type: Boolean, default: false },
    stockHistory: [{
      action: { type: String, enum: ['RESTOCK', 'ADJUST', 'SALE', 'RETURN', 'INIT'] },
      quantity: { type: Number },
      date: { type: Date, default: Date.now },
      note: { type: String }
    }]
  },

  // SEO Subdocument
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    ogImage: { type: String }
  },
  
  // Publishing & Status
  isPublished: { type: Boolean, default: true },
  publishDate: { type: Date, default: Date.now },
  badges: [{ type: String, enum: ['Featured', 'New', 'Sale', 'Best Seller'] }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  
  // Stats
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  tags: [{ type: String }]
}, { timestamps: true });

// Pre-save hook to auto-calculate abstract totalStock if variants are utilized
productSchema.pre('save', function() {
  if (this.variants && this.variants.length > 0) {
    this.stockControl.totalStock = this.variants.reduce((total, v) => total + (v.stock || 0), 0);
  }
});

// Explicit indexing for V2 Enterprise Search speeds
productSchema.index({ slug: 1 });
productSchema.index({ "variants._id": 1 });
productSchema.index({ _id: 1, "variants._id": 1 }); // Compound index for fast subdocument variant lock
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ sku: 1 });
productSchema.index({ 'specs.barcode': 1 });
productSchema.index({ bagType: 1 });

module.exports = mongoose.model('Product', productSchema);
