"use client";

import { useState, useEffect } from "react";
import { useToast, ToastContainer } from "@/components/useToast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function StaffSettings() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toasts, toast } = useToast();

  useEffect(() => {
    // Fetch current user from session / database
    // We can use a new GET endpoint or decode token. For now, fetch from a profile endpoint if it exists
    const fetchProfile = async () => {
      // Create a quick GET method in /api/staff/profile if needed, or we can use another way.
      // Let's assume we add a GET method to /api/staff/profile.
      try {
        const res = await fetch("/api/staff/profile");
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setName(data.user.name || "");
          setPronouns(data.user.pronouns || "");
          setGraduationYear(data.user.graduationYear || "");
          setBio(data.user.bio || "");
          setAvatarUrl(data.user.avatarUrl || "");
        }
      } catch (err) {
        console.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/staff/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pronouns, graduationYear, bio, avatarUrl }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile: " + data.error);
      }
    } catch (err) {
      toast.error("Error saving profile.");
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    try {
      const presignRes = await fetch("/api/upload-avatar/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type || "application/octet-stream" })
      });
      const presignData = await presignRes.json();
      
      if (presignData.success) {
        const uploadRes = await fetch(presignData.presignedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file
        });
        
        if (uploadRes.ok) {
          setAvatarUrl(presignData.publicUrl);
          toast.success("Avatar uploaded! Remember to save.");
        } else {
          toast.error("Failed to upload to storage.");
        }
      } else {
        toast.error("Upload failed: " + presignData.error);
      }
    } catch (err) {
      toast.error("Upload error.");
    }
    setIsUploading(false);
    e.target.value = '';
  };

  if (!user) return <div style={{ padding: "2rem" }}>Loading profile...</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", background: "#ffffff" }}>
      <ToastContainer toasts={toasts} />
      
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/staff/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", fontWeight: "bold" }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <h1 style={{ fontFamily: "var(--font-serif)", color: "var(--primary)", marginBottom: "2rem" }}>
        Profile Settings
      </h1>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        <div style={{ border: "1px solid var(--border)", padding: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#000000" }}>Profile Picture</label>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "#f0f0f0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "#888" }}>No Image</span>
              )}
            </div>
            <div>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} id="avatar-upload" style={{ display: "none" }} />
              <label htmlFor="avatar-upload" style={{ cursor: "pointer", padding: "0.5rem 1rem", border: "1px solid var(--primary)", color: "var(--primary)", display: "inline-block", fontWeight: "bold" }}>
                {isUploading ? "Uploading..." : "Change Picture"}
              </label>
            </div>
          </div>
        </div>

        <div style={{ border: "1px solid var(--border)", padding: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#000000" }}>Name</label>
          <input 
            type="text"
            value={name} 
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border)", fontFamily: "inherit" }}
            placeholder="Your name"
            required
          />
        </div>

        <div style={{ border: "1px solid var(--border)", padding: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#000000" }}>Pronouns</label>
          <input 
            type="text"
            value={pronouns} 
            onChange={(e) => setPronouns(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border)", fontFamily: "inherit" }}
            placeholder="e.g. they/them"
          />
        </div>

        <div style={{ border: "1px solid var(--border)", padding: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#000000" }}>Graduation Year</label>
          <input 
            type="text"
            value={graduationYear} 
            onChange={(e) => setGraduationYear(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border)", fontFamily: "inherit" }}
            placeholder="e.g. 2024"
          />
        </div>

        <div style={{ border: "1px solid var(--border)", padding: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#000000" }}>Biography</label>
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border)", fontFamily: "inherit", resize: "vertical" }}
            placeholder="Tell us about yourself..."
          />
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          style={{ padding: "0.75rem 2rem", background: "var(--primary)", color: "#ffffff", border: "none", fontWeight: "bold", cursor: "pointer", alignSelf: "flex-start" }}
        >
          {isSaving ? "Saving..." : "Save Profile"}
        </button>

      </form>
    </div>
  );
}
