import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Article from "@/models/Article";
import User from "@/models/User";
import slugify from "slugify";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET(request) {
  try {
    await connectMongo();
    const articles = await Article.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .select("title slug status subject editionId createdAt updatedAt")
      .lean();

    return NextResponse.json({
      articles: articles.map(article => ({
        ...article,
        _id: article._id.toString(),
        editionId: article.editionId?.toString() || "",
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = request.cookies.get("session")?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decodedClaims = await adminAuth.verifySessionCookie(session);

    await connectMongo();
    const user = await User.findOne({ firebaseUid: decodedClaims.uid });
    if (!user) return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    if (user.role !== "Admin" && user.role !== "Editor") {
      return NextResponse.json({ error: "Forbidden: Admins or Editors only" }, { status: 403 });
    }

    const body = await request.json();
    const title = body.title?.trim() || "Untitled Draft";
    const subject = body.subject || "Biology";
    const editionId = body.editionId || undefined;
    const slug = `${slugify(title, { lower: true, strict: true }) || "untitled-draft"}-${Date.now()}`;

    const article = await Article.create({
      title,
      slug,
      content: "<p></p>",
      subject,
      authorId: user._id,
      editionId,
      status: "Draft",
      headerImageUrl: "",
      imageBank: [],
    });

    return NextResponse.json({ success: true, articleSlug: article.slug });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
