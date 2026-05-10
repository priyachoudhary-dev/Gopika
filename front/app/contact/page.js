"use client";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm]     = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState(""); // "sending" | "sent" | "error"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    // In production: call api.post("/contact", form)
    // For now, simulate a delay
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("sent");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-cream-50 pt-20">

      {/* Header */}
      <section className="bg-hero py-16 px-6 text-center relative overflow-hidden">
        <div className="orb orb-rose w-80 h-80 -top-10 -left-10 absolute animate-float" />
        <div className="relative z-10 animate-fade-up">
          <p className="text-rose-400 text-xs uppercase tracking-widest mb-2">Get in touch</p>
          <h1 className="font-display text-5xl font-light text-gray-800">
            Say <span className="text-gradient font-semibold italic">Hello 🌸</span>
          </h1>
          <p className="text-gray-400 font-body mt-3">
            We'd love to hear from you — questions, feedback, or just a hello!
          </p>
        </div>
      </section>

      <section className="section-pad px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12">

          {/* Info */}
          <div className="space-y-6">
            <h2 className="font-display text-3xl font-light text-gray-800">
              We're here for you
            </h2>
            <p className="font-body text-gray-500 leading-relaxed">
              Whether you have a question about your order, want to collaborate,
              or just want to share how much you love your new outfit — we're
              listening.
            </p>
            {[
              { icon: "📍", label: "Address",       value: "Malad East, Mumbai, Maharashtra 400097" },
              { icon: "📞", label: "Phone",         value: "+91 8169091679"                          },
              { icon: "📧", label: "Email",         value: "hello@gopika.in"                         },
              { icon: "🕐", label: "Working Hours", value: "Mon–Sun, 8:00 AM – 10:00 PM"             },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 glass-rose rounded-2xl
                p-4 border border-rose-100 hover:shadow-rose-sm transition-shadow">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center
                  justify-center text-lg flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-xs text-rose-400 font-medium uppercase tracking-wider mb-0.5">
                    {label}
                  </p>
                  <p className="text-gray-700 text-sm font-body">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="glass rounded-3xl p-7 sm:p-8 border border-rose-100
            shadow-card-3d animate-scale-in">
            {status === "sent" ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4 animate-bounce-soft">🌸</div>
                <h3 className="font-display text-2xl text-gray-800 mb-2">
                  Message Sent!
                </h3>
                <p className="text-gray-400 text-sm">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button onClick={() => setStatus("")}
                  className="btn-outline mt-6 text-sm">
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl text-gray-800 mb-6">
                  Send a message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        Your name
                      </label>
                      <input className="input-rose" required value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Full name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        Email address
                      </label>
                      <input className="input-rose" type="email" required value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Subject
                    </label>
                    <input className="input-rose" required value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="Order query / General question" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Message
                    </label>
                    <textarea className="input-rose resize-none" rows={5} required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us how we can help you..." />
                  </div>
                  <button type="submit" disabled={status === "sending"}
                    className="btn-primary w-full py-3.5 disabled:opacity-70">
                    {status === "sending" ? "Sending..." : "Send Message 🌸"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
