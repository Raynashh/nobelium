import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Article from "@/models/Article";
import User from "@/models/User";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function PUT(request, { params }) {
  try {
    const session = request.cookies.get("session")?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decodedClaims = await adminAuth.verifySessionCookie(session);
    await connectMongo();
    const user = await User.findOne({ firebaseUid: decodedClaims.uid });
    if (!["Admin", "Subject Editor", "Staff"].includes(user?.role)) {
      return NextResponse.json({ error: "Forbidden: Unauthorized role" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const article = await Article.findOne({ slug });
    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

    if (user.role === "Subject Editor" && (!user.managedSubjects || !user.managedSubjects.includes(article.subject))) {
      return NextResponse.json({ error: "Forbidden: Not assigned to this article's subject" }, { status: 403 });
    }
    if (user.role === "Staff" && article.authorId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden: You can only edit your own articles" }, { status: 403 });
    }

    const body = await request.json();
    if (body.subject && user.role === "Subject Editor" && !user.managedSubjects.includes(body.subject)) {
      return NextResponse.json({ error: "Forbidden: Cannot change to an unmanaged subject" }, { status: 403 });
    }
    
    const updatedArticle = await Article.findOneAndUpdate(
      { slug },
      { $set: body },
      { new: true }
    );

    if (!updatedArticle) return NextResponse.json({ error: "Article not found" }, { status: 404 });

    return NextResponse.json({ success: true, article: updatedArticle }, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error("Save Article Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = request.cookies.get("session")?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decodedClaims = await adminAuth.verifySessionCookie(session);
    await connectMongo();
    const user = await User.findOne({ firebaseUid: decodedClaims.uid });
    if (!["Admin", "Subject Editor", "Staff"].includes(user?.role)) {
      return NextResponse.json({ error: "Forbidden: Unauthorized role" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const article = await Article.findOne({ slug });
    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

    if (user.role === "Subject Editor" && (!user.managedSubjects || !user.managedSubjects.includes(article.subject))) {
      return NextResponse.json({ error: "Forbidden: Not assigned to this article's subject" }, { status: 403 });
    }
    if (user.role === "Staff" && article.authorId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden: You can only delete your own articles" }, { status: 403 });
    }

    const deletedArticle = await Article.findOneAndUpdate(
      { slug },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!deletedArticle) return NextResponse.json({ error: "Article not found" }, { status: 404 });

    return NextResponse.json({ success: true }, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error("Delete Article Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
