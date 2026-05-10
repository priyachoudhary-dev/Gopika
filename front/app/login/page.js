"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login }  = useAuth();
  const router     = useRouter();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center px-4 pt-20">
      {/* Background orbs */}
      <div className="orb orb-rose w-80 h-80 -top-10 -left-10 absolute animate-float-slow" />
      <div className="orb orb-pink w-64 h-64 bottom-10 right-10 absolute animate-float" />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl shadow-card-3d p-8 sm:p-10
          border border-rose-100 animate-scale-in">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-blush-500
              rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-rose-md">
              <span className="text-white font-display font-bold text-2xl">G</span>
            </div>
            <h1 className="font-display text-3xl font-light text-gray-800 mb-1">
              Welcome back
            </h1>
            <p className="text-gray-400 text-sm font-body">
              Sign in to your Gopika account
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
                placeholder="••••••••"
                className="input-rose"
              />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full text-base py-3.5 mt-2 disabled:opacity-70">
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6 font-body">
            Don&apos;t have an account?{" "}
            <Link href="/register"
              className="text-rose-500 font-medium hover:text-rose-600 underline-animate">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
