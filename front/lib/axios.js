import axios from "axios";

// ─── What this file does ──────────────────────────────────────
// Instead of writing the full URL in every API call like:
//   fetch("http://localhost:5000/api/products")
// We create ONE axios instance here with the base URL set.
// Then every page just does: api.get("/products")
// If the backend URL ever changes, you only update it here.

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor ──────────────────────────────────────
// This runs BEFORE every single request is sent.
// It automatically attaches the JWT token to every request
// so protected routes like /api/cart, /api/orders work.
// The token is read from localStorage where it was saved on login.

api.interceptors.request.use(
  (config) => {
    // Only runs in the browser (not during Next.js server-side rendering)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("gopika_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────
// This runs AFTER every response comes back.
// If the server returns 401 (Unauthorized / token expired),
// we automatically clear localStorage and redirect to login.

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      localStorage.removeItem("gopika_token");
      localStorage.removeItem("gopika_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
