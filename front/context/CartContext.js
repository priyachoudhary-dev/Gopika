"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

// ─── What this does ───────────────────────────────────────────
// CartContext manages the cart state globally.
// When user is logged in → cart is fetched from the DB (persists across devices).
// When user logs out → cart state is cleared from memory.
// Components use useCart() to read cart data or call cart actions.

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isLoggedIn, loading: authLoading } = useAuth();

  const [cartItems,   setCartItems]   = useState([]);
  const [cartTotal,   setCartTotal]   = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  // ── Recalculate total whenever cart items change ─────────────
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCartTotal(total);
  };

  // ── Fetch cart from backend ──────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) return;
    setCartLoading(true);
    try {
      const { data } = await api.get("/cart");

      // Backend returns { success, cart } or { success, items: [], totalPrice: 0 }
      const items = data.cart?.items || data.items || [];
      setCartItems(items);
      calculateTotal(items);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setCartItems([]);
      setCartTotal(0);
    } finally {
      setCartLoading(false);
    }
  }, [isLoggedIn]);

  // ── Fetch cart when user logs in, clear when logs out ────────
  useEffect(() => {
    if (!authLoading) {
      if (isLoggedIn) {
        fetchCart();
      } else {
        setCartItems([]);
        setCartTotal(0);
      }
    }
  }, [isLoggedIn, authLoading, fetchCart]);

  // ── Add item to cart ─────────────────────────────────────────
  // productId = the MongoDB _id of the product
  // size      = selected size string e.g. "M" or "Free Size"
  // quantity  = how many to add (default 1)
  const addToCart = async (productId, size = "Free Size", quantity = 1) => {
    try {
      const { data } = await api.post("/cart", { productId, size, quantity });
      const items = data.cart?.items || [];
      setCartItems(items);
      calculateTotal(items);
      return { success: true };
    } catch (err) {
      console.error("Failed to add to cart:", err);
      return { success: false, message: err.response?.data?.message || "Failed to add to cart" };
    }
  };

  // ── Update quantity ──────────────────────────────────────────
  // itemId   = the cart item's sub-document _id (NOT the product _id)
  // quantity = new quantity (if 0 or less, item is removed by backend)
  const updateQuantity = async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      const items = data.cart?.items || [];
      setCartItems(items);
      calculateTotal(items);
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  // ── Remove item ──────────────────────────────────────────────
  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      // Optimistic UI update: remove from local state immediately
      const updated = cartItems.filter((item) => item._id !== itemId);
      setCartItems(updated);
      calculateTotal(updated);
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    }
  };

  // ── Clear entire cart ────────────────────────────────────────
  // Called after successful order placement
  const clearCart = async () => {
    try {
      await api.delete("/cart");
      setCartItems([]);
      setCartTotal(0);
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  // ── Total item count (for Navbar badge) ─────────────────────
  // e.g. 2 items of qty 3 + 1 item of qty 2 = badge shows 5
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    cartItems,
    cartTotal,
    cartLoading,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
