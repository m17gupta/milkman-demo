import { cookies } from "next/headers";
import { signToken, verifyToken } from "./jwt";
import { connectToDatabase } from "./db/connect";
import { User } from "@/models/user";

export { signToken, verifyToken };

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload) return null;

    await connectToDatabase();
    const user = await User.findById(payload.id).lean();
    if (!user) return null;

    return {
      id: user._id.toString(),
      phone: user.phone,
      role: user.role,
      name: user.name,
      email: user.email,
      preferredLanguage: user.preferredLanguage,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
