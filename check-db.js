const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const ArticleSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
});

const Article = mongoose.models.Article || mongoose.model("Article", ArticleSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const articles = await Article.find().sort({ createdAt: -1 }).limit(1);
  if (articles.length > 0) {
    console.log("Latest Article Slug:", articles[0].slug);
    console.log("Content start:", articles[0].content.substring(0, 500));
    console.log("Has img?", articles[0].content.includes("<img"));
    console.log("Has a href?", articles[0].content.includes("<a href"));
  } else {
    console.log("No articles found");
  }
  process.exit();
}
run();
