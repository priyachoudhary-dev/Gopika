import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-rose-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-rose-600
                rounded-xl flex items-center justify-center shadow-rose-sm">
                <span className="font-display text-white font-semibold text-lg leading-none">G</span>
              </div>
              <span className="font-display text-xl font-semibold text-gray-800">Gopika</span>
            </div>
            <p className="font-body text-sm text-gray-400 leading-relaxed mb-4">
              Soulful Style, Divine Roots. Indian ethnic wear crafted with tradition,
              styled for today.
            </p>
            {/* Social icons as simple text/emoji for now */}
            <div className="flex gap-3">
              {["📸", "📘", "🐦"].map((icon, i) => (
                <div key={i}
                  className="w-9 h-9 bg-rose-50 rounded-full flex items-center
                    justify-center text-sm hover:bg-rose-100 cursor-pointer
                    transition-colors duration-200">
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display text-sm font-semibold text-gray-800 uppercase
              tracking-wider mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "All Products",  href: "/shop"                        },
                { label: "Kurtas",        href: "/shop?category=Kurta"         },
                { label: "Sarees",        href: "/shop?category=Saree"         },
                { label: "Co-Ord Sets",   href: "/shop?category=Co-Ord+Set"    },
                { label: "New Arrivals",  href: "/shop?filter=new"             },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href}
                    className="font-body text-sm text-gray-500 hover:text-rose-500
                      transition-colors duration-200 underline-animate">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-display text-sm font-semibold text-gray-800 uppercase
              tracking-wider mb-4">
              Help
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Contact Us",        href: "/contact"  },
                { label: "About Gopika",      href: "/about"    },
                { label: "My Orders",         href: "/orders"   },
                { label: "My Profile",        href: "/profile"  },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href}
                    className="font-body text-sm text-gray-500 hover:text-rose-500
                      transition-colors duration-200 underline-animate">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-semibold text-gray-800 uppercase
              tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              {[
                { icon: "📍", text: "Malad East, Mumbai, MH 400097" },
                { icon: "📞", text: "+91 8169091679"                },
                { icon: "📧", text: "hello@gopika.in"               },
                { icon: "🕐", text: "Mon–Sun, 8AM – 10PM"          },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-2">
                  <span className="text-sm flex-shrink-0 mt-0.5">{icon}</span>
                  <span className="font-body text-sm text-gray-500">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-rose-100 pt-6 flex flex-col sm:flex-row
          items-center justify-between gap-4">
          <p className="font-body text-xs text-gray-400">
            © {currentYear} Gopika. Made with 🌸 in Mumbai.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-body text-xs text-gray-400">
              Payments secured by
            </span>
            <span className="text-xs font-semibold text-rose-400 border border-rose-200
              rounded-full px-2 py-0.5">
              Razorpay
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
