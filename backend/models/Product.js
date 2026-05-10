const mongoose = require("mongoose");

// ─── Review sub-schema (embedded inside Product) ──────────────
// Sub-schemas live inside the parent document — no separate collection.
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name:   { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment:{ type: String, required: true },
  },
  { timestamps: true }
);

// ─── Main Product Schema ───────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountedPrice: {
      type: Number,
      default: 0, // 0 means no discount
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Dress",
        "Kurta",
        "Saree",
        "Co-Ord Set",
        "Tops",
        "Lehenga",
        "Accessories",
      ],
    },
    brand: {
      type: String,
      default: "Gopika",
    },
    // Images stored as Cloudinary URLs (not local paths)
    images: [
      {
        public_id: { type: String, required: true }, // Cloudinary ID for deletion
        url:       { type: String, required: true }, // Cloudinary URL to display
      },
    ],
    sizes: [
      {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"],
      },
    ],
    colors: [{ type: String }],
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    isFeatured: {
      type: Boolean,
      default: false, // shown on home page if true
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema], // array of embedded reviews
    rating: {
      type: Number,
      default: 0, // average calculated when review is added
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
