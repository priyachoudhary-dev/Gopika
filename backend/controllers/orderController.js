const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ─── @route   POST /api/orders ─────────────────────────────────
// @desc    Place a new order (called after payment success)
// @access  Private
const placeOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    couponCode,
    discountAmount,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // Create order in DB
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    itemsPrice,
    shippingPrice: shippingPrice || 0,
    taxPrice:      taxPrice      || 0,
    totalPrice,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    isPaid:      true,   // payment verified before calling this
    paidAt:      Date.now(),
    orderStatus: "Processing",
    couponCode:     couponCode     || "",
    discountAmount: discountAmount || 0,
  });

  // Reduce stock for each ordered product
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear user's cart after successful order
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(201).json({ success: true, order });
});

// ─── @route   GET /api/orders/my ──────────────────────────────
// @desc    Get all orders of logged in user
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, orders });
});

// ─── @route   GET /api/orders/:id ─────────────────────────────
// @desc    Get single order by ID
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Security: only the owner or admin can view an order
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.json({ success: true, order });
});

// ─── @route   GET /api/orders ──────────────────────────────────
// @desc    Get ALL orders (admin only)
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  const totalRevenue = orders
    .filter((o) => o.isPaid)
    .reduce((acc, o) => acc + o.totalPrice, 0);

  res.json({ success: true, orders, totalRevenue });
});

// ─── @route   PUT /api/orders/:id/status ──────────────────────
// @desc    Update order status (admin only)
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = orderStatus;

  // Auto-set deliveredAt when status becomes Delivered
  if (orderStatus === "Delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();
  res.json({ success: true, order: updatedOrder });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
