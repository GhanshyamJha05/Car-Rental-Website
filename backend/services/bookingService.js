const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Payment = require('../models/Payment');

// Check if dates conflict with existing bookings
exports.checkAvailability = async (carId, startDate, endDate, excludeBookingId = null) => {
  const query = {
    car: carId,
    status: { $in: ['PENDING', 'PAID', 'ACTIVE'] },
    $or: [
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) },
      },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);
  return !conflictingBooking;
};

// Calculate booking totals
exports.calculateTotals = (pricePerDay, days, commissionRate) => {
  const subtotal = pricePerDay * days;
  const platformCommission = subtotal * commissionRate;
  const vendorEarnings = subtotal - platformCommission;
  const total = subtotal;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    platformCommission: Math.round(platformCommission * 100) / 100,
    vendorEarnings: Math.round(vendorEarnings * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

// Create booking
exports.createBooking = async (bookingData) => {
  const session = await Booking.db.startSession();
  session.startTransaction();

  try {
    // Check availability
    const isAvailable = await this.checkAvailability(
      bookingData.car,
      bookingData.startDate,
      bookingData.endDate
    );

    if (!isAvailable) {
      throw new Error('Car is not available for the selected dates');
    }

    // Get car details
    const car = await Car.findById(bookingData.car).session(session);
    if (!car || !car.isActive || !car.availability) {
      throw new Error('Car is not available');
    }

    // Calculate totals
    const commissionRate = parseFloat(process.env.PLATFORM_COMMISSION_RATE || 0.15);
    const totals = this.calculateTotals(
      bookingData.pricePerDay,
      bookingData.days,
      commissionRate
    );

    // Create booking
    const booking = await Booking.create([{
      ...bookingData,
      ...totals,
    }], { session });

    await session.commitTransaction();
    return booking[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Update booking status
exports.updateBookingStatus = async (bookingId, status, userId = null) => {
  const updateData = {
    status,
    updatedAt: new Date(),
  };

  if (status === 'CANCELLED') {
    updateData.cancelledAt = new Date();
    if (userId) {
      updateData.cancelledBy = userId;
    }
  }

  const booking = await Booking.findByIdAndUpdate(bookingId, updateData, { new: true });
  return booking;
};

// Cancel booking
exports.cancelBooking = async (bookingId, userId, reason) => {
  const session = await Booking.db.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Only allow cancellation if not completed
    if (booking.status === 'COMPLETED') {
      throw new Error('Cannot cancel completed booking');
    }

    // Update booking
    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date();
    booking.cancelledBy = userId;
    booking.cancellationReason = reason;
    await booking.save({ session });

    // Refund payment if exists
    if (booking.payment) {
      const payment = await Payment.findById(booking.payment).session(session);
      if (payment && payment.status === 'SUCCEEDED') {
        // Handle refund (integrate with Stripe)
        payment.status = 'REFUNDED';
        payment.refundedAt = new Date();
        await payment.save({ session });
      }
    }

    await session.commitTransaction();
    return booking;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = exports;

