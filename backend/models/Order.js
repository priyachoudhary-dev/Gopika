const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        size: { type: String, default: "Free Size" },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    // Pricing breakdown
    itemsPrice: { type: Number, required: true }, // sum of all items
    shippingPrice: { type: Number, default: 0 }, // free if over ₹500
    taxPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },

    // Razorpay / Stripe payment details
    paymentMethod: {
      type: String,
      default: "Stripe",
    },
    razorpayOrderId: { type: String }, // ID from Razorpay when order created
    razorpayPaymentId: { type: String }, // ID after successful payment
    razorpaySignature: { type: String }, // for verifying payment authenticity
    stripeSessionId: { type: String }, // ID from Stripe Checkout
    stripePaymentIntentId: { type: String }, // ID from Stripe after payment is completed

    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    // Order lifecycle: Pending → Processing → Shipped → Delivered
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },

    couponCode: { type: String, default: "" },
    discountAmount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
