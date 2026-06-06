const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─── What a User looks like in MongoDB ────────────────────────
// Every field here maps to a column in a SQL database.
// mongoose automatically creates _id (unique ID) for each document.

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,          // no two users can have same email
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],  // only these two values allowed
      default: "user",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      street: { type: String, default: "" },
      city:   { type: String, default: "" },
      state:  { type: String, default: "" },
      pincode:{ type: String, default: "" },
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",   // references Product model
      },
    ],
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt fields
  }
);

// ─── Hash password BEFORE saving to database ──────────────────
// Mongoose v7+ async middleware: do NOT use next() — just return.
// This runs automatically every time a user is saved.
// We NEVER store plain text passwords — always hashed.
userSchema.pre("save", async function () {
  // Only hash if password was changed (avoids re-hashing on profile update)
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Method to compare password on login ─────────────────────
// Called as: user.matchPassword("plainTextPassword")
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
