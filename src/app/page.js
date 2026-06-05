import Link from "next/link";
import connectMongo from "@/lib/mongodb";
import Article from "@/models/Article";
import User from "@/models/User";
import Edition from "@/models/Edition";
import HomeRecentStories from "@/components/HomeRecentStories";

export const dynamic = "force-dynamic";

export default async function Home() {
  await connectMongo();
  
  const articlesRaw = await Article.find({ isDeleted: { $ne: true }, status: "Published" })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("authorId")
    .populate("editionId")
    .lean();

  const articles = JSON.parse(JSON.stringify(articlesRaw));

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const recentStories = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="container home-container" style={{ paddingBottom: "4rem" }}>
      <div className="left-column">
        <h2 className="section-title">Recent Stories</h2>
        <HomeRecentStories initialStories={recentStories} />
      </div>
      <div className="right-column">
        {featuredArticle ? (
          <div className="featured-story">
             <div className="featured-image" style={{ position: "relative" }}>
               <span style={{
                 position: "absolute", top: "1rem", left: "1rem", 
                 background: "var(--primary)", color: "var(--primary-foreground)", 
                 padding: "0.2rem 0.5rem", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase"
               }}>
                 {featuredArticle.subject || "Science"}
               </span>
               <Link href={`/articles/${featuredArticle.slug}`}>
                 <img src={featuredArticle.headerImageUrl || "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200"} alt={featuredArticle.title} style={{ display: "block" }} />
               </Link>
             </div>
             <div className="featured-content" style={{ textAlign: "left", padding: "1rem 0" }}>
               <Link href={`/articles/${featuredArticle.slug}`} style={{ textDecoration: "none" }}>
                 <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{featuredArticle.title}</h2>
               </Link>
               <p style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--foreground)" }}>
                 {featuredArticle.content?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&[#A-Za-z0-9]+;/g, '').substring(0, 200)}...
               </p>
               <div className="meta" style={{ fontSize: "0.9rem", borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>
                 <span className="author">
                   {featuredArticle.authorId && featuredArticle.authorId._id ? (
                     <Link href={`/personal/${featuredArticle.authorId._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                       {featuredArticle.authorId.name}
                     </Link>
                   ) : (
                     featuredArticle.authorId?.name || "Staff Writer"
                   )}
                 </span> • {new Date(featuredArticle.publishedAt || (featuredArticle.editionId && featuredArticle.editionId.releaseDate) || featuredArticle.createdAt).toLocaleDateString()}
               </div>
             </div>
          </div>
        ) : (
          <div className="featured-story" style={{ padding: "2rem", textAlign: "center", background: "#f8f9fa", border: "1px dashed var(--border)" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>No Articles Yet</h2>
          </div>
        )}
      </div>
    </div>
  );
}
