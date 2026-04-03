const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    unique: true
  },
  visits: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
