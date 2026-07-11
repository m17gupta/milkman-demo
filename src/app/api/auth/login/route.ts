import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/user";
import { signToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { phone, pin } = await request.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    if (!pin || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: "4-digit PIN is required" }, { status: 400 });
    }

    await connectToDatabase();

    const userDoc = await User.findOne({ phone, status: "ACTIVE" }).select("+pinHash").lean<{
      _id: string;
      role: string;
      phone: string;
      name: { en?: string; hi?: string; pa?: string } | string;
      email?: string;
      preferredLanguage?: string;
      pinHash?: string;
      username?: string;
    } | null>();

    if (!userDoc) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 404 });
    }

    const userId = String(userDoc._id);

    // Verify the 4-digit PIN
    if (!userDoc.pinHash) {
      return NextResponse.json(
        { error: "No PIN set for this account. Please contact support." },
        { status: 401 },
      );
    }

    const isValidPin = userDoc.pinHash.startsWith("$2")
      ? await bcrypt.compare(pin, userDoc.pinHash)
      : pin === userDoc.pinHash;
    if (!isValidPin) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    const userName = typeof userDoc.name === "string" ? userDoc.name : userDoc.name?.en || "";

    const token = await signToken({
      id: userId,
      role: userDoc.role,
      phone: userDoc.phone,
      name: userName,
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        phone: userDoc.phone,
        role: userDoc.role,
        name: userName,
        email: userDoc?.email,
        preferredLanguage: userDoc?.preferredLanguage,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
