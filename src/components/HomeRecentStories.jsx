"use client";

import { useState } from "react";
import Link from "next/link";
import { getMoreArticles } from "@/app/actions/articles";

export default function HomeRecentStories({ initialStories }) {
  const [stories, setStories] = useState(initialStories);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialStories.length >= 9);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      // 1 featured article + current number of recent stories
      const skipCount = 1 + stories.length;
      const newStories = await getMoreArticles(skipCount, 10);
      
      if (newStories.length < 10) {
        setHasMore(false);
      }
      
      setStories((prev) => [...prev, ...newStories]);
    } catch (error) {
      console.error("Failed to load more stories:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="recent-list">
        {stories.length === 0 && <p style={{color: '#666'}}>No recent stories to display.</p>}
        {stories.map((story) => (
          <div className="recent-story" key={story.slug}>
            <div className="recent-image" style={{ position: "relative" }}>
              <span style={{
                 position: "absolute", top: "0.5rem", left: "0.5rem", 
                 background: "var(--primary)", color: "var(--primary-foreground)", 
                 padding: "0.2rem 0.5rem", fontSize: "0.7rem", fontWeight: "bold", textTransform: "uppercase"
               }}>
                 {story.subject || "Science"}
              </span>
              <img src={story.headerImageUrl || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400"} alt={story.title} style={{ display: "block" }} />
            </div>
            <div className="recent-content">
              <h3 style={{ textTransform: "uppercase", marginBottom: "0.5rem" }}><Link href={`/articles/${story.slug}`}>{story.title}</Link></h3>
              <p style={{ fontSize: "0.95rem", marginBottom: "0.5rem", color: "var(--foreground)" }}>
                {story.content?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&[#A-Za-z0-9]+;/g, '').substring(0, 120)}...
              </p>
              <div className="meta">
                <span className="author">
                  {story.authorId && story.authorId._id ? (
                    <Link href={`/personal/${story.authorId._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {story.authorId.name}
                    </Link>
                  ) : (
                    story.authorId?.name || "Staff Writer"
                  )}
                </span> • {new Date(story.publishedAt || (story.editionId && story.editionId.releaseDate) || story.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div style={{ padding: "2rem 0", display: "flex", justifyContent: "center", width: "100%" }}>
          <button 
            onClick={loadMore} 
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#ffffff",
              color: "var(--primary, #004990)",
              border: "1px solid var(--border, #ccc)",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.background = "var(--accent-yellow, #FFD100)";
                e.target.style.color = "#000000";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.background = "#ffffff";
                e.target.style.color = "var(--primary, #004990)";
              }
            }}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </>
  );
}
