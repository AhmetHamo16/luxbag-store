const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    color: { type: String }
  }],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  payment: {
    method: { type: String, enum: ['stripe', 'cod'], required: true },
    stripePaymentId: { type: String },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' }
  },
  coupon: {
    code: { type: String },
    discount: { type: Number, default: 0 }
  },
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, required: true, default: 0 },
  discountAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  trackingNumber: { type: String },
  estimatedDelivery: { type: Date },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
