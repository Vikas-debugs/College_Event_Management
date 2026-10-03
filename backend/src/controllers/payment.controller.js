const Payment = require('../models/Payment');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const paymentService = require('../services/paymentService');

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Protected
exports.createOrder = async (req, res, next) => {
  try {
    const { eventId, amount } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const orderAmount = event.fee || amount || 0;
    const order = await paymentService.createOrder({
      amount: orderAmount,
      receipt: `tihs_${req.user._id.toString().slice(-4)}_${Date.now().toString().slice(-6)}`,
      notes: {
        userId: req.user._id.toString(),
        eventId: event._id.toString(),
        eventTitle: event.title,
      },
    });

    res.status(200).json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_tihsDemoKey123',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Payment
// @route   POST /api/payments/verify
// @access  Protected
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      registrationId,
      amount,
    } = req.body;

    const isValid = paymentService.verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification signature failed',
      });
    }

    const payment = await Payment.create({
      user: req.user._id,
      event: eventId,
      registration: registrationId || undefined,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      amount: amount || 0,
      status: 'captured',
    });

    if (registrationId) {
      await Registration.findByIdAndUpdate(registrationId, {
        paymentStatus: 'paid',
        payment: payment._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and recorded successfully!',
      payment,
    });
  } catch (error) {
    next(error);
  }
};
