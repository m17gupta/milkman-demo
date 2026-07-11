import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCustomerByUserId, getCustomerMonthlyCalendar } from "@/lib/data-service";
import { CustomerDashboardClient } from "./client";

type CustomerDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CustomerDashboardPage({ params }: CustomerDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  // 1. Authenticate
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    redirect(`/${locale}/login`);
  }

  // 2. Fetch customer data
  const customerData = await getCustomerByUserId(user.id);

  if (!customerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">{t("dashboard.noProfile")}</p>
      </div>
    );
  }

  // 3. Fetch calendar data for the current month
  const now = new Date();
  const calendarData = await getCustomerMonthlyCalendar(
    customerData.customerCode,
    now.getMonth() + 1,
    now.getFullYear(),
  );

  // 4. Process calendar days: mark future days and add required CalendarDayRecord fields
  const processedDays = (calendarData?.days || []).map((day) => {
    const dayDate = new Date(day.dateKey);
    const isFuture = dayDate > now;
    return {
      dateKey: day.dateKey,
      dateLabel: new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(dayDate),
      dayOfMonth: day.dayOfMonth,
      weekdayLabel: day.weekdayLabel,
      status: isFuture ? ("PENDING" as const) : day.status,
      liters: isFuture ? 0 : day.liters,
      isFuture,
    };
  });

  // 5. Build the display model
  const displayData = {
    name: customerData.name || customerData.customerCode,
    phone: customerData.phone,
    areaName: customerData.areaName,
    quantityLabel: customerData.quantityLabel || `${customerData.quantity || 0} ${t("common.liters")}`,
    rate: customerData.rate || 0,
    billed: customerData.billed || 0,
    due: customerData.due || 0,
    paid: customerData.paid || 0,
    customerCode: customerData.customerCode,
    calendarData: calendarData
      ? {
          monthLabel: calendarData.monthLabel || "",
          leadingBlankSlots: calendarData.leadingBlankSlots ?? 0,
          days: processedDays,
        }
      : null,
  };

  const initials = displayData.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <CustomerDashboardClient
      locale={locale}
      displayData={displayData}
      initials={initials}
      translations={{
        searchPlaceholder: t("home.searchPlaceholder"),
        filter: t("common.filter"),
        greeting: t("home.greeting", { name: displayData.name.split(" ")[0] }),
        heroEyebrow: t("home.hero.eyebrow"),
        heroTitle: t("home.hero.title"),
        heroPause: t("home.hero.pause"),
        heroTrack: t("home.hero.track"),
        quickActions: t("home.quickActions"),
        subscribe: t("home.subscribe"),
        schedule: t("home.schedule"),
        topUp: t("home.topUp"),
        history: t("home.history"),
        calendarTitle: t("calendar.title"),
        viewAll: t("common.viewAll"),
        active: t("status.active"),
        perLiter: t("common.perLiter"),
        nextDelivery: t("dashboard.nextDelivery"),
        deliveryStatus: t("dashboard.deliveryStatus", { status: t("status.pending") }),
        thisMonth: t("dashboard.thisMonth"),
        monthHint: t("dashboard.monthHint"),
        pendingDue: t("dashboard.pendingDue"),
        noUpdate: t("dashboard.noUpdate"),
        liters: t("common.liters"),
        legendDelivered: t("calendar.legend.delivered"),
        legendSkipped: t("calendar.legend.skipped"),
        legendPaused: t("calendar.legend.paused"),
        statusPending: t("status.pending"),
        today: t("status.today"),
        onTrack: t("status.onTrack"),
        close: t("common.close"),
        subscriptions: t("home.subscriptions"),
      }}
    />
  );
}
