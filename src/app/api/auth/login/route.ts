import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/user";

export async function POST(request: Request) {
  const { phone } = await request.json();

  if (!phone || phone.length !== 10) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  await connectToDatabase();

  const user = await User.findOne({ phone, status: "ACTIVE" }).lean();

  if (!user) {
    return NextResponse.json({ error: "User not found or inactive" }, { status: 404 });
  }

  const jwtSecret = new TextEncoder().encode(
    process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production",
  );

  const token = await new SignJWT({
    sub: user._id.toString(),
    role: user.role,
    phone: user.phone,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(jwtSecret);

  return NextResponse.json({
    success: true,
    token,
    user: {
      id: user._id.toString(),
      phone: user.phone,
      role: user.role,
      name: user.name || "",
      email: user?.email,
      preferredLanguage: user?.preferredLanguage,
    },
  });
}
