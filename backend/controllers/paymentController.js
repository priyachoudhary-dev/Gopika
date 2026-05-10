const asyncHandler = require("express-async-handler");
const Razorpay = require("razorpay");
const crypto = require("crypto"); // built-in Node module, no install needed

// ─── Initialize Razorpay with your keys ───────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── @route   POST /api/payment/create-order ──────────────────
// @desc    Create a Razorpay order (step 1 of payment flow)
// @access  Private
//
// HOW RAZORPAY PAYMENT WORKS (3 steps):
// 1. Backend creates a Razorpay "order" → gets an order_id
// 2. Frontend opens Razorpay payment popup with that order_id
// 3. After user pays, backend verifies the payment signature
//    and then saves the order to our DB

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = "INR" } = req.body;

  // amount must be in paise (₹1 = 100 paise)
  const options = {
    amount:   Math.round(amount * 100),
    currency,
    receipt:  `receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);

  res.json({
    success: true,
    orderId: order.id,       // send to frontend to open payment popup
    amount:  order.amount,
    currency: order.currency,
  });
});

// ─── @route   POST /api/payment/verify ────────────────────────
// @desc    Verify payment signature after user pays (step 3)
// @access  Private
//
// WHY VERIFY? Razorpay sends back a signature made from:
//   HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
// We re-create that signature and compare. If they match → payment is genuine.
// This prevents fake payment confirmation requests.

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Re-create the expected signature using our secret
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.json({
      success:    true,
      message:    "Payment verified successfully",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
  } else {
    res.status(400);
    throw new Error("Payment verification failed — invalid signature");
  }
});

module.exports = { createRazorpayOrder, verifyPayment };
