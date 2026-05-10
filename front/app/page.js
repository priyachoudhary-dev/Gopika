"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import ProductCard from "@/components/ProductCard";

// ── Animated counter hook ────────────────────────────────────
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ── Floating decoration orb ───────────────────────────────────
function Orb({ className, style }) {
  return <div className={`orb pointer-events-none absolute ${className}`} style={style} />;
}

export default function HomePage() {
  const [featured,    setFeatured]    = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading,     setLoading]     = useState(true);

  const c1 = useCounter(500);
  const c2 = useCounter(12000);
  const c3 = useCounter(98);

  useEffect(() => {
    const load = async () => {
      try {
        const [f, n] = await Promise.all([
          api.get("/products/featured"),
          api.get("/products/new-arrivals"),
        ]);
        setFeatured(f.data.products);
        setNewArrivals(n.data.products);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = [
    { name: "Dresses",     icon: "👗", color: "from-rose-200 to-pink-200",   q: "Dress"     },
    { name: "Kurtas",      icon: "🥻", color: "from-cream-200 to-amber-100", q: "Kurta"     },
    { name: "Sarees",      icon: "🌺", color: "from-blush-200 to-rose-200",  q: "Saree"     },
    { name: "Co-Ord Sets", icon: "✨", color: "from-pink-100 to-blush-200",  q: "Co-Ord+Set"},
    { name: "Tops",        icon: "👚", color: "from-cream-100 to-rose-100",  q: "Tops"      },
    { name: "Accessories", icon: "💍", color: "from-amber-100 to-cream-200", q: "Accessories"},
  ];

  return (
    <div className="overflow-x-hidden">

      {/* ════════════════════════════════════════════
          HERO SECTION — 3D animated
      ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center bg-hero overflow-hidden pt-20">
        {/* Floating orbs */}
        <Orb className="orb-rose w-96 h-96 -top-20 -left-20 animate-float-slow" />
        <Orb className="orb-pink w-80 h-80 top-1/3 right-0 animate-float" />
        <Orb className="orb-cream w-64 h-64 bottom-10 left-1/4 animate-float-fast" />

        {/* Rotating ring decoration */}
        <div className="absolute top-20 right-10 w-64 h-64 border border-rose-200/40
          rounded-full animate-rotate-slow opacity-60 pointer-events-none" />
        <div className="absolute top-32 right-20 w-40 h-40 border border-blush-200/30
          rounded-full animate-rotate-slow opacity-40 pointer-events-none"
          style={{ animationDirection: "reverse" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20
          grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — Text */}
          <div className="space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm
              border border-rose-200 rounded-full px-4 py-2 text-xs font-medium
              text-rose-600 shadow-rose-sm">
              <span className="animate-pulse-soft">🌸</span>
              New Collection 2025 — Now Live
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light
              leading-tight text-gray-800">
              Soulful Style,
              <br />
              <span className="text-gradient font-semibold italic">Divine Roots</span>
            </h1>

            <p className="font-body text-gray-500 text-lg leading-relaxed max-w-md">
              Inspired by tradition, crafted for today. Discover handpicked Indian
              ethnic wear that speaks to your soul — from breezy kurtas to
              statement sarees.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <button className="btn-primary text-base px-8 py-3.5">
                  Shop Now →
                </button>
              </Link>
              <Link href="/shop?filter=new">
                <button className="btn-outline text-base px-8 py-3.5">
                  New Arrivals ✦
                </button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex gap-8 pt-4">
              {[
                { value: c1,  suffix: "+", label: "Styles"    },
                { value: c2,  suffix: "+", label: "Customers" },
                { value: c3,  suffix: "%", label: "Happy Rate"},
              ].map(({ value, suffix, label }) => (
                <div key={label}>
                  <p className="font-display text-2xl font-semibold text-rose-600">
                    {value.toLocaleString("en-IN")}{suffix}
                  </p>
                  <p className="text-xs text-gray-400 font-body mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — 3D floating product showcase */}
          <div className="relative hidden lg:flex items-center justify-center h-96">
            {/* Main card */}
            <div className="relative z-20 w-64 h-80 rounded-3xl overflow-hidden
              shadow-float animate-float bg-gradient-to-br from-rose-100 to-blush-200
              flex items-center justify-center">
              <span className="text-8xl">👗</span>
              <div className="absolute bottom-0 left-0 right-0 glass-rose p-4">
                <p className="font-display text-sm font-medium text-rose-700">
                  Featured Collection
                </p>
                <p className="font-body text-xs text-rose-500">Starting ₹499</p>
              </div>
            </div>

            {/* Orbiting small cards */}
            {[
              { icon: "🥻", label: "Kurtas",  top: "-10%", left:  "0%",  delay: "1s"   },
              { icon: "💍", label: "Jewellery", top: "60%",  right: "0%", delay: "2.5s" },
              { icon: "🌺", label: "Sarees",  bottom: "0%", left:  "5%", delay: "0.5s" },
            ].map(({ icon, label, delay, ...pos }) => (
              <div key={label}
                className="absolute z-10 w-20 h-20 rounded-2xl glass shadow-rose-sm
                  flex flex-col items-center justify-center gap-1 animate-float-slow
                  border border-rose-100"
                style={{ ...pos, animationDelay: delay }}>
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-body text-rose-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2
          flex flex-col items-center gap-2 animate-bounce-soft">
          <span className="text-xs text-rose-400 font-body">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-rose-300 to-transparent" />
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CATEGORIES STRIP
      ════════════════════════════════════════════ */}
      <section className="section-pad bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-rose-400 text-sm font-medium uppercase tracking-widest mb-2">
              Browse by
            </p>
            <h2 className="font-display text-4xl font-light text-gray-800">
              Shop by <span className="text-gradient font-semibold">Category</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(({ name, icon, color, q }) => (
              <Link key={name} href={`/shop?category=${q}`}>
                <div className={`group bg-gradient-to-br ${color} rounded-3xl p-5
                  flex flex-col items-center gap-3 cursor-pointer
                  hover:-translate-y-2 hover:shadow-rose-md
                  transition-all duration-300 border border-white/50`}>
                  <span className="text-3xl group-hover:scale-125 transition-transform duration-300">
                    {icon}
                  </span>
                  <span className="font-body text-sm font-medium text-gray-700 text-center">
                    {name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURED PRODUCTS
      ════════════════════════════════════════════ */}
      <section className="section-pad bg-section-alt">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-rose-400 text-sm font-medium uppercase tracking-widest mb-2">
                Hand-picked
              </p>
              <h2 className="font-display text-4xl font-light text-gray-800">
                Featured <span className="text-gradient font-semibold">Pieces</span>
              </h2>
            </div>
            <Link href="/shop" className="btn-outline text-sm hidden sm:block">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="rounded-3xl overflow-hidden">
                  <div className="skeleton aspect-[3/4]" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <span className="text-5xl block mb-4">🌸</span>
              <p className="font-display text-xl">Products coming soon</p>
              <p className="text-sm mt-2">Check back after adding products in the admin panel</p>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PROMO BANNER
      ════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-gradient-to-r from-rose-500 via-blush-500 to-rose-400
        relative overflow-hidden">
        <Orb className="orb-cream w-96 h-96 -top-20 -right-20 opacity-20" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-rose-100 text-sm uppercase tracking-widest mb-3">
            Limited Time Offer
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-light text-white mb-4">
            Get <span className="font-bold italic">20% OFF</span> your first order
          </h2>
          <p className="text-rose-100 font-body mb-8 max-w-lg mx-auto">
            Use code <span className="bg-white/20 px-3 py-1 rounded-full font-mono
              text-white font-bold tracking-wider">GOPIKA20</span> at checkout
          </p>
          <Link href="/shop">
            <button className="bg-white text-rose-500 font-medium px-10 py-4
              rounded-full hover:bg-rose-50 hover:-translate-y-1 hover:shadow-lg
              transition-all duration-300">
              Claim Offer →
            </button>
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          NEW ARRIVALS
      ════════════════════════════════════════════ */}
      <section className="section-pad bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-rose-400 text-sm font-medium uppercase tracking-widest mb-2">
                Just dropped
              </p>
              <h2 className="font-display text-4xl font-light text-gray-800">
                New <span className="text-gradient font-semibold">Arrivals</span>
              </h2>
            </div>
            <Link href="/shop?filter=new" className="btn-outline text-sm hidden sm:block">
              See All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="rounded-3xl overflow-hidden">
                  <div className="skeleton aspect-[3/4]" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12 font-display text-xl">
              New arrivals coming soon 🌸
            </p>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          WHY GOPIKA — Features strip
      ════════════════════════════════════════════ */}
      <section className="section-pad bg-gradient-to-b from-cream-50 to-rose-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-light text-gray-800">
              Why <span className="text-gradient font-semibold">Gopika?</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🪡", title: "Handcrafted Quality",    desc: "Every piece made with care and traditional techniques"  },
              { icon: "🚚", title: "Free Shipping ₹500+",    desc: "Pan-India delivery with real-time tracking"             },
              { icon: "↩️",  title: "Easy Returns",           desc: "7-day hassle-free return policy on all orders"         },
              { icon: "🔒", title: "Secure Payments",        desc: "Razorpay encrypted checkout — your data is safe"       },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-3xl glass-rose
                hover:-translate-y-2 hover:shadow-rose-md transition-all duration-300
                border border-rose-100">
                <div className="text-4xl mb-4 animate-pulse-soft">{icon}</div>
                <h3 className="font-display text-base font-semibold text-gray-800 mb-2">{title}</h3>
                <p className="font-body text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════ */}
      <section className="section-pad bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-rose-400 text-sm font-medium uppercase tracking-widest mb-2">
              Loved by
            </p>
            <h2 className="font-display text-4xl font-light text-gray-800">
              Our <span className="text-gradient font-semibold">Customers</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Priya M.",    loc: "Mumbai",    review: "Absolutely love the quality! The kurta I ordered felt so premium and the delivery was super fast.", rating: 5 },
              { name: "Sneha R.",    loc: "Pune",      review: "Finally found a brand that does Indian ethnic wear so elegantly. The co-ord set was perfect for Diwali.", rating: 5 },
              { name: "Anjali K.",   loc: "Bangalore", review: "The saree drape was gorgeous. Gopika's packaging is also so pretty — like a gift to yourself!", rating: 5 },
            ].map(({ name, loc, review, rating }) => (
              <div key={name} className="glass-rose rounded-3xl p-6 border border-rose-100
                hover:shadow-rose-md hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-0.5 mb-3">
                  {Array(rating).fill("★").map((s, i) => (
                    <span key={i} className="star-filled text-sm">{s}</span>
                  ))}
                </div>
                <p className="font-body text-gray-600 text-sm leading-relaxed mb-4 italic">
                  "{review}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br
                    from-rose-300 to-blush-400 flex items-center justify-center
                    text-white font-medium text-sm">
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800">{name}</p>
                    <p className="text-xs text-gray-400">{loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
