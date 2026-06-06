"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 pt-20">
      <div className="text-center glass rounded-3xl p-10 sm:p-14 max-w-md w-full shadow-card-3d border border-rose-100 animate-scale-in">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-white text-4xl font-bold">✕</span>
        </div>
        <h1 className="font-display text-2xl text-gray-800 mb-2">Payment Cancelled</h1>
        <p className="text-gray-400 font-body text-sm mb-6">
          Your payment was not completed. No charges were made, and your cart items are still saved.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/checkout" className="btn-primary">
            Try Checkout Again
          </Link>
          <Link href="/cart" className="btn-outline">
            Return to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
