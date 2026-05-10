import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title:       "Gopika — Soulful Style, Divine Roots",
  description: "Discover elegant Indian clothing — Dresses, Kurtas, Sarees, Co-Ord Sets and more. Crafted with tradition, styled for today.",
  keywords:    "Gopika, Indian clothing, ethnic wear, kurta, saree, dresses, women fashion",
  openGraph: {
    title:       "Gopika Clothing",
    description: "Soulful Style, Divine Roots",
    type:        "website",
  },
};

// ─── Why this layout structure? ────────────────────────────────
// layout.js in Next.js App Router wraps ALL pages automatically.
// AuthProvider and CartProvider here means every page can access
// user and cart state without importing them individually.
// Navbar and Footer render on every page automatically.

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      </head>
      <body className="font-body bg-cream-50 text-gray-900 min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1 page-enter">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
