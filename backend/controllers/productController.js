const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;
const Product = require("../models/Product");

// ─── Cloudinary config (reads from .env) ──────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── @route   GET /api/products ───────────────────────────────
// @desc    Get all products with filtering, sorting, pagination
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, sort, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

  // Build filter object dynamically based on query params
  const filter = {};

  if (category)  filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) {
    // Case-insensitive search on name and description
    filter.$or = [
      { name:        { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Sort options
  let sortOption = { createdAt: -1 }; // default: newest first
  if (sort === "price-asc")   sortOption = { price: 1 };
  if (sort === "price-desc")  sortOption = { price: -1 };
  if (sort === "rating")      sortOption = { rating: -1 };
  if (sort === "popular")     sortOption = { numReviews: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    products,
    page:       Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    total,
  });
});

// ─── @route   GET /api/products/featured ──────────────────────
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(8);
  res.json({ success: true, products });
});

// ─── @route   GET /api/products/new-arrivals ──────────────────
// @access  Public
const getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find({ isNewArrival: true }).limit(8);
  res.json({ success: true, products });
});

// ─── @route   GET /api/products/:id ───────────────────────────
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "reviews.user",
    "name"
  );
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, product });
});

// ─── @route   POST /api/products ──────────────────────────────
// @desc    Create product with image upload to Cloudinary
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, discountedPrice, category, sizes, colors, stock, isFeatured, isNewArrival } = req.body;

  // Upload images to Cloudinary
  // req.files comes from multer middleware (set up in routes)
  const imageUploadPromises = req.files.map((file) =>
    cloudinary.uploader.upload(file.path, { folder: "gopika/products" })
  );
  const uploadedImages = await Promise.all(imageUploadPromises);

  const images = uploadedImages.map((img) => ({
    public_id: img.public_id,
    url:       img.secure_url,
  }));

  const product = await Product.create({
    name, description, price,
    discountedPrice: discountedPrice || 0,
    category, images,
    sizes:  sizes  ? JSON.parse(sizes)  : [],
    colors: colors ? JSON.parse(colors) : [],
    stock:  stock  || 0,
    isFeatured:   isFeatured   === "true",
    isNewArrival: isNewArrival === "true",
  });

  res.status(201).json({ success: true, product });
});

// ─── @route   PUT /api/products/:id ───────────────────────────
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const updates = req.body;

  // If new images uploaded, add to Cloudinary
  if (req.files && req.files.length > 0) {
    const imageUploadPromises = req.files.map((file) =>
      cloudinary.uploader.upload(file.path, { folder: "gopika/products" })
    );
    const uploadedImages = await Promise.all(imageUploadPromises);
    updates.images = uploadedImages.map((img) => ({
      public_id: img.public_id,
      url:       img.secure_url,
    }));
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  res.json({ success: true, product: updatedProduct });
});

// ─── @route   DELETE /api/products/:id ────────────────────────
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Delete images from Cloudinary to avoid storage waste
  const deletePromises = product.images.map((img) =>
    cloudinary.uploader.destroy(img.public_id)
  );
  await Promise.all(deletePromises);

  await product.deleteOne();
  res.json({ success: true, message: "Product deleted" });
});

// ─── @route   POST /api/products/:id/review ───────────────────
// @desc    Add a review (one per user per product)
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if user already reviewed this product
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  const review = {
    user:    req.user._id,
    name:    req.user.name,
    rating:  Number(rating),
    comment,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  // Recalculate average rating
  product.rating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) /
    product.reviews.length;

  await product.save();
  res.status(201).json({ success: true, message: "Review added" });
});

module.exports = {
  getProducts,
  getFeaturedProducts,
  getNewArrivals,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
};
