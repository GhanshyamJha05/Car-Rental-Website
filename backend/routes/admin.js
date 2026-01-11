const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const PlatformRevenue = require('../models/PlatformRevenue');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
// @access  Private (ADMIN)
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Revenue analytics
    const revenue = await PlatformRevenue.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalBookings: { $sum: 1 },
        },
      },
    ]);

    // Monthly revenue
    const monthlyRevenue = await PlatformRevenue.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          revenue: { $sum: '$amount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    // User stats
    const totalUsers = await User.countDocuments();
    const totalVendors = await User.countDocuments({ role: 'VENDOR' });
    const approvedVendors = await User.countDocuments({ role: 'VENDOR', isVendorApproved: true });

    // Car stats
    const totalCars = await Car.countDocuments({ isActive: true });
    const approvedCars = await Car.countDocuments({ isActive: true, isApproved: true });

    // Booking stats
    const bookingStats = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$total' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        revenue: revenue[0] || { totalRevenue: 0, totalBookings: 0 },
        monthlyRevenue,
        users: {
          total: totalUsers,
          vendors: totalVendors,
          approvedVendors,
        },
        cars: {
          total: totalCars,
          approved: approvedCars,
        },
        bookings: bookingStats,
      },
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/admin/vendors
// @desc    Get all vendors
// @access  Private (ADMIN)
router.get('/vendors', async (req, res) => {
  try {
    const { approved, page = 1, limit = 20 } = req.query;
    const query = { role: 'VENDOR' };
    if (approved !== undefined) {
      query.isVendorApproved = approved === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const vendors = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: vendors.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: vendors,
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   PUT /api/admin/vendors/:id/approve
// @desc    Approve vendor
// @access  Private (ADMIN)
router.put('/vendors/:id/approve', async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);

    if (!vendor || vendor.role !== 'VENDOR') {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    vendor.isVendorApproved = true;
    await vendor.save();

    res.json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/admin/cars
// @desc    Get all cars (for approval)
// @access  Private (ADMIN)
router.get('/cars', async (req, res) => {
  try {
    const { approved, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    if (approved !== undefined) {
      query.isApproved = approved === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const cars = await Car.find(query)
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

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
});

// @route   PUT /api/admin/cars/:id/approve
// @desc    Approve car
// @access  Private (ADMIN)
router.put('/cars/:id/approve', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    car.isApproved = true;
    await car.save();

    res.json({
      success: true,
      data: car,
    });
  } catch (error) {
    console.error('Approve car error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;

