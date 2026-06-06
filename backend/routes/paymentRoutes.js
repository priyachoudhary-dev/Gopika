const express = require("express");
const router = express.Router();
const {
  createStripeSession,
  confirmStripePayment,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

// Stripe payment routes
router.post("/create-checkout-session", protect, createStripeSession);
router.post("/confirm-payment",          protect, confirmStripePayment);

module.exports = router;
