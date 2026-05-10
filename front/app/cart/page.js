"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const { cartItems, cartTotal, cartLoading, updateQuantity, removeFromCart } = useCart();
  const { isLoggedIn } = useAuth();

  const shipping    = cartTotal >= 500 ? 0 : 60;
  const grandTotal  = cartTotal + shipping;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center px-4 pt-20">
        <div className="text-center animate-fade-up">
          <span className="text-7xl block mb-6">🛍️</span>
          <h2 className="font-display text-3xl font-light text-gray-700 mb-3">
            Your cart awaits
          </h2>
          <p className="text-gray-400 mb-8 font-body">
            Please sign in to view your cart
          </p>
          <Link href="/login"><button className="btn-primary">Sign In →</button></Link>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24 px-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center px-4 pt-20">
        <div className="text-center animate-fade-up">
          <span className="text-7xl block mb-6 animate-bounce-soft">🛍️</span>
          <h2 className="font-display text-3xl font-light text-gray-700 mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-400 mb-8 font-body">
            Discover beautiful styles and fill it up!
          </p>
          <Link href="/shop"><button className="btn-primary">Shop Now →</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-rose-400 text-xs uppercase tracking-widest mb-1">Your</p>
          <h1 className="font-display text-4xl font-light text-gray-800">
            Shopping <span className="text-gradient font-semibold">Cart</span>
          </h1>
          <p className="text-gray-400 text-sm font-body mt-1">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item._id}
                className="glass rounded-2xl p-4 sm:p-5 flex gap-4 sm:gap-5
                  border border-rose-100 animate-fade-in hover:shadow-rose-sm
                  transition-shadow duration-200">

                {/* Image */}
                <div className="relative w-24 h-28 sm:w-28 sm:h-32 rounded-xl
                  overflow-hidden bg-cream-100 flex-shrink-0">
                  {item.product?.images?.[0]?.url ? (
                    <Image src={item.product.images[0].url}
                      alt={item.product?.name || "Product"}
                      fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">👗</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product?._id}`}>
                    <h3 className="font-display text-base font-medium text-gray-800
                      hover:text-rose-600 transition-colors line-clamp-2 mb-1">
                      {item.product?.name || "Product"}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mb-1">Size: {item.size}</p>
                  <p className="text-rose-600 font-semibold text-sm mb-3">
                    ₹{item.price?.toLocaleString("en-IN")}
                  </p>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Qty controls */}
                    <div className="flex items-center gap-2 bg-rose-50 rounded-full px-3 py-1">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-rose-500
                          hover:bg-rose-100 rounded-full transition-colors font-bold">
                        −
                      </button>
                      <span className="text-sm font-medium text-gray-700 w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-rose-500
                          hover:bg-rose-100 rounded-full transition-colors font-bold">
                        +
                      </button>
                    </div>

                    {/* Subtotal + remove */}
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-800 text-sm">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                      <button onClick={() => removeFromCart(item._id)}
                        className="text-xs text-red-400 hover:text-red-600
                          transition-colors underline-animate">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="glass-rose rounded-2xl p-6 border border-rose-100
              sticky top-24 animate-fade-in">
              <h2 className="font-display text-xl text-gray-800 mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-500 font-medium" : ""}>
                    {shipping === 0 ? "FREE 🎉" : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-rose-400">
                    Add ₹{(500 - cartTotal).toLocaleString("en-IN")} more for free shipping
                  </p>
                )}
                <div className="border-t border-rose-200 pt-3 flex justify-between
                  font-semibold text-gray-800">
                  <span>Total</span>
                  <span className="text-rose-600 text-lg">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <Link href="/checkout">
                <button className="btn-primary w-full text-base py-3.5">
                  Proceed to Checkout →
                </button>
              </Link>

              <Link href="/shop">
                <button className="w-full text-center text-sm text-rose-400
                  hover:text-rose-600 mt-3 transition-colors py-2">
                  ← Continue Shopping
                </button>
              </Link>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 mt-4
                text-xs text-gray-400">
                <span>🔒</span>
                <span>Secured by Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
