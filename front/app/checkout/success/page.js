"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import api from "@/lib/axios";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [order, setOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setErrorMsg("Missing Stripe checkout session ID.");
      return;
    }

    const confirmPayment = async () => {
      try {
        const { data } = await api.post("/payment/confirm-payment", {
          sessionId,
        });

        if (data.success) {
          setOrder(data.order);
          await clearCart();
          setStatus("success");
        } else {
          throw new Error(data.message || "Failed to confirm payment");
        }
      } catch (err) {
        console.error("Confirmation Error:", err);
        setStatus("error");
        setErrorMsg(err.response?.data?.message || err.message || "Something went wrong verifying payment.");
      }
    };

    confirmPayment();
  }, [sessionId, clearCart]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 pt-20">
        <div className="text-center glass rounded-3xl p-10 sm:p-14 max-w-md w-full shadow-card-3d border border-rose-100 animate-pulse">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="font-display text-2xl text-gray-800 mb-2">Verifying Payment</h2>
          <p className="text-gray-400 font-body text-sm">
            Please wait while we secure your payment and generate your order...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 pt-20">
        <div className="text-center glass rounded-3xl p-10 sm:p-14 max-w-md w-full shadow-card-3d border border-rose-100">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-4xl font-bold">✕</span>
          </div>
          <h1 className="font-display text-2xl text-gray-800 mb-2">Verification Failed</h1>
          <p className="text-rose-500 font-body text-sm mb-6 font-medium">{errorMsg}</p>
          <div className="flex flex-col gap-3">
            <Link href="/checkout" className="btn-primary">
              Return to Checkout
            </Link>
            <Link href="/contact" className="btn-outline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 pt-20">
      <div className="text-center glass rounded-3xl p-10 sm:p-14 max-w-md w-full shadow-card-3d border border-rose-100 animate-scale-in">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-soft">
          <span className="text-white text-4xl">✓</span>
        </div>
        <h1 className="font-display text-3xl text-gray-800 mb-2">Order Confirmed! 🌸</h1>
        <p className="text-gray-400 font-body text-sm mb-6">
          Thank you for shopping with Gopika. Your payment has been verified, and your order is now processing.
        </p>

        {order?._id && (
          <div className="bg-rose-50 rounded-xl px-4 py-3 mb-6 border border-rose-100">
            <p className="text-xs text-rose-400 mb-1">Order ID</p>
            <p className="font-mono text-xs text-rose-600 break-all">{order._id}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button onClick={() => router.push("/orders")} className="btn-primary">
            View My Orders →
          </button>
          <button onClick={() => router.push("/shop")} className="btn-outline">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 pt-20">
          <div className="text-center glass rounded-3xl p-10 sm:p-14 max-w-md w-full shadow-card-3d border border-rose-100 animate-pulse">
            <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="font-display text-2xl text-gray-800 mb-2">Loading</h2>
            <p className="text-gray-400 font-body text-sm">Preparing verification environment...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
