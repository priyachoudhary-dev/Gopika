"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const pathname            = usePathname();
  const router              = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const { cartCount }       = useCart();

  const [scrolled,      setScrolled]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [userMenuOpen,  setUserMenuOpen]  = useState(false);
  const userMenuRef = useRef(null);

  // ── Detect scroll so we can add background to navbar ────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close mobile menu on route change ────────────────────────
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // ── Close user dropdown when clicking outside ────────────────
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navLinks = [
    { href: "/",        label: "Home"    },
    { href: "/shop",    label: "Shop"    },
    { href: "/about",   label: "About"   },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled
            ? "bg-white/90 backdrop-blur-md shadow-rose-sm border-b border-rose-100"
            : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-rose-600
              rounded-xl flex items-center justify-center shadow-rose-sm
              group-hover:scale-105 transition-transform duration-200">
              <span className="font-display text-white font-semibold text-lg leading-none">G</span>
            </div>
            <span className="font-display text-xl font-semibold text-gray-800
              group-hover:text-rose-600 transition-colors duration-200">
              Gopika
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-full text-sm font-medium font-body transition-all duration-200
                  ${isActive(href)
                    ? "bg-rose-50 text-rose-600"
                    : "text-gray-600 hover:text-rose-600 hover:bg-rose-50"
                  }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Right: Cart + User ── */}
          <div className="flex items-center gap-2">

            {/* Cart icon */}
            <Link href="/cart">
              <button
                className="relative w-10 h-10 flex items-center justify-center
                  rounded-full hover:bg-rose-50 transition-colors duration-200"
                aria-label="View cart"
              >
                {/* Simple bag SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                  strokeLinejoin="round" className="text-gray-700">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {/* Cart count badge */}
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5
                    bg-rose-500 text-white text-xs font-bold rounded-full
                    flex items-center justify-center leading-none
                    animate-scale-in">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </Link>

            {/* User section */}
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full
                    hover:bg-rose-50 transition-colors duration-200"
                >
                  {/* Avatar circle with first letter */}
                  <div className="w-7 h-7 bg-gradient-to-br from-rose-400 to-rose-600
                    rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm text-gray-700 font-medium hidden sm:block max-w-[80px] truncate">
                    {user?.name?.split(" ")[0]}
                  </span>
                  {/* Chevron */}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48
                    glass rounded-2xl shadow-card-3d border border-rose-100
                    py-2 animate-scale-in z-50">

                    <div className="px-4 py-2 border-b border-rose-100 mb-1">
                      <p className="text-xs text-gray-400 font-body">Signed in as</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
                    </div>

                    <Link href="/orders"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700
                        hover:bg-rose-50 hover:text-rose-600 transition-colors font-body">
                      <span>📦</span> My Orders
                    </Link>

                    <Link href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700
                        hover:bg-rose-50 hover:text-rose-600 transition-colors font-body">
                      <span>👤</span> My Profile
                    </Link>

                    {/* Show Admin link only for admin role users */}
                    {user?.role === "admin" && (
                      <Link href="/admin"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-rose-600
                          hover:bg-rose-50 transition-colors font-body font-medium">
                        <span>⚙️</span> Admin Panel
                      </Link>
                    )}

                    <div className="border-t border-rose-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm
                          text-red-500 hover:bg-red-50 transition-colors font-body">
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <button className="btn-primary text-sm px-5 py-2">
                  Sign In
                </button>
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5
                rounded-full hover:bg-rose-50 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300
                ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300
                ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300
                ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="md:hidden glass border-t border-rose-100 px-4 py-4
            animate-fade-in space-y-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`block px-4 py-3 rounded-xl text-sm font-medium font-body
                  transition-colors duration-200
                  ${isActive(href)
                    ? "bg-rose-50 text-rose-600"
                    : "text-gray-600 hover:text-rose-600 hover:bg-rose-50"
                  }`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* ── Click-away backdrop for mobile menu ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
