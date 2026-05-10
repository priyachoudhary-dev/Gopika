const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── What is JWT? ─────────────────────────────────────────────
// JWT = JSON Web Token. When user logs in, backend gives them a token.
// That token is sent with every future request to prove who they are.
// This middleware checks that token on protected routes.

const protect = async (req, res, next) => {
  let token;

  // Token is sent in the Authorization header as: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (without password)
      req.user = await User.findById(decoded.id).select("-password");

      next(); // token valid — proceed to route
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

// ─── Admin-only middleware ─────────────────────────────────────
// Use AFTER protect: router.get("/admin", protect, admin, handler)
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Not authorized as admin",
    });
  }
};

module.exports = { protect, admin };
