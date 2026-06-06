const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.FRONTEND_URL || "http://localhost:3000",
    ],
    credentials: true,
  })
);

// ─── Routes ──────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

// ─── Health check ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Gopika API is running 🌸" });
});

// ─── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Backend Error:", err);
  
  // Razorpay or other library errors might throw custom objects instead of standard Error
  let message = "Internal Server Error";
  let status = err.status || 500;

  if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === "object" && err !== null) {
    if (err.error && err.error.description) {
      message = `Payment Service Error: ${err.error.description}`;
    } else if (err.description) {
      message = `Payment Service Error: ${err.description}`;
    } else if (err.message) {
      message = err.message;
    } else {
      message = JSON.stringify(err);
    }
    if (err.statusCode) {
      status = err.statusCode;
    }
  } else if (typeof err === "string") {
    message = err;
  }

  res.status(status).json({
    success: false,
    message,
    stack: err instanceof Error ? err.stack : undefined,
  });
});

// ─── MongoDB + Server Start ───────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
