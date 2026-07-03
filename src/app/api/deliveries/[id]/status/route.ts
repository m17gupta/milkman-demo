import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { CustomerProfile } from "@/models/customer-profile";
import { Delivery } from "@/models/delivery";
import { DeliveryException } from "@/models/delivery-exception";
import { MilkPlan } from "@/models/milk-plan";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, date, extraQuantity } = await request.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    await connectToDatabase();

    const customer = await CustomerProfile.findById(id).lean();
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const targetDate = date ? new Date(date) : new Date();
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    console.log(`[PATCH Delivery] ID: ${id}, Status: ${status}, Extra: ${extraQuantity}, Date: ${targetDate.toISOString()}`);

    const activePlan = await MilkPlan.findOne({ customerId: customer._id, isActive: true })
      .sort({ startDate: -1 })
      .lean<{ quantityLiters?: number; pricePerLiter?: number } | null>();

    const baseQuantity = activePlan?.quantityLiters || 0;

    if (status === "PENDING") {
      await Promise.all([
        Delivery.deleteOne({
          customerId: customer._id,
          date: { $gte: dayStart, $lte: dayEnd },
        }),
        DeliveryException.deleteOne({
          customerId: customer._id,
          date: { $gte: dayStart, $lte: dayEnd },
        }),
      ]);
    } else if (status === "DELIVERED") {
      const delivery = (await Delivery.findOne({
        customerId: customer._id,
        date: { $gte: dayStart, $lte: dayEnd },
      })) || new Delivery({
        customerId: customer._id,
        date: targetDate,
      });

      const extra = typeof extraQuantity === "number" ? extraQuantity : 0;

      delivery.status = "DELIVERED";
      delivery.defaultQuantity = baseQuantity;
      delivery.actualQuantity = extra > 0 ? baseQuantity + extra : baseQuantity;
      delivery.extraQuantity = extra;
      delivery.pricePerLiter = activePlan?.pricePerLiter || 0;
      await delivery.save();

      await DeliveryException.deleteOne({
        customerId: customer._id,
        date: { $gte: dayStart, $lte: dayEnd },
      });
    } else {
      const exception = (await DeliveryException.findOne({
        customerId: customer._id,
        date: { $gte: dayStart, $lte: dayEnd },
      })) || new DeliveryException({
        customerId: customer._id,
        date: targetDate,
      });

      exception.type = status === "PAUSED" ? "PAUSE" : "SKIP";
      await exception.save();

      await Delivery.deleteOne({
        customerId: customer._id,
        date: { $gte: dayStart, $lte: dayEnd },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH Delivery Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update status" },
      { status: 500 }
    );
  }
}
