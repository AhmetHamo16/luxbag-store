const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  storeName: {
    type: String,
    default: 'Melora Luxury',
    required: true
  },
  storeEmail: {
    type: String,
    default: 'support@melora.com',
    required: true
  },
  currency: {
    type: String,
    default: 'TRY',
    enum: ['USD', 'TRY', 'SAR']
  },
  freeShippingThreshold: {
    type: Number,
    default: 2000
  },
  shippingCost: {
    type: Number,
    default: 25
  },
  monthlySalesTarget: {
    type: Number,
    default: 0,
    min: 0
  },
  weeklySalesTarget: {
    type: Number,
    default: 0,
    min: 0
  },
  notificationTone: {
    type: String,
    default: 'custom',
    enum: ['custom', 'message', 'luxury', 'classic', 'soft']
  },
  iban: {
    type: String,
    default: ''
  },
  accountHolder: {
    type: String,
    default: ''},
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  paymentMethods: {
    card: { type: Boolean, default: true },
    cod: { type: Boolean, default: true }
  }
}, { timestamps: true });

settingSchema.index({ updatedAt: -1 });

// Ensure it's treated as a singleton
settingSchema.pre('save', async function () {
  if (this.isNew) {
    const existingCount = await mongoose.models.Setting.countDocuments();
    if (existingCount > 0) {
      throw new Error('Only one Settings document can exist.');
    }
  }
});

module.exports = mongoose.model('Setting', settingSchema);
