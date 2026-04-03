const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  invoiceNumber: { type: String, unique: true, sparse: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    quantity: { type: Number, required: true },
    color: { type: String },
    size: { type: String },
    variant: { type: mongoose.Schema.Types.ObjectId }
  }],
  shippingAddress: {
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  payment: {
    method: { type: String, enum: ['iban', 'cod', 'cash', 'card', 'mixed'], required: true },
    receiptImage: { type: String },
    cashAmount: { type: Number, default: 0, min: 0 },
    cardAmount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['pending_payment', 'pending', 'paid', 'failed', 'refunded'], default: 'pending_payment' }
  },
  coupon: {
    code: { type: String },
    discount: { type: Number, default: 0 }
  },
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, required: true, default: 0 },
  discountAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending_payment', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending_payment' },
  trackingNumber: { type: String },
  estimatedDelivery: { type: Date },
  notes: { type: String },
  salesChannel: { type: String, enum: ['online', 'pos'], default: 'online' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1, createdAt: -1 });
orderSchema.index({ 'coupon.code': 1 });
orderSchema.index({ invoiceNumber: 1 });
orderSchema.index({ salesChannel: 1, createdAt: -1 });
orderSchema.index({ createdBy: 1, createdAt: -1 });

orderSchema.pre('validate', function() {
  if (!this.invoiceNumber) {
    const now = new Date();
    const stamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('');
    const time = [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0')
    ].join('');
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.invoiceNumber = `MLR-${stamp}-${time}-${random}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
