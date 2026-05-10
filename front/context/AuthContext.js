"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";

// ─── What is Context? ─────────────────────────────────────────
// React Context lets you share data across your whole app
// without passing props down manually to every component.
// Here: ANY component can call useAuth() to get the current
// user, check if they're logged in, or call login/logout.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading,   setLoading]   = useState(true);  // true while checking localStorage on load

  // ── On app load: restore user from localStorage ─────────────
  // When the user refreshes the page, React state resets.
  // We save the token + user in localStorage so they stay
  // logged in across page refreshes.
  useEffect(() => {
    const token    = localStorage.getItem("gopika_token");
    const savedUser = localStorage.getItem("gopika_user");

    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsLoggedIn(true);
      } catch {
        // If JSON is corrupted, clear it
        localStorage.removeItem("gopika_token");
        localStorage.removeItem("gopika_user");
      }
    }
    setLoading(false);
  }, []);

  // ── LOGIN ────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });

    // Save token + user to localStorage
    localStorage.setItem("gopika_token",  data.token);
    localStorage.setItem("gopika_user",   JSON.stringify(data.user));

    setUser(data.user);
    setIsLoggedIn(true);
    return data;
  };

  // ── REGISTER ─────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });

    localStorage.setItem("gopika_token",  data.token);
    localStorage.setItem("gopika_user",   JSON.stringify(data.user));

    setUser(data.user);
    setIsLoggedIn(true);
    return data;
  };

  // ── LOGOUT ───────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("gopika_token");
    localStorage.removeItem("gopika_user");
    setUser(null);
    setIsLoggedIn(false);
  };

  // ── UPDATE USER (called after profile edit) ──────────────────
  // When the user updates their profile, we refresh the stored
  // user object so the Navbar name updates instantly.
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("gopika_user", JSON.stringify(updatedUser));
  };

  // ── What we expose to all components ─────────────────────────
  const value = {
    user,
    isLoggedIn,
    loading,      // use this to avoid flash of "not logged in" on refresh
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Custom hook — makes usage clean ─────────────────────────
// Instead of: const { user } = useContext(AuthContext)
// You write:  const { user } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
