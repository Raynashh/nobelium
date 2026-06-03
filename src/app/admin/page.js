"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast, ToastContainer } from "@/components/useToast";

const SUBJECTS = [
  "Biology",
  "Chemistry",
  "Physics",
  "Computer Science",
  "Psychology",
  "Environmental Science",
];

const statusColors = {
  Published: "#004990",
  "Pending Review": "#6b5b00",
  Draft: "#666666",
};

export default function AdminDashboard() {
  const [editions, setEditions] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedEdition, setSelectedEdition] = useState("");
  const [newEditionName, setNewEditionName] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualSubject, setManualSubject] = useState("Biology");
  const [importTitle, setImportTitle] = useState("");
  const [importSubject, setImportSubject] = useState("Biology");
  const [htmlZipFile, setHtmlZipFile] = useState(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const { toasts, toast } = useToast();

  useEffect(() => {
    fetch("/api/editions")
      .then(res => res.json())
      .then(data => {
        if (data.editions) {
          setEditions(data.editions);
          if (data.editions.length > 0) setSelectedEdition(data.editions[0]._id);
        }
      });

    fetch("/api/articles")
      .then(res => res.json())
      .then(data => {
        if (data.articles) setArticles(data.articles);
      });
  }, []);

  const selectedEditionName = useMemo(() => {
    return editions.find(edition => edition._id === selectedEdition)?.name || "Selected Edition";
  }, [editions, selectedEdition]);

  const visibleArticles = useMemo(() => {
    if (!selectedEdition) return articles.filter(article => !article.editionId);
    return articles.filter(article => article.editionId === selectedEdition);
  }, [articles, selectedEdition]);

  const articlesBySubject = useMemo(() => {
    const groups = SUBJECTS.map(subject => ({
      subject,
      articles: visibleArticles.filter(article => article.subject === subject),
    }));
    const uncategorized = visibleArticles.filter(article => !SUBJECTS.includes(article.subject));
    if (uncategorized.length > 0) groups.push({ subject: "Uncategorized", articles: uncategorized });
    return groups;
  }, [visibleArticles]);

  const handleCreateEdition = async (e) => {
    e.preventDefault();
    if (!newEditionName.trim()) return;

    const res = await fetch("/api/editions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newEditionName.trim() }),
    });
    const data = await res.json();
    if (data.success) {
      setEditions([data.edition, ...editions]);
      setSelectedEdition(data.edition._id);
      setNewEditionName("");
    } else {
      toast.error("Error: " + data.error);
    }
  };

  const handleCreateManualDraft = async (e) => {
    e.preventDefault();
    if (!selectedEdition) {
      toast.error("Select an edition first.");
      return;
    }

    setIsCreatingDraft(true);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: manualTitle,
          subject: manualSubject,
          editionId: selectedEdition,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/admin/edit/${data.articleSlug}`);
      } else {
        toast.error("Error: " + data.error);
      }
    } catch {
      toast.error("Draft creation failed.");
    } finally {
      setIsCreatingDraft(false);
    }
  };

  const handleHtmlZipUpload = async (e) => {
    e.preventDefault();
    if (!htmlZipFile || !selectedEdition) {
      toast.error("Select a ZIP file and an edition first.");
      return;
    }
    if (!importTitle.trim()) {
      toast.error("Please enter a title for the imported article.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", htmlZipFile);
    formData.append("editionId", selectedEdition);
    formData.append("title", importTitle.trim());
    formData.append("subject", importSubject);

    try {
      const res = await fetch("/api/articles/import-html-zip", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/admin/edit/${data.articleSlug}`);
      } else {
        toast.error("Error: " + data.error);
      }
    } catch {
      toast.error("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} />
      <div className="admin-container" style={{ maxWidth: "1100px" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Admin Dashboard</h1>

      <section style={{ border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "2rem" }}>
        <div className="admin-top-grid">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Select Edition</label>
            <select value={selectedEdition} onChange={e => setSelectedEdition(e.target.value)}>
              {editions.map(edition => (
                <option key={edition._id} value={edition._id}>{edition.name}</option>
              ))}
              {editions.length === 0 && <option value="">Create an edition first...</option>}
            </select>
          </div>

          <form onSubmit={handleCreateEdition} style={{ display: "flex", gap: "0.75rem" }}>
            <input
              value={newEditionName}
              onChange={e => setNewEditionName(e.target.value)}
              placeholder="New Edition Name"
              style={{ flex: 1, padding: "0.5rem", border: "1px solid var(--border)", fontSize: "1rem" }}
            />
            <button type="submit" className="btn btn-primary">Create Edition</button>
          </form>
        </div>
      </section>

      <section style={{ border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
          <h2 style={{ marginBottom: 0 }}>Articles by Category</h2>
          <span style={{ color: "#555", fontSize: "0.95rem" }}>{selectedEditionName}</span>
        </div>

        {visibleArticles.length === 0 ? (
          <p style={{ color: "#555", marginBottom: 0 }}>No articles for this edition yet.</p>
        ) : (
          articlesBySubject.map(group => (
            <div key={group.subject} style={{ marginTop: "1.25rem" }}>
              <h3 style={{ fontSize: "1.2rem", color: "#111111", marginBottom: "0.5rem" }}>
                {group.subject}
                <span style={{ color: "#666", fontFamily: "system-ui, sans-serif", fontSize: "0.9rem", fontWeight: 400, marginLeft: "0.5rem" }}>
                  {group.articles.length}
                </span>
              </h3>

              {group.articles.length === 0 ? (
                <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: 0 }}>No articles marked for this category.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, borderTop: "1px solid var(--border)" }}>
                  {group.articles.map(article => (
                    <li key={article._id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "1rem", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
                      <strong style={{ color: "#111111" }}>{article.title}</strong>
                      <span style={{ color: statusColors[article.status] || "#666666", border: "1px solid var(--border)", padding: "0.2rem 0.45rem", fontSize: "0.8rem" }}>
                        {article.status}
                      </span>
                      <Link href={`/admin/edit/${article.slug}`} className="btn" style={{ padding: "0.35rem 0.8rem", fontSize: "0.9rem", border: "1px solid var(--border)" }}>
                        Edit
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </section>

      <section style={{ border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "1rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Create Article</h2>
        <form onSubmit={handleCreateManualDraft} className="admin-create-grid">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Title</label>
            <input value={manualTitle} onChange={e => setManualTitle(e.target.value)} placeholder="Untitled Draft" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Category</label>
            <select value={manualSubject} onChange={e => setManualSubject(e.target.value)}>
              {SUBJECTS.map(subject => <option key={subject} value={subject}>{subject}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={isCreatingDraft || !selectedEdition}>
            {isCreatingDraft ? "Creating..." : "Create Blank Draft"}
          </button>
        </form>
      </section>

      <section style={{ border: "1px solid var(--border)", padding: "1.5rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Automated ZIP Import</h2>
        <form onSubmit={handleHtmlZipUpload} className="admin-import-grid">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Imported Title</label>
            <input value={importTitle} onChange={e => setImportTitle(e.target.value)} placeholder="e.g. Why does slang change so fast" required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Category</label>
            <select value={importSubject} onChange={e => setImportSubject(e.target.value)}>
              {SUBJECTS.map(subject => <option key={subject} value={subject}>{subject}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>ZIP File</label>
            <input type="file" accept=".zip" onChange={e => setHtmlZipFile(e.target.files?.[0] || null)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isUploading || !htmlZipFile || !selectedEdition}>
            {isUploading ? "Importing..." : "Upload ZIP"}
          </button>
        </form>
      </section>
    </div>
    </>
  );
}
