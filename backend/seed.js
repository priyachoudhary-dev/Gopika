/**
 * GOPIKA Seed Script — uses picsum.photos (100% reliable, always works)
 * Run: node seed.js
 */
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const dotenv   = require("dotenv");
const Product  = require("./models/Product");
const User     = require("./models/User");
dotenv.config();

// Picsum photos with consistent seeds — always returns the same image
// Format: https://picsum.photos/seed/{word}/700/933  (3:4 portrait ratio)
const img = (seed) => `https://picsum.photos/seed/${seed}/700/933`;

const products = [
  // ── DRESSES ──────────────────────────────────────────────────
  {
    name: "Rani Pink Anarkali Floor Gown",
    description: "Floor-length Anarkali gown in lush rani pink georgette with hand-embroidered silver sequin flowers on the yoke. Flared skirt with layered silhouette, matching organza dupatta with silver lace border. Perfect for weddings and sangeet nights.",
    price: 5499, discountedPrice: 3999, category: "Dress",
    images: [{ public_id: "anarkali", url: img("anarkali-gown") }],
    sizes: ["S","M","L","XL"], colors: ["Rani Pink","Silver"],
    stock: 12, isFeatured: true, isNewArrival: false, rating: 4.8, numReviews: 27,
  },
  {
    name: "Ivory Chanderi Maxi Dress",
    description: "Lightweight ivory Chanderi silk maxi dress with gold zari stripes, empire waist and flutter sleeves. Detachable embroidered belt included. Transitions seamlessly from brunches to evening soirees.",
    price: 3499, discountedPrice: 2699, category: "Dress",
    images: [{ public_id: "ivory_maxi", url: img("ivory-maxi-dress") }],
    sizes: ["XS","S","M","L"], colors: ["Ivory","Gold"],
    stock: 8, isFeatured: true, isNewArrival: true, rating: 4.6, numReviews: 14,
  },
  {
    name: "Terracotta Embroidered Kurti Dress",
    description: "Warm terracotta midi-length kurti dress in viscose rayon with Kutchi embroidery on the bodice. V-neck silhouette with side slits. Pairs equally well with leggings or straight trousers.",
    price: 1999, discountedPrice: 1499, category: "Dress",
    images: [{ public_id: "terracotta_kurti", url: img("terracotta-kurti") }],
    sizes: ["S","M","L","XL"], colors: ["Terracotta","Off-White"],
    stock: 22, isFeatured: false, isNewArrival: true, rating: 4.5, numReviews: 11,
  },

  // ── KURTAS ────────────────────────────────────────────────────
  {
    name: "Chanderi Silk Straight Kurta — Teal",
    description: "Timeless teal straight-cut kurta in pure Chanderi silk with zari border at hem and collar. Mother-of-pearl buttons and matching cotton palazzo included. A wardrobe staple for office or celebrations.",
    price: 2099, discountedPrice: 1599, category: "Kurta",
    images: [{ public_id: "teal_kurta", url: img("chanderi-teal-kurta") }],
    sizes: ["S","M","L","XL","XXL"], colors: ["Teal","Golden Zari"],
    stock: 25, isFeatured: true, isNewArrival: false, rating: 4.7, numReviews: 38,
  },
  {
    name: "Marigold Phulkari Kurta",
    description: "Marigold yellow A-line kurta with authentic Punjabi Phulkari hand-embroidery on the yoke and sleeves. Breathable chanderi cotton, ideal for festive evenings and casual outings.",
    price: 1799, discountedPrice: 1349, category: "Kurta",
    images: [{ public_id: "phulkari", url: img("marigold-phulkari") }],
    sizes: ["S","M","L","XL"], colors: ["Marigold Yellow","Red Phulkari"],
    stock: 20, isFeatured: false, isNewArrival: true, rating: 4.5, numReviews: 12,
  },
  {
    name: "Onyx Black Angrakha Kurta",
    description: "Sophisticated onyx black Angrakha-style kurta in viscose georgette with white thread embroidery and asymmetric tie-up closure. A modern fusion piece bridging heritage and contemporary style.",
    price: 2599, discountedPrice: 0, category: "Kurta",
    images: [{ public_id: "angrakha", url: img("black-angrakha") }],
    sizes: ["XS","S","M","L","XL"], colors: ["Onyx Black","White"],
    stock: 10, isFeatured: true, isNewArrival: true, rating: 4.9, numReviews: 7,
  },

  // ── SAREES ────────────────────────────────────────────────────
  {
    name: "Royal Navy Banarasi Pure Silk Saree",
    description: "Heirloom-worthy Royal Navy Banarasi pure silk saree with traditional gold brocade weave. The pallu features dancing peacock motifs in genuine zari thread. A showstopper for weddings and puja ceremonies.",
    price: 10999, discountedPrice: 8499, category: "Saree",
    images: [{ public_id: "banarasi", url: img("banarasi-navy-saree") }],
    sizes: ["Free Size"], colors: ["Royal Navy","Antique Gold"],
    stock: 4, isFeatured: true, isNewArrival: false, rating: 5.0, numReviews: 21,
  },
  {
    name: "Pistachio Organza Saree — Hand Painted",
    description: "Pistachio green organza saree with artist hand-painted rose and gold floral motifs. Ultra-lightweight with scalloped border. Unstitched blouse piece included. Ships in a Gopika keepsake box.",
    price: 5299, discountedPrice: 3999, category: "Saree",
    images: [{ public_id: "organza_saree", url: img("pistachio-organza") }],
    sizes: ["Free Size"], colors: ["Pistachio Green","Rose Pink"],
    stock: 7, isFeatured: true, isNewArrival: true, rating: 4.9, numReviews: 15,
  },
  {
    name: "Coral Ikkat Linen Saree",
    description: "Coral linen saree with handwoven ikkat checks in ivory thread and minimalist woven border. Machine-washable and breathable — perfect for everyday office wear.",
    price: 2499, discountedPrice: 1899, category: "Saree",
    images: [{ public_id: "coral_linen", url: img("coral-ikkat-linen") }],
    sizes: ["Free Size"], colors: ["Coral","Ivory"],
    stock: 30, isFeatured: false, isNewArrival: false, rating: 4.3, numReviews: 29,
  },

  // ── CO-ORD SETS ───────────────────────────────────────────────
  {
    name: "Blush Linen Co-Ord Set",
    description: "Relaxed-chic blush pink co-ord set in premium Irish linen. Pintuck tunic top pairs with wide-leg trousers. The neutral minimalist palette makes it infinitely versatile.",
    price: 2599, discountedPrice: 1999, category: "Co-Ord Set",
    images: [{ public_id: "blush_coord", url: img("blush-linen-coord") }],
    sizes: ["XS","S","M","L"], colors: ["Blush Pink"],
    stock: 17, isFeatured: true, isNewArrival: true, rating: 4.7, numReviews: 16,
  },
  {
    name: "Sage Green Kurta-Palazzo Co-Ord",
    description: "Sage green kurta with scoop neck and side slits paired with wide-leg palazzo. Block-print floral hem adds artistic detail. 100% pure cotton and lightweight for Indian summers.",
    price: 1999, discountedPrice: 1549, category: "Co-Ord Set",
    images: [{ public_id: "sage_coord", url: img("sage-green-palazzo") }],
    sizes: ["S","M","L","XL","XXL"], colors: ["Sage Green","Off-White"],
    stock: 28, isFeatured: false, isNewArrival: false, rating: 4.5, numReviews: 8,
  },

  // ── LEHENGA ───────────────────────────────────────────────────
  {
    name: "Emerald Raw Silk Lehenga Choli",
    description: "Emerald green lehenga choli in raw silk, heavily embellished with gold zari embroidery, sequins and seed beads. Includes blouse and flowing net dupatta. Size customisation available on request.",
    price: 12999, discountedPrice: 9499, category: "Lehenga",
    images: [{ public_id: "emerald_lehenga", url: img("emerald-silk-lehenga") }],
    sizes: ["S","M","L"], colors: ["Emerald Green","Gold"],
    stock: 3, isFeatured: true, isNewArrival: false, rating: 5.0, numReviews: 8,
  },
  {
    name: "Dusty Rose Jardosi Lehenga",
    description: "Dreamy dusty rose lehenga for pre-wedding functions. Dense jardosi embroidery at the hem, cropped blouse with mirror work and bead fringing. Pure silk lining throughout.",
    price: 8999, discountedPrice: 6799, category: "Lehenga",
    images: [{ public_id: "dusty_rose", url: img("dusty-rose-lehenga") }],
    sizes: ["XS","S","M","L","XL"], colors: ["Dusty Rose","Antique Gold"],
    stock: 6, isFeatured: true, isNewArrival: true, rating: 4.9, numReviews: 5,
  },

  // ── TOPS ──────────────────────────────────────────────────────
  {
    name: "Saffron Kantha Stitch Crop Top",
    description: "Saffron crop top with authentic Kantha embroidery by West Bengal artisans. Hand-spun 100% cotton, boxy relaxed cut. Pairs with palazzos, denim or straight trousers. Fair-trade certified.",
    price: 1099, discountedPrice: 849, category: "Tops",
    images: [{ public_id: "saffron_top", url: img("saffron-kantha-top") }],
    sizes: ["XS","S","M","L"], colors: ["Saffron Orange"],
    stock: 40, isFeatured: false, isNewArrival: true, rating: 4.6, numReviews: 22,
  },
  {
    name: "Sky Blue Bandhani Peplum Top",
    description: "Sky blue peplum top with traditional Rajasthani Bandhani tie-dye. Flounced hem and cinched waist for a universally flattering silhouette. Pair with cigarette pants or a pencil skirt.",
    price: 1399, discountedPrice: 1049, category: "Tops",
    images: [{ public_id: "bandhani_top", url: img("sky-blue-bandhani") }],
    sizes: ["S","M","L","XL"], colors: ["Sky Blue","White Tie-Dye"],
    stock: 25, isFeatured: false, isNewArrival: false, rating: 4.4, numReviews: 18,
  },

  // ── ACCESSORIES ───────────────────────────────────────────────
  {
    name: "Gold Zari Mojari Juttis",
    description: "Hand-stitched Punjabi juttis in genuine leather with gold zari and gota patti embroidery. Crafted by master artisans in Jaipur. Cushioned insole for all-day comfort at weddings.",
    price: 1599, discountedPrice: 1199, category: "Accessories",
    images: [{ public_id: "gold_juttis", url: img("gold-zari-juttis") }],
    sizes: ["Free Size"], colors: ["Gold","Ivory"],
    stock: 45, isFeatured: false, isNewArrival: false, rating: 4.6, numReviews: 36,
  },
  {
    name: "Polki Maang Tikka — Rose Gold",
    description: "Rose gold Maang Tikka with Polki diamond accents and ruby-red meenakari florals. Adjustable chain with secure hook closure. Bridal-grade accessory that transforms any ethnic look.",
    price: 1399, discountedPrice: 1099, category: "Accessories",
    images: [{ public_id: "maang_tikka", url: img("polki-rose-tikka") }],
    sizes: ["Free Size"], colors: ["Rose Gold","Ruby Red"],
    stock: 22, isFeatured: true, isNewArrival: true, rating: 4.8, numReviews: 10,
  },
  {
    name: "Madhubani Painted Jute Potli Bag",
    description: "Handwoven natural jute potli bag individually painted with Madhubani folk art by certified Mithila artists from Bihar. Satin interior lining with golden drawstring. Every bag is one-of-a-kind.",
    price: 999, discountedPrice: 749, category: "Accessories",
    images: [{ public_id: "potli_bag", url: img("madhubani-potli") }],
    sizes: ["Free Size"], colors: ["Natural Jute","Multicolor"],
    stock: 35, isFeatured: false, isNewArrival: true, rating: 4.7, numReviews: 14,
  },
];

const users = [
  { name: "Demo Shopper", email: "demo@gopika.in",  password: "demo1234",  role: "user"  },
  { name: "Gopika Admin", email: "admin@gopika.in", password: "admin1234", role: "admin" },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("❌ MONGODB_URI missing"); process.exit(1); }
  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    await Product.deleteMany({});
    const inserted = await Product.insertMany(products, { ordered: false });
    console.log(`🛍️  ${inserted.length} products seeded`);

    await User.deleteMany({ email: { $in: users.map(u => u.email) } });
    for (const u of users) {
      await User.collection.insertOne({
        ...u, password: await bcrypt.hash(u.password, 10),
        createdAt: new Date(), updatedAt: new Date(),
      });
    }
    console.log("👥 2 demo users seeded");
    console.log("\n🌸 Credentials:");
    console.log("   Shopper → demo@gopika.in  / demo1234");
    console.log("   Admin   → admin@gopika.in / admin1234");
  } catch (e) {
    console.error("❌ Error:", e.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}
seed();
