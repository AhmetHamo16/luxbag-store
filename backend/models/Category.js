const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true },
    tr: { type: String, required: true },
    en: { type: String, required: true }
  },
  slug: { type: String, required: true, unique: true },
  image: { type: String },
  icon: { type: String },
  orderIndex: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, orderIndex: 1 });

module.exports = mongoose.model('Category', categorySchema);
