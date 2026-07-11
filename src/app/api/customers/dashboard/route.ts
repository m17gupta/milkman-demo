import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCustomerByUserId, getCustomerMonthlyCalendar } from "@/lib/data-service";
import { formatCurrencyINR } from "@/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const customerData = await getCustomerByUserId(user.id);
    if (!customerData) {
      return NextResponse.json({ success: false, error: "Customer profile not found" }, { status: 404 });
    }

    // Fetch calendar data for the current month
    const now = new Date();
    const calendarData = await getCustomerMonthlyCalendar(
      customerData.customerCode,
      now.getMonth() + 1,
      now.getFullYear(),
    );

    // Process calendar days: mark future days
    const processedDays = (calendarData?.days || []).map((day) => {
      const dayDate = new Date(day.dateKey);
      const isFuture = dayDate > now;
      return {
        ...day,
        liters: isFuture ? 0 : day.liters,
        status: isFuture ? ("PENDING" as const) : day.status,
        isFuture,
      };
    });

    const responseData = {
      success: true,
      data: {
        name: customerData.name,
        phone: customerData.phone,
        areaName: customerData.areaName,
        quantity: customerData.quantity,
        quantityLabel: customerData.quantityLabel,
        rate: customerData.rate,
        billed: customerData.billed || 0,
        paid: customerData.paid || 0,
        due: customerData.due || 0,
        customerCode: customerData.customerCode,
        address: customerData.address,
        calendarData: calendarData
          ? {
              monthLabel: calendarData.monthLabel || "",
              leadingBlankSlots: calendarData.leadingBlankSlots ?? 0,
              days: processedDays,
            }
          : null,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
