"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

// ── Status badge colour ─────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Processing: "bg-amber-50 text-amber-600 border-amber-200",
    Shipped:    "bg-blue-50  text-blue-600  border-blue-200",
    Delivered:  "bg-green-50 text-green-600 border-green-200",
    Cancelled:  "bg-red-50   text-red-500   border-red-200",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${map[status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
      {status}
    </span>
  );
}

// ── Step indicator for order timeline ──────────────────────────
function OrderTimeline({ status }) {
  const steps = ["Processing", "Shipped", "Delivered"];
  const idx = steps.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-3">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`flex flex-col items-center`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
              ${i <= idx
                ? "bg-rose-500 border-rose-500 text-white"
                : "bg-white border-gray-200 text-gray-300"
              }`}>
              {i < idx ? "✓" : i + 1}
            </div>
            <span className={`text-xs mt-1 font-body whitespace-nowrap ${i <= idx ? "text-rose-500" : "text-gray-300"}`}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 w-12 sm:w-20 mx-1 mb-4 transition-all ${i < idx ? "bg-rose-400" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push("/login");
  }, [isLoggedIn, authLoading, router]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetch = async () => {
      try {
        const { data } = await api.get("/orders/my");
        setOrders(data.orders || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isLoggedIn]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center px-4 pt-20">
        <div className="text-center animate-fade-up">
          <span className="text-7xl block mb-6 animate-bounce-soft">📦</span>
          <h2 className="font-display text-3xl font-light text-gray-700 mb-3">No orders yet</h2>
          <p className="text-gray-400 mb-8 font-body">
            Your order history will appear here once you make your first purchase.
          </p>
          <Link href="/shop"><button className="btn-primary">Start Shopping →</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-rose-400 text-xs uppercase tracking-widest mb-1">Your</p>
          <h1 className="font-display text-4xl font-light text-gray-800">
            My <span className="text-gradient font-semibold">Orders</span>
          </h1>
          <p className="text-gray-400 text-sm font-body mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
        </div>

        {/* Orders list */}
        <div className="space-y-4">
          {orders.map((order) => {
            const isOpen = expanded === order._id;
            const date   = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit", month: "short", year: "numeric"
            });
            return (
              <div key={order._id}
                className="glass rounded-2xl border border-rose-100 overflow-hidden
                  hover:shadow-rose-sm transition-shadow duration-200">

                {/* Order header row */}
                <div
                  className="flex flex-wrap items-center justify-between gap-3 p-5 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : order._id)}>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <div>
                      <p className="text-xs text-gray-400 font-body">Order ID</p>
                      <p className="font-mono text-xs text-gray-600 font-medium">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-rose-100" />
                    <div>
                      <p className="text-xs text-gray-400 font-body">Placed on</p>
                      <p className="text-sm text-gray-700 font-medium">{date}</p>
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-rose-100" />
                    <div>
                      <p className="text-xs text-gray-400 font-body">Total</p>
                      <p className="text-sm font-semibold text-rose-600">
                        ₹{order.totalPrice?.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.orderStatus} />
                    <span className={`text-gray-400 transition-transform duration-200 text-lg ${isOpen ? "rotate-180" : ""}`}>
                      ⌄
                    </span>
                  </div>
                </div>

                {/* Expanded details */}
                {isOpen && (
                  <div className="border-t border-rose-100 p-5 animate-fade-in">

                    {/* Timeline */}
                    {order.orderStatus !== "Cancelled" && (
                      <div className="mb-6">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-body">Delivery Progress</p>
                        <OrderTimeline status={order.orderStatus} />
                      </div>
                    )}

                    {/* Items */}
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-body">Items Ordered</p>
                    <div className="space-y-3 mb-5">
                      {order.orderItems?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 glass-rose rounded-xl p-3 border border-rose-100">
                          <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                            👗
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-sm text-gray-800 font-medium truncate">{item.name}</p>
                            <p className="text-xs text-gray-400 font-body">
                              Size: {item.size} · Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-sm text-rose-600 flex-shrink-0">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Shipping address */}
                    {order.shippingAddress && (
                      <div className="glass-rose rounded-xl p-4 border border-rose-100">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-body">Delivery Address</p>
                        <p className="text-sm text-gray-700 font-body">
                          {order.shippingAddress.street}, {order.shippingAddress.city},<br />
                          {order.shippingAddress.state} – {order.shippingAddress.pincode}
                        </p>
                      </div>
                    )}

                    {/* Pricing breakdown */}
                    <div className="mt-4 space-y-1.5 border-t border-rose-100 pt-4">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span>₹{order.itemsPrice?.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Shipping</span>
                        <span className={order.shippingPrice === 0 ? "text-green-500 font-medium" : ""}>
                          {order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-800 pt-1 border-t border-rose-100">
                        <span>Total</span>
                        <span className="text-rose-600">₹{order.totalPrice?.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link href="/shop">
            <button className="btn-outline">Continue Shopping →</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
