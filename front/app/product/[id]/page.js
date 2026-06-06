"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/axios";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

// ── Star renderer ───────────────────────────────────────────────
function Stars({ rating, size = "text-sm" }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`${size} ${i <= Math.round(rating) ? "star-filled" : "text-gray-200"}`}>★</span>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id }    = useParams();
  const router    = useRouter();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [selSize,  setSelSize]  = useState("");
  const [imgIdx,   setImgIdx]   = useState(0);
  const [adding,   setAdding]   = useState(false);
  const [added,    setAdded]    = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
        setSelSize(data.product.sizes?.[0] || "Free Size");
      } catch (e) {
        if (e.response?.status === 404) setNotFound(true);
        else console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (!selSize || adding) return;
    setAdding(true);
    const result = await addToCart(product._id, selSize, 1);
    setAdding(false);
    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          <div className="skeleton aspect-[3/4] rounded-3xl" />
          <div className="space-y-4 pt-4">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-10 rounded" />
            <div className="skeleton h-5 w-48 rounded" />
            <div className="skeleton h-8 w-32 rounded" />
            <div className="skeleton h-24 rounded" />
            <div className="skeleton h-12 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // ── 404 ──────────────────────────────────────────────────────
  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center px-4 pt-20">
        <div className="text-center animate-fade-up">
          <span className="text-7xl block mb-6">🌸</span>
          <h2 className="font-display text-3xl font-light text-gray-700 mb-3">Product not found</h2>
          <p className="text-gray-400 mb-8 font-body">This item may no longer be available.</p>
          <Link href="/shop"><button className="btn-primary">Back to Shop →</button></Link>
        </div>
      </div>
    );
  }

  const hasDiscount   = product.discountedPrice > 0;
  const displayPrice  = hasDiscount ? product.discountedPrice : product.price;
  const discountPct   = hasDiscount ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) : 0;
  const isOutOfStock  = product.stock === 0;
  const images        = product.images || [];

  return (
    <div className="min-h-screen bg-cream-50 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 font-body">
          <Link href="/" className="hover:text-rose-500 transition-colors">Home</Link>
          <span>›</span>
          <Link href="/shop" className="hover:text-rose-500 transition-colors">Shop</Link>
          <span>›</span>
          <Link href={`/shop?category=${product.category}`}
            className="hover:text-rose-500 transition-colors">{product.category}</Link>
          <span>›</span>
          <span className="text-gray-600 truncate max-w-[140px]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* ── Image gallery ── */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-rose-50 shadow-card-3d group">
              {images[imgIdx]?.url ? (
                <Image
                  src={images[imgIdx].url}
                  alt={product.name}
                  fill className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">👗</div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNewArrival && (
                  <span className="bg-rose-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-rose-sm">New</span>
                )}
                {hasDiscount && (
                  <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">{discountPct}% off</span>
                )}
                {isOutOfStock && (
                  <span className="bg-gray-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Sold out</span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200
                      ${imgIdx === i ? "border-rose-400 shadow-rose-sm" : "border-transparent opacity-60 hover:opacity-100"}`}>
                    <Image src={img.url} alt={`View ${i+1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ── */}
          <div className="lg:pt-2">

            {/* Category */}
            <p className="text-rose-400 text-xs font-medium uppercase tracking-widest mb-2">{product.category}</p>

            {/* Name */}
            <h1 className="font-display text-3xl sm:text-4xl font-light text-gray-800 leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Stars rating={product.rating} />
                <span className="text-sm text-gray-400 font-body">
                  {product.rating.toFixed(1)} ({product.numReviews} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="font-display text-3xl font-semibold text-rose-600">
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <>
                  <span className="font-body text-lg text-gray-400 line-through">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Save {discountPct}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="font-body text-gray-500 text-sm leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Divider */}
            <div className="border-t border-rose-100 mb-6" />

            {/* Size selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <p className="font-body text-sm font-medium text-gray-700 mb-3">
                  Select Size — <span className="text-rose-500">{selSize}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => setSelSize(size)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium font-body border-2 transition-all duration-200
                        ${selSize === size
                          ? "bg-rose-500 text-white border-rose-500 shadow-rose-sm"
                          : "bg-white text-gray-600 border-rose-200 hover:border-rose-400 hover:text-rose-600"}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <p className="font-body text-sm font-medium text-gray-700 mb-2">Available Colours</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <span key={color}
                      className="text-xs bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1 rounded-full font-body">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${isOutOfStock ? "bg-gray-400" : product.stock < 5 ? "bg-amber-400 animate-pulse" : "bg-green-400"}`} />
              <span className={`text-xs font-body font-medium ${isOutOfStock ? "text-gray-400" : product.stock < 5 ? "text-amber-600" : "text-green-600"}`}>
                {isOutOfStock ? "Out of Stock" : product.stock < 5 ? `Only ${product.stock} left!` : "In Stock"}
              </span>
            </div>

            {/* Add to cart */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
                className={`flex-1 py-4 rounded-2xl font-medium font-body text-base transition-all duration-300
                  ${isOutOfStock
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : added
                      ? "bg-green-500 text-white shadow-md"
                      : "btn-primary"}`}>
                {isOutOfStock ? "Out of Stock"
                  : adding    ? "Adding..."
                  : added     ? "Added to Cart ✓"
                  : "Add to Cart 🛍️"}
              </button>
              <Link href="/cart">
                <button className="btn-outline px-5 py-4 rounded-2xl">
                  View Cart
                </button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: "🚚", label: "Free ship ₹500+" },
                { icon: "↩️",  label: "7-day returns"   },
                { icon: "🔒", label: "Secure payment"  },
              ].map(b => (
                <div key={b.label}
                  className="glass-rose rounded-xl p-3 border border-rose-100 text-center">
                  <span className="text-lg block mb-0.5">{b.icon}</span>
                  <p className="text-xs text-gray-500 font-body">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews section ── */}
        {product.reviews && product.reviews.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-3xl font-light text-gray-800 mb-8">
              Customer <span className="text-gradient font-semibold">Reviews</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {product.reviews.map((r, i) => (
                <div key={i} className="glass-rose rounded-3xl p-6 border border-rose-100
                  hover:shadow-rose-sm hover:-translate-y-1 transition-all duration-300">
                  <Stars rating={r.rating} size="text-xs" />
                  <p className="font-body text-gray-600 text-sm leading-relaxed mt-3 mb-4 italic">
                    "{r.comment}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-blush-400
                      flex items-center justify-center text-white text-xs font-bold">
                      {r.name?.[0]?.toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-gray-700">{r.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Continue Shopping ── */}
        <div className="text-center mt-14">
          <Link href="/shop">
            <button className="btn-outline px-8 py-3">← Back to Shop</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
