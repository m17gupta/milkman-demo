import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/user";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user) {
      await connectToDatabase();
      await User.findByIdAndUpdate(user.id, {
        $set: { lastLogoutAt: new Date() }
      });
    }

    const cookieStore = await cookies();
    cookieStore.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Immediately expires the cookie
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout API Error:", error);
    return NextResponse.json(
      { success: false, error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
