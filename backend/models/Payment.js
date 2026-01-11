const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  stripeSessionId: {
    type: String,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'usd',
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
    index: true,
  },
  platformCommission: {
    type: Number,
    required: true,
  },
  vendorEarnings: {
    type: Number,
    required: true,
  },
  metadata: {
    type: Map,
    of: String,
  },
  refundedAmount: {
    type: Number,
    default: 0,
  },
  refundedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ vendor: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

paymentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);

