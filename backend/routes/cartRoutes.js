// ════════════════════════════════════════════
// FILE: backend/routes/cartRoutes.js
// ════════════════════════════════════════════
const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

// All cart routes require login
router.get(   "/",          protect, getCart);
router.post(  "/",          protect, addToCart);
router.put(   "/:itemId",   protect, updateCartItem);
router.delete("/:itemId",   protect, removeFromCart);
router.delete("/",          protect, clearCart);

module.exports = router;
