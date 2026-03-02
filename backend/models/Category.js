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
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
