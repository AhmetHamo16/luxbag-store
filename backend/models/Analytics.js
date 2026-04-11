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
  },
  uniqueVisitors: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
