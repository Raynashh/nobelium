import mongoose from "mongoose";
import path from "path";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables.");
}

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://nobelium.cdn.ddbrother.me";

const ArticleSchema = new mongoose.Schema({
  content: String,
  headerImageUrl: String,
  imageBank: [String],
}, { strict: false }); // strict: false allows us to just query and save what we need

const Article = mongoose.models.Article || mongoose.model("Article", ArticleSchema);

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const articles = await Article.find({});
    let updatedCount = 0;

    for (const article of articles) {
      let isModified = false;

      // 1. Update HTML content
      if (article.content && article.content.includes("/api/uploads/")) {
        // Regex to replace all instances of /api/uploads/ with the CDN URL
        article.content = article.content.replace(/\/api\/uploads\//g, `${R2_PUBLIC_URL}/uploads/`);
        isModified = true;
      }

      // 2. Update headerImageUrl
      if (article.headerImageUrl && article.headerImageUrl.startsWith("/api/uploads/")) {
        article.headerImageUrl = article.headerImageUrl.replace("/api/uploads/", `${R2_PUBLIC_URL}/uploads/`);
        isModified = true;
      }

      // 3. Update imageBank array
      if (article.imageBank && article.imageBank.length > 0) {
        const newImageBank = article.imageBank.map(url => {
          if (url.startsWith("/api/uploads/")) {
            return url.replace("/api/uploads/", `${R2_PUBLIC_URL}/uploads/`);
          }
          return url;
        });
        
        // Check if any element actually changed
        if (JSON.stringify(article.imageBank) !== JSON.stringify(newImageBank)) {
          article.imageBank = newImageBank;
          isModified = true;
        }
      }

      if (isModified) {
        // Mark fields as modified in case mongoose doesn't detect it automatically for mixed arrays
        article.markModified('content');
        article.markModified('headerImageUrl');
        article.markModified('imageBank');
        await article.save();
        updatedCount++;
        console.log(`Updated Article ID: ${article._id}`);
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} articles.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
