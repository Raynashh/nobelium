import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import connectMongo from "@/lib/mongodb";
import { s3Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

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
    const s3Key = `uploads/editor/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    });

    await s3Client.send(command);
    
    const publicUrl = `${R2_PUBLIC_URL}/${s3Key}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Upload Image Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
