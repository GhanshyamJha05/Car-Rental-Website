const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  make: {
    type: String,
    required: [true, 'Please provide car make'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Please provide car model'],
    trim: true,
  },
  year: {
    type: Number,
    required: [true, 'Please provide car year'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
  },
  type: {
    type: String,
    enum: ['sedan', 'suv', 'truck', 'van', 'luxury', 'sports', 'motorcycle', 'convertible'],
    required: true,
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Please provide price per day'],
    min: [0, 'Price must be positive'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere',
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  },
  images: [{
    type: String,
    required: true,
  }],
  description: {
    type: String,
    required: [true, 'Please provide description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  features: [{
    type: String,
  }],
  specifications: {
    seats: {
      type: Number,
      min: 1,
      max: 50,
    },
    mileage: Number,
    fuelType: {
      type: String,
      enum: ['gasoline', 'diesel', 'electric', 'hybrid'],
    },
    transmission: {
      type: String,
      enum: ['automatic', 'manual'],
    },
    color: String,
  },
  availability: {
    type: Boolean,
    default: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound indexes for efficient queries
carSchema.index({ vendor: 1, isActive: 1 });
carSchema.index({ availability: 1, isActive: 1, isApproved: 1 });
carSchema.index({ type: 1, availability: 1 });
carSchema.index({ 'location.coordinates': '2dsphere' });

// Update updatedAt on save
carSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Car', carSchema);

