const mongoose = require('mongoose');

const adminActivityLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    default: 'General'
  },
  details: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Optional: cap the collection size or just query the last 20 records
module.exports = mongoose.model('AdminActivityLog', adminActivityLogSchema);
