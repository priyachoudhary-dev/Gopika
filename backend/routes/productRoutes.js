const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const {
  getProducts,
  getFeaturedProducts,
  getNewArrivals,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

// ─── Multer setup ──────────────────────────────────────────────
// multer handles file uploads. We store temporarily in /uploads
// before sending to Cloudinary.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});
const fileFilter = (req, file, cb) => {
  // Only accept image files
  const allowed = /jpeg|jpg|png|webp|avif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Only image files allowed"), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// ─── Public routes ─────────────────────────────────────────────
router.get("/",            getProducts);
router.get("/featured",    getFeaturedProducts);
router.get("/new-arrivals",getNewArrivals);
router.get("/:id",         getProductById);

// ─── Protected routes ──────────────────────────────────────────
router.post("/:id/review", protect, addReview);

// ─── Admin routes ──────────────────────────────────────────────
router.post(  "/",    protect, admin, upload.array("images", 5), createProduct);
router.put(   "/:id", protect, admin, upload.array("images", 5), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
