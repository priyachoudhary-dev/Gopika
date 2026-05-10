const mongoose = require("mongoose");

// ─── Why store cart in DB instead of just browser? ────────────
// If user logs in on a different device, their cart is still there.
// Browser localStorage is lost when user clears browser data.
// DB cart persists across devices and sessions.

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one cart document per user
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
          default: 1,
        },
        size: {
          type: String,
          default: "Free Size",
        },
        price: {
          type: Number,
          required: true, // stored at time of adding to cart
        },
      },
    ],
  },
  { timestamps: true }
);

// ─── Virtual: calculate total price ───────────────────────────
// Virtual fields are calculated on-the-fly and NOT stored in DB.
// Accessed as cart.totalPrice
cartSchema.virtual("totalPrice").get(function () {
  return this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
});

module.exports = mongoose.model("Cart", cartSchema);
