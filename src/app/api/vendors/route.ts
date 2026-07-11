import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/connect";
import { normalizeAreaCode } from "@/lib/areas";
import { Area } from "@/models/area";
import { Vendor } from "@/models/vendor";

const vendorSchema = z.object({
  code: z.string().trim().optional(),
  name: z.string().trim().min(2),
  phone: z.string().trim().optional(),
  defaultRate: z.number().nonnegative().optional(),
  areaCode: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  await connectToDatabase();
  const vendors = await Vendor.find().sort({ sortOrder: 1, name: 1 }).lean();
  return NextResponse.json({ vendors });
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = vendorSchema.parse(await request.json());
    const code = normalizeAreaCode(payload.code || payload.name);
    const area = payload.areaCode ? await Area.findOne({ code: payload.areaCode }).lean() : null;
    const areaName = area ? (typeof area.name === "string" ? area.name : area.name.en) : "";

    const existing = await Vendor.findOne({ code }).lean();
    if (existing) {
      return NextResponse.json({ error: "Vendor code already exists" }, { status: 409 });
    }

    const vendor = await Vendor.create({
      code,
      name: payload.name,
      phone: payload.phone || "",
      defaultRate: payload.defaultRate ?? 0,
      areaCode: area?.code || payload.areaCode || "",
      areaName,
      notes: payload.notes || "",
      isActive: payload.isActive ?? true,
      sortOrder: await Vendor.countDocuments(),
    });

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
  }
}
