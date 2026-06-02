import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    if (cookieStore.has("session")) {
      cookieStore.delete("session");
    }
    
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
