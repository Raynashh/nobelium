"use server";

import connectMongo from "@/lib/mongodb";
import Article from "@/models/Article";
import User from "@/models/User";
import Edition from "@/models/Edition";

export async function getMoreArticles(skip, limit) {
  await connectMongo();
  
  const articles = await Article.find({ isDeleted: { $ne: true }, status: "Published" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("authorId")
    .populate("editionId")
    .lean();

  return JSON.parse(JSON.stringify(articles));
}
