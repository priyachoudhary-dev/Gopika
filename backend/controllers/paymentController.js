const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Cart = require("../models/Cart");
const Order = require("../models/Order");

// ─── @route   POST /api/payment/create-checkout-session ───────
// @desc    Create a Stripe Checkout Session
// @access  Private
const createStripeSession = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  // 1. Fetch user's cart from database
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  // 2. Map cart items to Stripe line items structure
  const lineItems = cart.items.map((item) => {
    const hasDiscount = item.product.discountedPrice > 0;
    const displayPrice = hasDiscount ? item.product.discountedPrice : item.product.price;
    const imageUrl = item.product.images && item.product.images.length > 0 
      ? item.product.images[0].url 
      : "";

    return {
      price_data: {
        currency: "inr",
        product_data: {
          name: item.product.name,
          images: imageUrl ? [imageUrl] : [],
          metadata: {
            productId: item.product._id.toString(),
            size: item.size,
          },
        },
        unit_amount: Math.round(displayPrice * 100), // Stripe expects amount in paise (cents equivalent)
      },
      quantity: item.quantity,
    };
  });

  // Calculate prices for breakdown
  const itemsPrice = cart.items.reduce((total, item) => {
    const price = item.product.discountedPrice > 0 ? item.product.discountedPrice : item.product.price;
    return total + price * item.quantity;
  }, 0);
  const shippingPrice = itemsPrice > 500 ? 0 : 50; // free shipping above ₹500, else ₹50
  const totalPrice = itemsPrice + shippingPrice;

  // Add shipping fee as a line item if applicable
  if (shippingPrice > 0) {
    lineItems.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: "Shipping Fee",
          description: "Delivery charges for orders below ₹500",
        },
        unit_amount: Math.round(shippingPrice * 100),
      },
      quantity: 1,
    });
  }

  // 3. Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/checkout/cancel`,
    metadata: {
      userId: req.user._id.toString(),
      shippingAddress: JSON.stringify(shippingAddress),
      itemsPrice: String(itemsPrice),
      shippingPrice: String(shippingPrice),
      totalPrice: String(totalPrice),
    },
  });

  res.json({
    success: true,
    url: session.url,
    sessionId: session.id,
  });
});

// ─── @route   POST /api/payment/confirm-payment ────────────────
// @desc    Verify Stripe payment success and create the order document
// @access  Private
const confirmStripePayment = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400);
    throw new Error("Session ID is required");
  }

  // 1. Retrieve Checkout Session from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session) {
    res.status(404);
    throw new Error("Stripe session not found");
  }

  // Verify payment status
  if (session.payment_status !== "paid") {
    res.status(400);
    throw new Error("Payment has not been completed");
  }

  // 2. Prevent duplicate order creation if page is refreshed
  const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
  if (existingOrder) {
    return res.json({
      success: true,
      message: "Order already processed",
      order: existingOrder,
    });
  }

  // 3. Extract order details from session metadata
  const userId = session.metadata.userId;
  const shippingAddress = JSON.parse(session.metadata.shippingAddress);
  const itemsPrice = parseFloat(session.metadata.itemsPrice);
  const shippingPrice = parseFloat(session.metadata.shippingPrice);
  const totalPrice = parseFloat(session.metadata.totalPrice);

  // 4. Fetch the user's cart to retrieve exact order items
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty, cannot create order");
  }

  const orderItems = cart.items.map((item) => {
    const hasDiscount = item.product.discountedPrice > 0;
    const price = hasDiscount ? item.product.discountedPrice : item.product.price;
    const imageUrl = item.product.images && item.product.images.length > 0 
      ? item.product.images[0].url 
      : "";

    return {
      product: item.product._id,
      name: item.product.name,
      image: imageUrl,
      price,
      size: item.size,
      quantity: item.quantity,
    };
  });

  // 5. Create new Order in DB
  const order = await Order.create({
    user: userId,
    orderItems,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    totalPrice,
    paymentMethod: "Stripe",
    stripeSessionId: sessionId,
    stripePaymentIntentId: session.payment_intent,
    isPaid: true,
    paidAt: new Date(),
    orderStatus: "Processing", // Mark as Processing right away since payment succeeded
  });

  // 6. Clear user's cart in DB
  cart.items = [];
  await cart.save();

  res.json({
    success: true,
    message: "Order placed successfully!",
    order,
  });
});

module.exports = { createStripeSession, confirmStripePayment };
