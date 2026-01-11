const { Server } = require('socket.io');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const stripeService = require('../services/stripeService');
const { socketAuth } = require('../middleware/auth');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id} (${socket.user.role})`);

    // Join user's personal room
    socket.join(`user:${socket.user._id}`);

    // Join car rooms if vendor
    if (socket.user.role === 'VENDOR') {
      socket.join(`vendor:${socket.user._id}`);
    }

    // Handle car viewing - join car room
    socket.on('join_car', (carId) => {
      socket.join(`car:${carId}`);
      console.log(`User ${socket.user._id} joined car:${carId}`);
    });

    // Handle car viewing - leave car room
    socket.on('leave_car', (carId) => {
      socket.leave(`car:${carId}`);
      console.log(`User ${socket.user._id} left car:${carId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });

  return io;
};

// Emit car availability update
const emitCarAvailability = (carId, available) => {
  if (io) {
    io.to(`car:${carId}`).emit(available ? 'car_available' : 'car_unavailable', {
      carId,
      timestamp: new Date(),
    });
  }
};

// Emit booking created
const emitBookingCreated = (booking) => {
  if (io) {
    // Notify users viewing the car
    io.to(`car:${booking.car}`).emit('booking_created', {
      bookingId: booking._id,
      carId: booking.car,
      startDate: booking.startDate,
      endDate: booking.endDate,
    });

    // Notify vendor
    io.to(`vendor:${booking.vendor}`).emit('new_booking', {
      bookingId: booking._id,
      userId: booking.user,
      carId: booking.car,
    });
  }
};

// Emit booking cancelled
const emitBookingCancelled = (booking) => {
  if (io) {
    // Notify users viewing the car
    io.to(`car:${booking.car}`).emit('booking_cancelled', {
      bookingId: booking._id,
      carId: booking.car,
    });

    // Notify vendor
    io.to(`vendor:${booking.vendor}`).emit('booking_cancelled', {
      bookingId: booking._id,
      carId: booking.car,
    });
  }
};

// Emit payment success
const emitPaymentSuccess = (booking) => {
  if (io) {
    // Notify user
    io.to(`user:${booking.user}`).emit('payment_success', {
      bookingId: booking._id,
      status: 'PAID',
    });

    // Notify vendor
    io.to(`vendor:${booking.vendor}`).emit('booking_paid', {
      bookingId: booking._id,
      carId: booking.car,
    });

    // Car becomes unavailable
    emitCarAvailability(booking.car, false);
  }
};

const getIO = () => io;

module.exports = {
  initializeSocket,
  emitCarAvailability,
  emitBookingCreated,
  emitBookingCancelled,
  emitPaymentSuccess,
  getIO,
};

