import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { CustomerProfile } from "@/models/customer-profile";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    interface MeResponse {
      success: boolean;
      user: {
        id: string;
        phone: string;
        role: string;
        name: {
          en?: string;
          hi?: string;
          pa?: string;
        };
        email?: string;
        preferredLanguage?: string;
      };
      profile?: {
        customerCode: string;
        areaCode: string;
        areaName: string;
      };
      area?: {
        code: string;
        name: string;
      };
    }

    const responseData: MeResponse = {
      success: true,
      user,
    };

    if (user.role === "CUSTOMER") {
      await connectToDatabase();
      const profile = await CustomerProfile.findOne({ userId: user.id }).lean() as unknown as {
        customerCode: string;
        areaCode: string;
        areaName: string;
      } | null;
      if (profile) {
        responseData.profile = {
          customerCode: profile.customerCode,
          areaCode: profile.areaCode,
          areaName: profile.areaName,
        };
        responseData.area = {
          code: profile.areaCode,
          name: profile.areaName,
        };
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { success: false, error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
