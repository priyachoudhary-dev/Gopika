"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart }   from "@/context/CartContext";
import { useAuth }   from "@/context/AuthContext";
import api           from "@/lib/axios";

// ── Load Razorpay script dynamically ────────────────────────
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script   = document.createElement("script");
    script.src     = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, isLoggedIn }                = useAuth();
  const router                              = useRouter();
  const [step, setStep]     = useState(1);   // 1=address, 2=review, 3=done
  const [paying, setPaying] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const shipping   = cartTotal >= 500 ? 0 : 60;
  const grandTotal = cartTotal + shipping;

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone:    user?.phone || "",
    street:   user?.address?.street || "",
    city:     user?.address?.city   || "",
    state:    user?.address?.state  || "",
    pincode:  user?.address?.pincode|| "",
  });

  const [addrErrors, setAddrErrors] = useState({});

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
    if (cartItems.length === 0 && step !== 3) router.push("/cart");
  }, [isLoggedIn, cartItems, step, router]);

  // ── Validate address fields ──────────────────────────────
  const validateAddress = () => {
    const errs = {};
    if (!address.fullName.trim()) errs.fullName = "Full name is required";
    if (!address.phone.trim() || !/^[6-9]\d{9}$/.test(address.phone))
      errs.phone = "Valid 10-digit Indian phone number required";
    if (!address.street.trim()) errs.street = "Street address is required";
    if (!address.city.trim())   errs.city   = "City is required";
    if (!address.state.trim())  errs.state  = "State is required";
    if (!address.pincode.trim() || !/^\d{6}$/.test(address.pincode))
      errs.pincode = "Valid 6-digit pincode required";
    setAddrErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Step 1 → Step 2 ─────────────────────────────────────
  const handleAddressNext = (e) => {
    e.preventDefault();
    if (validateAddress()) setStep(2);
  };

  // ── Razorpay payment flow ────────────────────────────────
  const handlePayment = async () => {
    setPaying(true);
    try {
      // Step 1: Load Razorpay checkout script
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay failed to load. Check your internet.");

      // Step 2: Create order on our backend (gets Razorpay order ID)
      const { data: rzpOrder } = await api.post("/payment/create-order", {
        amount: grandTotal,
      });

      // Step 3: Open Razorpay popup
      const options = {
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      rzpOrder.amount,
        currency:    rzpOrder.currency,
        name:        "Gopika",
        description: "Soulful Style, Divine Roots",
        order_id:    rzpOrder.orderId,
        prefill: {
          name:    address.fullName,
          contact: address.phone,
          email:   user?.email || "",
        },
        theme: { color: "#f43f5e" },

        // ── Called on successful payment ──────────────────
        handler: async (response) => {
          try {
            // Step 4: Verify signature on our backend
            await api.post("/payment/verify", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });

            // Step 5: Save order to our DB
            const orderItems = cartItems.map((item) => ({
              product:  item.product._id,
              name:     item.product.name,
              image:    item.product.images?.[0]?.url || "",
              price:    item.price,
              size:     item.size,
              quantity: item.quantity,
            }));

            const { data } = await api.post("/orders", {
              orderItems,
              shippingAddress:   address,
              itemsPrice:        cartTotal,
              shippingPrice:     shipping,
              taxPrice:          0,
              totalPrice:        grandTotal,
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            setOrderId(data.order._id);
            await clearCart();
            setStep(3); // show success screen
          } catch (err) {
            alert("Payment verified but order saving failed. Contact support.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      alert(err.message || "Payment initiation failed");
    } finally {
      setPaying(false);
    }
  };

  // ── Step 3: Success screen ───────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center px-4 pt-20">
        <div className="text-center glass rounded-3xl p-10 sm:p-14 max-w-md w-full
          shadow-card-3d border border-rose-100 animate-scale-in">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500
            rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg
            animate-bounce-soft">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="font-display text-3xl text-gray-800 mb-2">
            Order Placed! 🌸
          </h1>
          <p className="text-gray-400 font-body text-sm mb-6">
            Thank you for shopping with Gopika. Your order is confirmed and
            being processed.
          </p>
          {orderId && (
            <div className="bg-rose-50 rounded-xl px-4 py-3 mb-6 border border-rose-100">
              <p className="text-xs text-rose-400 mb-1">Order ID</p>
              <p className="font-mono text-xs text-rose-600 break-all">{orderId}</p>
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

  return (
    <div className="min-h-screen bg-cream-50 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Progress bar */}
        <div className="flex items-center gap-4 mb-10">
          {["Address", "Review", "Payment"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                text-sm font-medium transition-all duration-300
                ${step > i + 1
                  ? "bg-green-400 text-white"
                  : step === i + 1
                  ? "bg-rose-500 text-white shadow-rose-sm"
                  : "bg-rose-100 text-rose-300"}`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`text-sm font-body hidden sm:block transition-colors
                ${step === i + 1 ? "text-rose-600 font-medium" : "text-gray-400"}`}>
                {label}
              </span>
              {i < 2 && <div className={`h-px flex-1 w-8 sm:w-16 transition-colors
                ${step > i + 1 ? "bg-green-300" : "bg-rose-100"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Left: Steps ── */}
          <div className="lg:col-span-2">

            {/* STEP 1: Address */}
            {step === 1 && (
              <div className="glass rounded-2xl p-6 sm:p-8 border border-rose-100
                animate-fade-up">
                <h2 className="font-display text-2xl text-gray-800 mb-6">
                  Delivery Address
                </h2>
                <form onSubmit={handleAddressNext} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        Full Name *
                      </label>
                      <input className="input-rose" value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        placeholder="As on delivery" />
                      {addrErrors.fullName && (
                        <p className="text-red-400 text-xs mt-1">{addrErrors.fullName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        Phone Number *
                      </label>
                      <input className="input-rose" value={address.phone} type="tel"
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        placeholder="10-digit mobile number" />
                      {addrErrors.phone && (
                        <p className="text-red-400 text-xs mt-1">{addrErrors.phone}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Street Address *
                    </label>
                    <input className="input-rose" value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="Flat / House No., Street, Locality" />
                    {addrErrors.street && (
                      <p className="text-red-400 text-xs mt-1">{addrErrors.street}</p>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        City *
                      </label>
                      <input className="input-rose" value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="Mumbai" />
                      {addrErrors.city && (
                        <p className="text-red-400 text-xs mt-1">{addrErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        State *
                      </label>
                      <input className="input-rose" value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        placeholder="Maharashtra" />
                      {addrErrors.state && (
                        <p className="text-red-400 text-xs mt-1">{addrErrors.state}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        Pincode *
                      </label>
                      <input className="input-rose" value={address.pincode} maxLength={6}
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                        placeholder="400097" />
                      {addrErrors.pincode && (
                        <p className="text-red-400 text-xs mt-1">{addrErrors.pincode}</p>
                      )}
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3.5 mt-2">
                    Continue to Review →
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: Review + Pay */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-up">
                {/* Address summary */}
                <div className="glass rounded-2xl p-5 border border-rose-100">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-display text-lg text-gray-800">
                      Delivery to
                    </h3>
                    <button onClick={() => setStep(1)}
                      className="text-rose-400 text-sm hover:text-rose-600 underline-animate">
                      Edit
                    </button>
                  </div>
                  <p className="font-medium text-gray-700 text-sm">{address.fullName}</p>
                  <p className="text-gray-500 text-sm">{address.phone}</p>
                  <p className="text-gray-500 text-sm">
                    {address.street}, {address.city}, {address.state} — {address.pincode}
                  </p>
                </div>

                {/* Items */}
                <div className="glass rounded-2xl p-5 border border-rose-100">
                  <h3 className="font-display text-lg text-gray-800 mb-4">
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex justify-between items-center
                        text-sm border-b border-rose-50 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium text-gray-700">
                            {item.product?.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Size: {item.size} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-gray-700">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handlePayment} disabled={paying}
                  className="btn-primary w-full py-4 text-base disabled:opacity-70">
                  {paying
                    ? "Opening Payment..."
                    : `Pay ₹${grandTotal.toLocaleString("en-IN")} via Razorpay 🔒`}
                </button>
                <p className="text-center text-xs text-gray-400">
                  Secured by Razorpay • 256-bit SSL encrypted
                </p>
              </div>
            )}
          </div>

          {/* ── Order Summary Sidebar ── */}
          <div>
            <div className="glass-rose rounded-2xl p-5 border border-rose-100 sticky top-24">
              <h3 className="font-display text-lg text-gray-800 mb-4">Price Details</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({cartItems.length})</span>
                  <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-500" : ""}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                <div className="border-t border-rose-200 pt-2.5 flex justify-between
                  font-semibold text-gray-800 text-base">
                  <span>Total</span>
                  <span className="text-rose-600">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
