const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Generate JWT token ────────────────────────────────────────
// Token expires in 30 days — user stays logged in for 30 days.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ─── @route   POST /api/auth/register ─────────────────────────
// @desc    Register a new user
// @access  Public (anyone can register)
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all fields");
  }

  // Check if email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User with this email already exists");
  }

  // Create user — password gets hashed automatically by User model pre-save hook
  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    user: {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
    token: generateToken(user._id),
  });
});

// ─── @route   POST /api/auth/login ────────────────────────────
// @desc    Login user and return token
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  // Find user by email
  const user = await User.findOne({ email });

  // Check user exists AND password matches
  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// ─── @route   GET /api/auth/profile ───────────────────────────
// @desc    Get logged in user profile
// @access  Private (requires token)
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, user });
});

// ─── @route   PUT /api/auth/profile ───────────────────────────
// @desc    Update user profile (name, phone, address)
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update only the fields that were sent
  user.name    = req.body.name    || user.name;
  user.phone   = req.body.phone   || user.phone;
  user.address = req.body.address || user.address;

  // If user wants to change password
  if (req.body.password) {
    user.password = req.body.password; // pre-save hook will hash it
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    user: {
      _id:     updatedUser._id,
      name:    updatedUser.name,
      email:   updatedUser.email,
      role:    updatedUser.role,
      phone:   updatedUser.phone,
      address: updatedUser.address,
    },
    token: generateToken(updatedUser._id),
  });
});

// ─── @route   GET /api/auth/users ─────────────────────────────
// @desc    Get all users (admin only)
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
};
