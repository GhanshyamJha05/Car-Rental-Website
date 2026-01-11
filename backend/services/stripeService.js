const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const PlatformRevenue = require('../models/PlatformRevenue');

// Create Stripe Checkout session
exports.createCheckoutSession = async (bookingId, successUrl, cancelUrl) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('car')
      .populate('user');

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'PENDING') {
      throw new Error('Booking is not pending payment');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${booking.car.make} ${booking.car.model} ${booking.car.year}`,
              description: `Rental from ${booking.startDate.toLocaleDateString()} to ${booking.endDate.toLocaleDateString()}`,
              images: booking.car.images.slice(0, 1),
            },
            unit_amount: Math.round(booking.total * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: bookingId.toString(),
      metadata: {
        bookingId: bookingId.toString(),
        userId: booking.user._id.toString(),
        vendorId: booking.vendor.toString(),
        carId: booking.car._id.toString(),
      },
    });

    return session;
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    throw error;
  }
};

// Handle successful payment
exports.handlePaymentSuccess = async (paymentIntentId, metadata) => {
  const session = await stripe.checkout.sessions.retrieve(paymentIntentId);
  
  try {
    const bookingId = metadata.bookingId || session.client_reference_id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if payment already processed
    if (booking.status === 'PAID') {
      return booking;
    }

    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: booking.user,
      vendor: booking.vendor,
      stripePaymentIntentId: session.payment_intent || session.id,
      stripeSessionId: session.id,
      amount: booking.total,
      currency: 'usd',
      status: 'SUCCEEDED',
      platformCommission: booking.platformCommission,
      vendorEarnings: booking.vendorEarnings,
    });

    // Update booking
    booking.status = 'PAID';
    booking.payment = payment._id;
    await booking.save();

    // Create platform revenue record
    await PlatformRevenue.create({
      booking: bookingId,
      payment: payment._id,
      amount: booking.platformCommission,
      commissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE || 0.15),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });

    return booking;
  } catch (error) {
    console.error('Payment success handler error:', error);
    throw error;
  }
};

// Handle failed payment
exports.handlePaymentFailure = async (paymentIntentId, metadata) => {
  try {
    const bookingId = metadata.bookingId;
    if (!bookingId) return;

    const booking = await Booking.findById(bookingId);
    if (!booking) return;

    // Create failed payment record
    await Payment.create({
      booking: bookingId,
      user: booking.user,
      vendor: booking.vendor,
      stripePaymentIntentId: paymentIntentId,
      amount: booking.total,
      currency: 'usd',
      status: 'FAILED',
      platformCommission: booking.platformCommission,
      vendorEarnings: booking.vendorEarnings,
    });

    // Booking remains PENDING, can be retried
  } catch (error) {
    console.error('Payment failure handler error:', error);
  }
};

// Verify webhook signature
exports.verifyWebhook = (payload, signature) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};

module.exports = exports;

