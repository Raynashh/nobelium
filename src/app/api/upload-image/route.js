import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { adminAuth } from "@/lib/firebaseAdmin";
import connectMongo from "@/lib/mongodb";

export async function POST(request) {
  try {
    const session = request.cookies.get("session")?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decodedClaims = await adminAuth.verifySessionCookie(session);
    if (!decodedClaims) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectMongo();
    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ firebaseUid: decodedClaims.uid });
    if (!user || (user.role !== "Admin" && user.role !== "Editor")) {
      return NextResponse.json({ error: "Forbidden: Admins or Editors only" }, { status: 403 });
    }



    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "editor");
    
    await fs.mkdir(uploadDir, { recursive: true });
    
    const diskPath = path.join(uploadDir, fileName);
    await fs.writeFile(diskPath, buffer);
    
    const publicUrl = `/api/uploads/editor/${fileName}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Upload Image Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
