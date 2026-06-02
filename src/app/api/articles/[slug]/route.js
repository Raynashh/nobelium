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
    if (!user || (user.role !== "Admin" && user.role !== "Editor")) {
      return NextResponse.json({ error: "Forbidden: Admins or Editors only" }, { status: 403 });
    }

    // Using await for params is safe for Next.js 15
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const body = await request.json();
    
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
    if (!user || (user.role !== "Admin" && user.role !== "Editor")) {
      return NextResponse.json({ error: "Forbidden: Admins or Editors only" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { slug } = resolvedParams;

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
