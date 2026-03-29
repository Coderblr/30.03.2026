"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import WelcomePage from "./components/WelcomePage";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import Dashboard from "./components/dashboard/Dashboard";
import { styles } from "./styles/AppStyles";

import {
  saveSession,
  clearSession,
  hasSessionFlag,
  updateActivityTimestamp,
} from "./utils/sessionHelper";

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function SBIApp() {
  const [currentPage, setCurrentPage] = useState("welcome");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const inactivityTimer = useRef(null);

  // --- DARK MODE LOGIC ---
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  /* ════════════════════════════════════════
     FETCH USER PROFILE  (cookie-auth)
  ════════════════════════════════════════ */
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/me`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      let userData = {};
      try { userData = await response.json(); } catch { /* ignore */ }

      if (!response.ok || !userData || typeof userData !== "object") return false;

      const fullUser = {
        ...userData,
        userType: Number(userData.userType ?? userData.user_type ?? 0),
      };
      setUser(fullUser);
      setIsLoggedIn(true);
      saveSession(fullUser);
      return true;
    } catch (err) {
      console.error("fetchUserProfile error:", err);
      return false;
    }
  }, [BASE_URL]);

  /* ════════════════════════════════════════
     LOGOUT LOGIC
  ════════════════════════════════════════ */
  const handleLogout = useCallback(async (silent = false) => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

    try {
      await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      if (!silent) console.error("Logout error:", err);
    }

    clearSession();
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage("welcome");
    setShowLogoutModal(false);
  }, [BASE_URL]);

  const confirmLogout = () => setShowLogoutModal(true);

  /* ════════════════════════════════════════
     INACTIVITY TIMER
  ════════════════════════════════════════ */
  const resetInactivityTimer = useCallback(() => {
    updateActivityTimestamp();

    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    inactivityTimer.current = setTimeout(() => {
      console.warn("Session expired due to inactivity.");
      handleLogout(true /* silent */);
      alert("Session expired due to inactivity");
    }, INACTIVITY_TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    if (!isLoggedIn) {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      return;
    }

    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach(ev => window.addEventListener(ev, resetInactivityTimer, { passive: true }));

    resetInactivityTimer();

    return () => {
      events.forEach(ev => window.removeEventListener(ev, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [isLoggedIn, resetInactivityTimer]);

  /* ════════════════════════════════════════
     RESTORE SESSION
  ════════════════════════════════════════ */
  useEffect(() => {
    const restoreSession = async () => {
      if (!hasSessionFlag()) return;

      setLoading(true);
      const ok = await fetchUserProfile();
      if (!ok) {
        clearSession();
      }
      setLoading(false);
    };

    restoreSession();
  }, [fetchUserProfile]);

  /* ════════════════════════════════════════
     LOGIN SUCCESS
  ════════════════════════════════════════ */
  const handleLoginSuccess = useCallback(async () => {
    setLoading(true);
    const ok = await fetchUserProfile();
    if (!ok) {
      clearSession();
    }
    setLoading(false);
  }, [fetchUserProfile]);

  /* ════════════════════════════════════════
     RENDER LOGIC
  ════════════════════════════════════════ */
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  // Pre-login routing
  if (!isLoggedIn) {
    if (currentPage === "welcome") {
      return <WelcomePage onNavigate={setCurrentPage} />;
    }
    if (currentPage === "login") {
      return (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigate={setCurrentPage}
        />
      );
    }
    if (currentPage === "register") {
      return <RegisterPage onNavigate={setCurrentPage} />;
    }
  }

  // Post-login routing
  if (isLoggedIn && user) {
    return (
      <div style={{ position: "relative", minHeight: "100vh" }}>
        <Dashboard
          user={user}
          onLogout={confirmLogout}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />

        {/* LOGOUT CONFIRMATION MODAL */}
        {showLogoutModal && (
          <div style={modalOverlay}>
            <div style={modalCard}>
              <h3 style={{ marginBottom: "12px", color: "var(--foreground)", fontSize: "20px", fontWeight: "700" }}>
                Confirm Logout
              </h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "24px", fontSize: "15px" }}>
                Are you sure you want to end your session?
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={cancelBtn}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleLogout()}
                  style={logoutBtn}
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback
  return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading...</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   MODAL STYLES
───────────────────────────────────────── */
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
};

const modalCard = {
  background: "var(--card-bg)",
  padding: "32px",
  borderRadius: "16px",
  width: "90%",
  maxWidth: "400px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  border: "1px solid var(--border-color)",
};

const cancelBtn = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "1px solid var(--border-color)",
  background: "transparent",
  color: "var(--foreground)",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  transition: "all 0.2s ease",
};

const logoutBtn = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  background: "#ef4444",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  transition: "all 0.2s ease",
};
