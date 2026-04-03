const mongoose = require('mongoose');

const cashierShiftSchema = new mongoose.Schema(
  {
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open'
    },
    openedAt: {
      type: Date,
      default: Date.now
    },
    closedAt: {
      type: Date,
      default: null
    },
    openingFloat: {
      type: Number,
      default: 0
    },
    expectedCash: {
      type: Number,
      default: 0
    },
    expectedCard: {
      type: Number,
      default: 0
    },
    expectedTotal: {
      type: Number,
      default: 0
    },
    actualCash: {
      type: Number,
      default: 0
    },
    actualCard: {
      type: Number,
      default: 0
    },
    actualTotal: {
      type: Number,
      default: 0
    },
    varianceCash: {
      type: Number,
      default: 0
    },
    varianceCard: {
      type: Number,
      default: 0
    },
    varianceTotal: {
      type: Number,
      default: 0
    },
    invoicesCount: {
      type: Number,
      default: 0
    },
    piecesCount: {
      type: Number,
      default: 0
    },
    discountTotal: {
      type: Number,
      default: 0
    },
    estimatedProfit: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

cashierShiftSchema.index(
  { cashier: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'open' } }
);
cashierShiftSchema.index({ openedAt: -1 });
cashierShiftSchema.index({ closedAt: -1 });

module.exports = mongoose.model('CashierShift', cashierShiftSchema);
