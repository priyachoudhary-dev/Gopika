const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ─── @route   GET /api/cart ────────────────────────────────────
// @desc    Get logged in user's cart with product details
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  // populate() replaces product ObjectId with the full product document
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name images price discountedPrice stock"
  );

  if (!cart) {
    // Return empty cart if user has no cart yet
    return res.json({ success: true, items: [], totalPrice: 0 });
  }

  res.json({ success: true, cart });
});

// ─── @route   POST /api/cart ───────────────────────────────────
// @desc    Add item to cart (or increase qty if already exists)
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, size = "Free Size" } = req.body;

  // Verify product exists and has stock
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.stock < quantity) {
    res.status(400);
    throw new Error("Insufficient stock");
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Create new cart for this user
    cart = new Cart({ user: req.user._id, items: [] });
  }

  // Check if same product+size already in cart
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId && item.size === size
  );

  if (existingItemIndex >= 0) {
    // Increase quantity
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      product:  productId,
      quantity,
      size,
      price: product.discountedPrice > 0 ? product.discountedPrice : product.price,
    });
  }

  await cart.save();

  // Return populated cart
  const updatedCart = await Cart.findById(cart._id).populate(
    "items.product",
    "name images price discountedPrice stock"
  );

  res.json({ success: true, cart: updatedCart });
});

// ─── @route   PUT /api/cart/:itemId ───────────────────────────
// @desc    Update quantity of a specific cart item
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  // Find item by its sub-document _id
  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    item.deleteOne();
  } else {
    item.quantity = quantity;
  }

  await cart.save();

  const updatedCart = await Cart.findById(cart._id).populate(
    "items.product",
    "name images price discountedPrice stock"
  );

  res.json({ success: true, cart: updatedCart });
});

// ─── @route   DELETE /api/cart/:itemId ────────────────────────
// @desc    Remove one item from cart
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => item._id.toString() !== req.params.itemId
  );

  await cart.save();
  res.json({ success: true, message: "Item removed from cart" });
});

// ─── @route   DELETE /api/cart ─────────────────────────────────
// @desc    Clear entire cart (called after successful order)
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ success: true, message: "Cart cleared" });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
