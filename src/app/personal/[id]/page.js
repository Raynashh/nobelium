import ArticleCard from "@/components/ArticleCard";
import { User } from "lucide-react";

export default function AuthorProfile({ params }) {
  const author = {
    name: "Dr. Jane Smith",
    bio: "Senior Biology Editor with a passion for genetics and molecular biology. Jane has been contributing to The Nobleman for 3 years.",
    role: "Editor",
    avatarUrl: ""
  };

  const MOCK_ARTICLES = [
    {
      slug: "the-future-of-crispr",
      title: "The Future of CRISPR in Modern Medicine",
      subject: "Biology",
      content: "CRISPR-Cas9 has revolutionized the way we think about genetic engineering...",
      publishedAt: new Date("2026-05-20"),
      headerImageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200",
      authorId: { name: "Dr. Jane Smith" }
    }
  ];

  return (
    <div className="container" style={{ padding: "4rem 1.5rem" }}>
      <div className="profile-header">
        <div className="avatar-placeholder">
          <User size={64} />
        </div>
        <div className="profile-info">
          <h1>{author.name}</h1>
          <span className="role-badge">{author.role}</span>
          <p>{author.bio}</p>
        </div>
      </div>

      <div style={{ marginTop: "4rem" }}>
        <h2 style={{ marginBottom: "2rem", borderBottom: "2px solid var(--border)", paddingBottom: "1rem" }}>Articles by {author.name}</h2>
        <div className="article-grid">
          {MOCK_ARTICLES.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
