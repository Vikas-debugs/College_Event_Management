const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_tihsDemoKey123';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_tihsDemoSecret456';

let razorpayInstance;
try {
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
} catch (error) {
  console.warn(`[TIHS-CEMS Razorpay] Initialization notice: ${error.message}`);
}

module.exports = razorpayInstance;
