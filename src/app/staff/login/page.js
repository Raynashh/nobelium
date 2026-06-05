"use client";

import { useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useToast, ToastContainer } from "@/components/useToast";

export default function StaffLogin() {
  const [loading, setLoading] = useState(false);
  const { toasts, toast } = useToast();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        toast.success("Login successful!");
        window.location.href = "/staff/dashboard"; 
      } else {
        toast.error(data.error || "Login failed");
        auth.signOut();
      }
    } catch (error) {
      toast.error("Google login error.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", background: "#ffffff" }}>
      <ToastContainer toasts={toasts} />
      <div style={{ width: "100%", maxWidth: "400px", padding: "2rem", border: "1px solid var(--border)" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", color: "var(--primary)", textAlign: "center", marginBottom: "1rem" }}>
          Staff Login
        </h1>
        <p style={{ textAlign: "center", marginBottom: "2rem", fontSize: "0.9rem", color: "#000000" }}>
          Sign in using your authorized Google account.
        </p>
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "var(--primary)",
            color: "#ffffff",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
}
