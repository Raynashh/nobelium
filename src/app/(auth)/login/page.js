"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    
    // Force Google Sign-In to prompt for account selection if needed, 
    // or restrict to domain by passing setCustomParameters({ hd: "nobles.edu" })
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();
      
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });
      
      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to create secure session.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: "calc(100vh - 200px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center", border: "1px solid var(--border)", padding: "3rem 2rem", width: "100%", maxWidth: "400px" }}>
        <h1 style={{ marginBottom: "1rem" }}>Author Login</h1>
        <p style={{ marginBottom: "2rem", opacity: 0.8 }}>Sign in with your Google account to access the publishing dashboard.</p>
        
        {error && <p style={{ color: "red", marginBottom: "1.5rem", fontWeight: "bold" }}>{error}</p>}

        <button 
          onClick={handleGoogleLogin} 
          disabled={loading} 
          className="btn btn-primary" 
          style={{ width: "100%", padding: "0.8rem", fontSize: "1.1rem" }}
        >
          {loading ? "Signing In..." : "Sign In with Google"}
        </button>
      </div>
    </div>
  );
}
