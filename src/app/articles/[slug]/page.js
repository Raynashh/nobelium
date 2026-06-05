import Link from "next/link";
import { ArrowLeft, User, Calendar } from "lucide-react";
import connectMongo from "@/lib/mongodb";
import Article from "@/models/Article";
import UserSchema from "@/models/User";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SingleArticle({ params }) {
  await connectMongo();
  
  const resolvedParams = await params;
  
  const article = await Article.findOne({ slug: resolvedParams.slug, isDeleted: { $ne: true } })
    .populate("authorId")
    .lean();

  if (!article) {
    notFound();
  }

  return (
    <article className="container" style={{ paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
        <Link href="/articles" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", fontWeight: "bold", marginBottom: "1rem" }}>
          <ArrowLeft size={16} /> Back to Articles
        </Link>
        <div style={{ marginBottom: "1rem" }}>
          <span className="subject-tag" style={{ position: "static", display: "inline-block" }}>
            {article.subject}
          </span>
        </div>
        <h1 style={{ fontSize: "3rem", color: "var(--foreground)", marginBottom: "1rem" }}>
          {article.title}
        </h1>
        <div style={{ display: "flex", gap: "2rem", color: "var(--foreground)", opacity: 0.8, fontSize: "0.9rem" }}>
          <Link href={`/personal/${article.authorId?._id || "unknown"}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold", color: "var(--primary)" }}>
            <User size={16} /> {article.authorId?.name || "Staff Writer"}
          </Link>
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={16} /> {new Date(article.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {article.headerImageUrl && (
        <div style={{ marginBottom: "2rem" }}>
          <img src={article.headerImageUrl} alt={article.title} style={{ width: "100%", maxHeight: "600px", objectFit: "cover", border: "1px solid var(--border)" }} />
        </div>
      )}

      <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
    </article>
  );
}
