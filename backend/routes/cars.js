const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Car = require('../models/Car');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/cars
// @desc    Get all cars with filters
// @access  Public
router.get(
  '/',
  [
    query('lat').optional().isFloat().withMessage('Invalid latitude'),
    query('lng').optional().isFloat().withMessage('Invalid longitude'),
    query('radius').optional().isInt({ min: 1, max: 100 }).withMessage('Radius must be between 1-100 km'),
    query('type').optional().isIn(['sedan', 'suv', 'truck', 'van', 'luxury', 'sports', 'motorcycle', 'convertible']),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('city').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const {
        lat,
        lng,
        radius = 50,
        type,
        minPrice,
        maxPrice,
        city,
        page = 1,
        limit = 20,
      } = req.query;

      const query = {
        isActive: true,
        isApproved: true,
        availability: true,
      };

      // Filter by type
      if (type) {
        query.type = type;
      }

      // Filter by price
      if (minPrice || maxPrice) {
        query.pricePerDay = {};
        if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
        if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
      }

      // Filter by city
      if (city) {
        query['location.address.city'] = new RegExp(city, 'i');
      }

      // Geo-location query
      if (lat && lng) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
          },
        };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const cars = await Car.find(query)
        .populate('vendor', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Car.countDocuments(query);

      res.json({
        success: true,
        count: cars.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        data: cars,
      });
    } catch (error) {
      console.error('Get cars error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// @route   GET /api/cars/vendor
// @desc    Get all cars for current vendor
// @access  Private (VENDOR)
router.get('/vendor', protect, authorize('VENDOR'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const cars = await Car.find({ vendor: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Car.countDocuments({ vendor: req.user._id });

    res.json({
      success: true,
      count: cars.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: cars,
    });
  } catch (error) {
    console.error('Get vendor cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/cars/:id
// @desc    Get single car
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('vendor', 'name email vendorProfile');

    if (!car || !car.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    res.json({
      success: true,
      data: car,
    });
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/cars
// @desc    Create new car
// @access  Private (VENDOR)
router.post(
  '/',
  protect,
  authorize('VENDOR'),
  [
    body('make').notEmpty().withMessage('Make is required'),
    body('model').notEmpty().withMessage('Model is required'),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid year'),
    body('type').isIn(['sedan', 'suv', 'truck', 'van', 'luxury', 'sports', 'motorcycle', 'convertible']),
    body('pricePerDay').isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [lng, lat]'),
    body('location.address.city').notEmpty().withMessage('City is required'),
    body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
    body('description').notEmpty().withMessage('Description is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Check if vendor is approved
      const user = await User.findById(req.user._id);
      if (user.role === 'VENDOR' && !user.isVendorApproved) {
        return res.status(403).json({
          success: false,
          message: 'Vendor account not approved',
        });
      }

      const carData = {
        ...req.body,
        vendor: req.user._id,
        location: {
          type: 'Point',
          coordinates: req.body.location.coordinates,
          address: req.body.location.address,
        },
      };

      const car = await Car.create(carData);

      res.status(201).json({
        success: true,
        data: car,
      });
    } catch (error) {
      console.error('Create car error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// @route   PUT /api/cars/:id
// @desc    Update car
// @access  Private (VENDOR)
router.put(
  '/:id',
  protect,
  authorize('VENDOR'),
  async (req, res) => {
    try {
      let car = await Car.findById(req.params.id);

      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Car not found',
        });
      }

      // Make sure user owns the car
      if (car.vendor.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this car',
        });
      }

      car = await Car.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      res.json({
        success: true,
        data: car,
      });
    } catch (error) {
      console.error('Update car error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// @route   DELETE /api/cars/:id
// @desc    Delete car
// @access  Private (VENDOR)
router.delete('/:id', protect, authorize('VENDOR'), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    // Make sure user owns the car
    if (car.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this car',
      });
    }

    // Soft delete - set isActive to false
    car.isActive = false;
    car.availability = false;
    await car.save();

    res.json({
      success: true,
      message: 'Car deleted successfully',
    });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;

