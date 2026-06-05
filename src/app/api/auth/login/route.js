import { adminAuth } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    const { idToken } = await request.json();
    
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const email = decodedToken.email;
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

    await connectMongo();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "Account not authorized" }, { status: 403 });
    }

    const updateData = {
      firebaseUid: decodedToken.uid,
      name: user.name && user.name !== "New User" ? user.name : decodedToken.name,
      avatarUrl: user.avatarUrl || decodedToken.picture,
    };

    if (adminEmails.includes(email) && user.role !== "Admin") {
      updateData.role = "Admin";
    }

    await User.updateOne({ _id: user._id }, { $set: updateData });
    
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ status: "success", uid: decodedToken.uid });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
