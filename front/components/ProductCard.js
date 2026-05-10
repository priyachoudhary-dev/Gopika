"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }) {
  const { addToCart }  = useCart();
  const { isLoggedIn } = useAuth();
  const router         = useRouter();
  const [adding, setAdding] = useState(false);
  const [added,  setAdded]  = useState(false);

  // ── Derived values ────────────────────────────────────────────
  const hasDiscount   = product.discountedPrice > 0;
  const displayPrice  = hasDiscount ? product.discountedPrice : product.price;
  const discountPct   = hasDiscount
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;
  const isOutOfStock  = product.stock === 0;
  const defaultSize   = product.sizes?.[0] || "Free Size";
  const imageUrl      = product.images?.[0]?.url;

  // ── Add to cart ───────────────────────────────────────────────
  const handleAddToCart = async (e) => {
    // Stop the click from navigating to product page
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (isOutOfStock || adding) return;

    setAdding(true);
    const result = await addToCart(product._id, defaultSize, 1);
    setAdding(false);

    if (result.success) {
      setAdded(true);
      // Reset "Added ✓" back to normal after 2 seconds
      setTimeout(() => setAdded(false), 2000);
    }
  };

  // ── Render star rating ────────────────────────────────────────
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <span
        key={i}
        className={i < Math.round(rating) ? "star-filled" : "text-gray-200"}
        style={{ fontSize: "12px" }}
      >
        ★
      </span>
    ));
  };

  return (
    <Link href={`/product/${product._id}`}>
      <div className="group bg-white rounded-3xl overflow-hidden border border-rose-100
        hover:-translate-y-2 hover:shadow-rose-md transition-all duration-300 cursor-pointer">

        {/* ── Product Image ── */}
        <div className="relative aspect-[3/4] bg-cream-100 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            // Placeholder when no image
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br
              from-rose-50 to-blush-200 text-6xl">
              👗
            </div>
          )}

          {/* Badges (top-left) */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNewArrival && (
              <span className="bg-rose-500 text-white text-xs font-semibold
                px-2.5 py-1 rounded-full shadow-rose-sm">
                New
              </span>
            )}
            {hasDiscount && (
              <span className="bg-green-500 text-white text-xs font-semibold
                px-2.5 py-1 rounded-full">
                {discountPct}% off
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-500 text-white text-xs font-semibold
                px-2.5 py-1 rounded-full">
                Sold out
              </span>
            )}
          </div>
        </div>

        {/* ── Product Info ── */}
        <div className="p-4">
          {/* Category tag */}
          <p className="font-body text-xs text-rose-400 font-medium uppercase
            tracking-wider mb-1">
            {product.category}
          </p>

          {/* Product name */}
          <h3 className="font-display text-base font-medium text-gray-800
            line-clamp-2 mb-2 group-hover:text-rose-600 transition-colors duration-200">
            {product.name}
          </h3>

          {/* Rating row */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex">{renderStars(product.rating)}</div>
              <span className="font-body text-xs text-gray-400">
                ({product.numReviews})
              </span>
            </div>
          )}

          {/* Price row */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-body font-semibold text-rose-600 text-base">
              ₹{displayPrice.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="font-body text-xs text-gray-400 line-through">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`w-full text-sm py-2.5 rounded-xl font-medium font-body
              transition-all duration-200 border
              ${isOutOfStock
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : added
                  ? "bg-green-50 text-green-600 border-green-200"
                  : "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-500 hover:text-white hover:border-rose-500"
              }`}
          >
            {isOutOfStock
              ? "Out of Stock"
              : adding
                ? "Adding..."
                : added
                  ? "Added ✓"
                  : "Add to Cart"
            }
          </button>
        </div>
      </div>
    </Link>
  );
}
