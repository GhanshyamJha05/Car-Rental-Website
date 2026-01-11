const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
    index: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date'],
    index: true,
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date'],
    validate: {
      validator: function (value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date',
    },
  },
  days: {
    type: Number,
    required: true,
    min: 1,
  },
  pricePerDay: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  platformCommission: {
    type: Number,
    required: true,
  },
  vendorEarnings: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
    index: true,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
  },
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: [Number],
    address: String,
  },
  notes: {
    type: String,
    maxlength: 1000,
  },
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound indexes
bookingSchema.index({ car: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ vendor: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

// Check for date conflicts (virtual, implemented in service)
bookingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);

