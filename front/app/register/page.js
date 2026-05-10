"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router       = useRouter();
  const [form, setForm]     = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      return setError("Passwords do not match");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center px-4 pt-20">
      <div className="orb orb-rose w-80 h-80 -top-10 -right-10 absolute animate-float" />
      <div className="orb orb-cream w-64 h-64 bottom-10 left-10 absolute animate-float-slow" />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl shadow-card-3d p-8 sm:p-10
          border border-rose-100 animate-scale-in">

          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-blush-500
              rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-rose-md">
              <span className="text-white font-display font-bold text-2xl">G</span>
            </div>
            <h1 className="font-display text-3xl font-light text-gray-800 mb-1">
              Join Gopika
            </h1>
            <p className="text-gray-400 text-sm font-body">
              Create your account and start shopping
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm
              rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Full name
              </label>
              <input
                type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="input-rose"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Email address
              </label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input-rose"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Password
              </label>
              <input
                type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
                className="input-rose"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Confirm password
              </label>
              <input
                type="password" required value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="Repeat your password"
                className="input-rose"
              />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full text-base py-3.5 mt-2 disabled:opacity-70">
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6 font-body">
            Already have an account?{" "}
            <Link href="/login"
              className="text-rose-500 font-medium hover:text-rose-600 underline-animate">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
