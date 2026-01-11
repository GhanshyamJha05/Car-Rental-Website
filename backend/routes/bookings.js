const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const bookingService = require('../services/bookingService');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private (USER)
router.post(
  '/',
  protect,
  authorize('USER'),
  [
    body('car').notEmpty().withMessage('Car ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('pickupLocation.coordinates').optional().isArray({ min: 2, max: 2 }),
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

      const { car, startDate, endDate, pickupLocation, notes } = req.body;

      // Get car
      const carDoc = await Car.findById(car);
      if (!carDoc || !carDoc.isActive || !carDoc.availability) {
        return res.status(400).json({
          success: false,
          message: 'Car is not available',
        });
      }

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (start < now) {
        return res.status(400).json({
          success: false,
          message: 'Start date cannot be in the past',
        });
      }

      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date',
        });
      }

      // Calculate days
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      // Create booking
      const bookingData = {
        user: req.user._id,
        vendor: carDoc.vendor,
        car: carDoc._id,
        startDate: start,
        endDate: end,
        days,
        pricePerDay: carDoc.pricePerDay,
        pickupLocation: pickupLocation || carDoc.location,
        notes,
      };

      const booking = await bookingService.createBooking(bookingData);

      // Populate booking
      const populatedBooking = await Booking.findById(booking._id)
        .populate('user', 'name email')
        .populate('vendor', 'name email')
        .populate('car');

      // Emit real-time event (handled in WebSocket handler)
      req.io?.to(`car:${car}`).emit('car_unavailable', {
        carId: car,
        bookingId: booking._id,
      });

      res.status(201).json({
        success: true,
        data: populatedBooking,
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
      });
    }
  }
);

// @route   GET /api/bookings/user
// @desc    Get user bookings
// @access  Private (USER)
router.get('/user', protect, authorize('USER'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bookings = await Booking.find(query)
      .populate('vendor', 'name email')
      .populate('car', 'make model year images location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: bookings,
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/bookings/vendor
// @desc    Get vendor bookings
// @access  Private (VENDOR)
router.get('/vendor', protect, authorize('VENDOR'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { vendor: req.user._id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('car', 'make model year images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: bookings,
    });
  } catch (error) {
    console.error('Get vendor bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('vendor', 'name email')
      .populate('car')
      .populate('payment');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      booking.vendor._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put(
  '/:id/cancel',
  protect,
  [body('reason').optional().trim()],
  async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }

      // Check authorization
      if (
        booking.user._id.toString() !== req.user._id.toString() &&
        booking.vendor._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'ADMIN'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this booking',
        });
      }

      const cancelledBooking = await bookingService.cancelBooking(
        req.params.id,
        req.user._id,
        req.body.reason
      );

      // Emit real-time event
      req.io?.to(`car:${booking.car}`).emit('car_available', {
        carId: booking.car,
        bookingId: booking._id,
      });

      res.json({
        success: true,
        data: cancelledBooking,
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
      });
    }
  }
);

module.exports = router;

