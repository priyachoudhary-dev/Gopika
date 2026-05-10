// ════════════════════════════════════════════
// FILE: backend/routes/authRoutes.js
// ════════════════════════════════════════════
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
} = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login",    loginUser);
router.get( "/profile",  protect, getUserProfile);
router.put( "/profile",  protect, updateUserProfile);
router.get( "/users",    protect, admin, getAllUsers); // admin only

module.exports = router;
