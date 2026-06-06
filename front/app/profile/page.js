"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

export default function ProfilePage() {
  const { user, isLoggedIn, loading: authLoading, updateUser, logout } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState("details"); // "details" | "address" | "password"
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  // Form state
  const [details, setDetails] = useState({ name: "", phone: "" });
  const [address, setAddress] = useState({ street: "", city: "", state: "", pincode: "" });
  const [pwForm,  setPwForm]  = useState({ current: "", newPw: "", confirm: "" });

  // Pre-fill once user is available
  useEffect(() => {
    if (user) {
      setDetails({ name: user.name || "", phone: user.phone || "" });
      setAddress({
        street:  user.address?.street  || "",
        city:    user.address?.city    || "",
        state:   user.address?.state   || "",
        pincode: user.address?.pincode || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push("/login");
  }, [isLoggedIn, authLoading, router]);

  const clearMessages = () => { setSuccess(""); setError(""); };

  // ── Save profile details ──────────────────────────────────────
  const saveDetails = async (e) => {
    e.preventDefault();
    clearMessages();
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile", details);
      updateUser(data.user);
      setSuccess("Profile updated successfully 🌸");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Save address ──────────────────────────────────────────────
  const saveAddress = async (e) => {
    e.preventDefault();
    clearMessages();
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile", { address });
      updateUser(data.user);
      setSuccess("Address saved successfully 📍");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ───────────────────────────────────────────
  const savePassword = async (e) => {
    e.preventDefault();
    clearMessages();
    if (pwForm.newPw !== pwForm.confirm) {
      setError("New passwords do not match");
      return;
    }
    if (pwForm.newPw.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await api.put("/auth/profile", { password: pwForm.newPw });
      setSuccess("Password changed successfully 🔒");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Password change failed");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="skeleton h-40 rounded-3xl" />
          <div className="skeleton h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "details",  label: "My Details",   icon: "👤" },
    { id: "address",  label: "Address",       icon: "📍" },
    { id: "password", label: "Change Password", icon: "🔒" },
  ];

  return (
    <div className="min-h-screen bg-cream-50 pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <p className="text-rose-400 text-xs uppercase tracking-widest mb-1">Account</p>
          <h1 className="font-display text-4xl font-light text-gray-800">
            My <span className="text-gradient font-semibold">Profile</span>
          </h1>
        </div>

        {/* Avatar card */}
        <div className="glass rounded-3xl p-6 border border-rose-100 shadow-card-3d mb-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-blush-500
            rounded-full flex items-center justify-center text-white text-2xl font-display font-bold
            shadow-rose-md flex-shrink-0 animate-pulse-soft">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-gray-800">{user?.name}</p>
            <p className="font-body text-sm text-gray-400">{user?.email}</p>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 inline-block
              ${user?.role === "admin"
                ? "bg-rose-100 text-rose-600"
                : "bg-green-50 text-green-600"}`}>
              {user?.role === "admin" ? "⚙️ Admin" : "✅ Verified Shopper"}
            </span>
          </div>
        </div>

        {/* Alert messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2 animate-fade-in">
            <span>✅</span> {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2 animate-fade-in">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-rose-100">
          {tabs.map(t => (
            <button key={t.id}
              onClick={() => { setTab(t.id); clearMessages(); }}
              className={`flex-1 text-sm py-2.5 rounded-xl font-medium font-body transition-all duration-200
                flex items-center justify-center gap-1.5
                ${tab === t.id
                  ? "bg-rose-500 text-white shadow-rose-sm"
                  : "text-gray-500 hover:text-rose-500 hover:bg-rose-50"}`}>
              <span className="hidden sm:inline">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-card-3d animate-fade-in">

          {/* ── Details tab ── */}
          {tab === "details" && (
            <form onSubmit={saveDetails} className="space-y-4">
              <h2 className="font-display text-xl text-gray-800 mb-5">Personal Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name</label>
                <input className="input-rose" value={details.name}
                  onChange={e => setDetails({ ...details, name: e.target.value })}
                  placeholder="Your full name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Email Address</label>
                <input className="input-rose opacity-60 cursor-not-allowed" value={user?.email}
                  disabled title="Email cannot be changed" />
                <p className="text-xs text-gray-400 mt-1">Email address cannot be changed.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Phone Number</label>
                <input className="input-rose" value={details.phone}
                  onChange={e => setDetails({ ...details, phone: e.target.value })}
                  placeholder="+91 98765 43210" type="tel" />
              </div>
              <button type="submit" disabled={saving}
                className="btn-primary w-full py-3.5 mt-2 disabled:opacity-70">
                {saving ? "Saving..." : "Save Changes 🌸"}
              </button>
            </form>
          )}

          {/* ── Address tab ── */}
          {tab === "address" && (
            <form onSubmit={saveAddress} className="space-y-4">
              <h2 className="font-display text-xl text-gray-800 mb-5">Delivery Address</h2>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Street / Flat / Area</label>
                <input className="input-rose" value={address.street}
                  onChange={e => setAddress({ ...address, street: e.target.value })}
                  placeholder="123, Rose Apartments, MG Road" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">City</label>
                  <input className="input-rose" value={address.city}
                    onChange={e => setAddress({ ...address, city: e.target.value })}
                    placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">State</label>
                  <input className="input-rose" value={address.state}
                    onChange={e => setAddress({ ...address, state: e.target.value })}
                    placeholder="Maharashtra" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Pincode</label>
                <input className="input-rose" value={address.pincode}
                  onChange={e => setAddress({ ...address, pincode: e.target.value })}
                  placeholder="400 097" maxLength={6} />
              </div>
              <button type="submit" disabled={saving}
                className="btn-primary w-full py-3.5 mt-2 disabled:opacity-70">
                {saving ? "Saving..." : "Save Address 📍"}
              </button>
            </form>
          )}

          {/* ── Password tab ── */}
          {tab === "password" && (
            <form onSubmit={savePassword} className="space-y-4">
              <h2 className="font-display text-xl text-gray-800 mb-5">Change Password</h2>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">New Password</label>
                <input className="input-rose" type="password" value={pwForm.newPw}
                  onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })}
                  placeholder="At least 6 characters" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Confirm New Password</label>
                <input className="input-rose" type="password" value={pwForm.confirm}
                  onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                  placeholder="Repeat new password" required />
              </div>
              <button type="submit" disabled={saving}
                className="btn-primary w-full py-3.5 mt-2 disabled:opacity-70">
                {saving ? "Changing..." : "Change Password 🔒"}
              </button>
            </form>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <a href="/orders"
            className="glass-rose rounded-2xl p-4 border border-rose-100 text-center
              hover:-translate-y-1 hover:shadow-rose-sm transition-all duration-200 cursor-pointer">
            <span className="text-2xl block mb-1">📦</span>
            <p className="font-display text-sm font-medium text-gray-700">My Orders</p>
          </a>
          <a href="/shop"
            className="glass-rose rounded-2xl p-4 border border-rose-100 text-center
              hover:-translate-y-1 hover:shadow-rose-sm transition-all duration-200 cursor-pointer">
            <span className="text-2xl block mb-1">🛍️</span>
            <p className="font-display text-sm font-medium text-gray-700">Shop Now</p>
          </a>
        </div>
      </div>
    </div>
  );
}
