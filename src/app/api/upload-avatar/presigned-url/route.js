import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import { s3Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(request) {
  try {
    const session = request.cookies.get("session")?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decodedClaims = await adminAuth.verifySessionCookie(session);
    await connectMongo();
    const user = await User.findOne({ firebaseUid: decodedClaims.uid });
    
    if (!user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { fileName, fileType } = await request.json();
    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Missing file metadata" }, { status: 400 });
    }

    const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const s3Key = `uploads/avatars/${safeFileName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 mins
    const publicUrl = `${R2_PUBLIC_URL}/${s3Key}`;

    return NextResponse.json({ success: true, presignedUrl, publicUrl });
  } catch (error) {
    console.error("Presigned URL Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
