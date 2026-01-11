const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const stripeService = require('../services/stripeService');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payments/create-session
// @desc    Create Stripe checkout session
// @access  Private (USER)
router.post(
  '/create-session',
  protect,
  authorize('USER'),
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('successUrl').isURL().withMessage('Valid success URL is required'),
    body('cancelUrl').isURL().withMessage('Valid cancel URL is required'),
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

      const { bookingId, successUrl, cancelUrl } = req.body;

      // Verify booking belongs to user
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }

      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized',
        });
      }

      if (booking.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: 'Booking is not pending payment',
        });
      }

      const session = await stripeService.createCheckoutSession(
        bookingId,
        successUrl,
        cancelUrl
      );

      res.json({
        success: true,
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      console.error('Create payment session error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
      });
    }
  }
);

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhook
// @access  Public (Stripe webhook)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripeService.verifyWebhook(req.body, sig);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        if (session.payment_status === 'paid') {
          await stripeService.handlePaymentSuccess(session.id, session.metadata);
          
          // Emit real-time event (handled in WebSocket handler)
          // booking_paid event will be emitted
        }
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await stripeService.handlePaymentSuccess(
          paymentIntent.id,
          paymentIntent.metadata
        );
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await stripeService.handlePaymentFailure(
          failedPayment.id,
          failedPayment.metadata
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;

