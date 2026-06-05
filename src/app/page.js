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
             <Link href={`/articles/${featuredArticle.slug}`}>
              <div className="featured-image">
                <img src={featuredArticle.headerImageUrl || "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200"} alt={featuredArticle.title} />
              </div>
              <div className="featured-content">
                <h2>{featuredArticle.title}</h2>
              </div>
            </Link>
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
