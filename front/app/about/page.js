"use client";
// ════════════ ABOUT PAGE ════════════
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-20">

      {/* Hero */}
      <section className="relative bg-hero py-24 px-6 overflow-hidden">
        <div className="orb orb-rose w-96 h-96 -top-20 -right-20 absolute animate-float-slow" />
        <div className="max-w-3xl mx-auto text-center relative z-10 animate-fade-up">
          <p className="text-rose-400 text-xs uppercase tracking-widest mb-3">Our Story</p>
          <h1 className="font-display text-5xl sm:text-6xl font-light text-gray-800 mb-6">
            Behind <span className="text-gradient font-semibold italic">Gopika</span>
          </h1>
          <p className="font-body text-gray-500 text-lg leading-relaxed">
            Named after the eternal companions of Krishna — the Gopis — Gopika is
            a celebration of feminine grace, cultural depth, and timeless style.
            Every stitch carries the spirit of devotion and beauty.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="section-pad bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-light text-gray-800">
              What we <span className="text-gradient font-semibold">stand for</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🪡", title: "Handcrafted Elegance",  desc: "Every piece is designed with artisanal care, blending traditional weaving techniques with contemporary silhouettes." },
              { icon: "🌺", title: "Cultural Roots",         desc: "We draw inspiration from India's rich textile heritage — from Bandhani to Chikankari, worn with modern pride." },
              { icon: "🌱", title: "Conscious Fashion",      desc: "We partner with local weavers and use sustainable fabrics wherever possible, giving back to the communities that inspire us." },
              { icon: "✨", title: "Inclusive Sizing",        desc: "Beauty comes in every size. Our collection goes from XS to XXL because every woman deserves to feel celebrated." },
              { icon: "💛", title: "Made with Love",          desc: "Our team personally curates every design — if it doesn't make us say 'wow', it doesn't make the collection." },
              { icon: "🤝", title: "Community First",         desc: "From Mumbai to the rest of India, Gopika is built on trust, style, and genuine relationships with our customers." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="glass-rose rounded-3xl p-6 border border-rose-100
                hover:-translate-y-2 hover:shadow-rose-md transition-all duration-300">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-display text-lg font-semibold text-gray-800 mb-2">{title}</h3>
                <p className="font-body text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Founder */}
      <section className="section-pad bg-section-alt">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl font-light text-gray-800 mb-12">
            The <span className="text-gradient font-semibold">Founder</span>
          </h2>
          <div className="glass rounded-3xl p-8 sm:p-12 border border-rose-100
            hover:shadow-rose-md transition-shadow duration-300 max-w-xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-rose-300 to-blush-400
              rounded-full mx-auto mb-5 flex items-center justify-center
              text-4xl shadow-rose-md animate-pulse-soft">
              👩
            </div>
            <h3 className="font-display text-2xl text-gray-800 mb-1">Priya Choudhary</h3>
            <p className="text-rose-400 text-sm font-medium mb-4">Founder & Creative Director</p>
            <p className="font-body text-gray-500 text-sm leading-relaxed">
              A fashion enthusiast and full-stack developer from Mumbai, Priya
              started Gopika with a simple belief: Indian women deserve clothing that
              honours their roots while fitting their modern lives perfectly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
