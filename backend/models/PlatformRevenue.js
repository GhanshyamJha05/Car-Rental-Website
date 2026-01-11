const mongoose = require('mongoose');

const platformRevenueSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for analytics queries
platformRevenueSchema.index({ year: 1, month: 1 });
platformRevenueSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PlatformRevenue', platformRevenueSchema);

