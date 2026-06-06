"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import ProductCard from "@/components/ProductCard";

const CATEGORIES = ["All", "Dress", "Kurta", "Saree", "Co-Ord Set", "Tops", "Lehenga", "Accessories"];
const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First"    },
  { value: "price-asc",  label: "Price: Low → High"},
  { value: "price-desc", label: "Price: High → Low"},
  { value: "rating",     label: "Top Rated"        },
  { value: "popular",    label: "Most Popular"     },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);

  // Filters state — initialized from URL query params
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [sort,     setSort]     = useState(searchParams.get("sort")     || "newest");
  const [search,   setSearch]   = useState(searchParams.get("search")   || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [page,     setPage]     = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Fetch products whenever filters change ──────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== "All") params.set("category", category);
      if (sort)     params.set("sort",     sort);
      if (search)   params.set("search",   search);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      params.set("page",  String(page));
      params.set("limit", "12");

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category, sort, search, minPrice, maxPrice, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [category, sort, search, minPrice, maxPrice]);

  const handleSearchSubmit = (e) => { e.preventDefault(); fetchProducts(); };

  return (
    <div className="min-h-screen bg-cream-50 pt-20">

      {/* ── Page header ── */}
      <div className="bg-gradient-to-r from-rose-50 to-blush-50 border-b border-rose-100
        py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-rose-400 text-xs uppercase tracking-widest mb-1">Explore</p>
          <h1 className="font-display text-4xl font-light text-gray-800">
            Our <span className="text-gradient font-semibold">Collection</span>
          </h1>
          <p className="font-body text-gray-400 text-sm mt-1">
            {total > 0 ? `${total} styles found` : "Discover your next favourite piece"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">

        {/* ── Sidebar Filters ── */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl
          transform transition-transform duration-300 overflow-y-auto pt-20 pb-8 px-6
          lg:relative lg:inset-auto lg:z-auto lg:w-64 lg:shadow-none lg:translate-x-0
          lg:bg-transparent lg:pt-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

          {/* Close button (mobile) */}
          <button onClick={() => setSidebarOpen(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 lg:hidden">
            ✕
          </button>

          <h3 className="font-display text-xl text-gray-700 mb-6">Filters</h3>

          {/* Category */}
          <div className="mb-6">
            <p className="font-body text-xs uppercase tracking-widest text-gray-400 mb-3">
              Category
            </p>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat}
                  onClick={() => { setCategory(cat); setSidebarOpen(false); }}
                  className={`text-left text-sm px-3 py-2 rounded-xl transition-all duration-200
                    ${category === cat
                      ? "bg-rose-500 text-white font-medium shadow-rose-sm"
                      : "text-gray-600 hover:bg-rose-50 hover:text-rose-600"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="mb-6">
            <p className="font-body text-xs uppercase tracking-widest text-gray-400 mb-3">
              Price Range (₹)
            </p>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="input-rose text-sm" />
              <input type="number" placeholder="Max" value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="input-rose text-sm" />
            </div>
          </div>

          {/* Clear filters */}
          <button
            onClick={() => {
              setCategory("All"); setSort("newest");
              setSearch(""); setMinPrice(""); setMaxPrice("");
            }}
            className="w-full text-sm text-rose-400 hover:text-rose-600
              border border-rose-200 rounded-xl py-2 transition-colors">
            Clear All Filters
          </button>
        </aside>

        {/* ── Overlay (mobile) ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Mobile filter toggle */}
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm text-gray-600
                border border-rose-200 rounded-xl px-3 py-2 hover:bg-rose-50">
              <span>⚙️</span> Filters
            </button>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-48">
              <div className="relative">
                <input
                  type="text" value={search} placeholder="Search styles..."
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-rose text-sm pr-10" />
                <button type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400
                    hover:text-rose-600">
                  🔍
                </button>
              </div>
            </form>

            {/* Sort */}
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="input-rose text-sm w-auto cursor-pointer">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Active filters chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {category !== "All" && (
              <span className="flex items-center gap-1 bg-rose-100 text-rose-600
                text-xs px-3 py-1.5 rounded-full">
                {category}
                <button onClick={() => setCategory("All")} className="ml-1 font-bold">×</button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1 bg-rose-100 text-rose-600
                text-xs px-3 py-1.5 rounded-full">
                "{search}"
                <button onClick={() => setSearch("")} className="ml-1 font-bold">×</button>
              </span>
            )}
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="rounded-3xl overflow-hidden">
                  <div className="skeleton aspect-[3/4]" />
                  <div className="p-4 space-y-2 bg-white">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-10 h-10 rounded-full border border-rose-200 text-rose-500
                      hover:bg-rose-50 disabled:opacity-30 transition-colors flex items-center justify-center">
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-full text-sm transition-all duration-200
                        ${page === p
                          ? "bg-rose-500 text-white shadow-rose-sm"
                          : "border border-rose-200 text-rose-500 hover:bg-rose-50"}`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-10 h-10 rounded-full border border-rose-200 text-rose-500
                      hover:bg-rose-50 disabled:opacity-30 transition-colors flex items-center justify-center">
                    ›
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 text-gray-400">
              <span className="text-6xl block mb-4">🌸</span>
              <p className="font-display text-2xl text-gray-500 mb-2">
                No styles found
              </p>
              <p className="text-sm">Try changing your filters or search term</p>
              <button onClick={() => { setCategory("All"); setSearch(""); }}
                className="btn-primary mt-6 text-sm">
                Clear Filters
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream-50 pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="skeleton h-12 w-48 rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden">
                <div className="skeleton aspect-[3/4]" />
                <div className="p-4 space-y-2 bg-white">
                  <div className="skeleton h-3 w-3/4 rounded" />
                  <div className="skeleton h-4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
