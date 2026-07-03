import {
  Activity,
  BadgeIndianRupee,
  CircleAlert,
  Droplets,
  Gauge,
  MoveRight,
  ShoppingCart,
  Users,
} from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminBadge, AdminCard, AdminStatCard } from "@/components/layout/admin-ui";
import {
  getAdminCalendarData,
  getDashboardData,
  getPurchaseLedgerData,
} from "@/lib/data-service";
import { cn, formatCurrencyINR } from "@/lib/utils";

type AdminDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardPage({
  params,
}: AdminDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin.dashboard" });
  const tStatus = await getTranslations({ locale, namespace: "status" });
  const [{ kpis, routeSnapshot, attentionCustomers }, purchaseLedger, adminCalendar] =
    await Promise.all([getDashboardData(), getPurchaseLedgerData(), getAdminCalendarData()]);

  const routeCoverage = kpis.activeCustomers
    ? Math.round((kpis.todayDelivered / kpis.activeCustomers) * 100)
    : 0;
  const collectionRate = kpis.monthlySales
    ? Math.round(((kpis.monthlySales - kpis.monthlyDue) / kpis.monthlySales) * 100)
    : 0;
  const inwardCoverage = adminCalendar.summary.totalLiters
    ? Math.min(
      Math.round(
        (purchaseLedger.summary.totalMilkInward / Math.max(adminCalendar.summary.totalLiters, 1)) *
        100,
      ),
      100,
    )
    : 0;

  const progressRows: Array<{ label: string; value: number }> = [
    { label: t("progress.deliveryCompletion"), value: routeCoverage },
    { label: t("progress.paymentRecovery"), value: collectionRate },
    { label: t("progress.milkInwardCoverage"), value: inwardCoverage },
  ];

  return (
    <AdminShell locale={locale} title={t("title")} subtitle={t("subtitle")}>
      <div className="space-y-4">
        {/* 1. KPI Cards Row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <AdminStatCard
            label={t("stats.activeCustomers")}
            value={String(kpis.activeCustomers)}
            hint={t("stats.activeCustomersHint", { count: kpis.todayPending })}
            icon={Users}
            tone="blue"
          />
          <AdminStatCard
            label={t("stats.todaysDeliveries")}
            value={String(kpis.todayDelivered)}
            hint={t("stats.todaysDeliveriesHint", { count: kpis.todayPending })}
            icon={Droplets}
            tone="success"
          />
          <AdminStatCard
            label={t("stats.monthlySales")}
            value={formatCurrencyINR(kpis.monthlySales)}
            hint={t("stats.monthlySalesHint")}
            icon={BadgeIndianRupee}
            tone="warning"
            className="col-span-2 md:col-span-1"
          />
          <AdminStatCard
            label={t("stats.outstandingDues")}
            value={formatCurrencyINR(kpis.monthlyDue)}
            hint={t("stats.outstandingDuesHint", { count: attentionCustomers.filter(c => c.tone === "danger").length })}
            icon={CircleAlert}
            tone="danger"
            className="col-span-2 md:col-span-1"
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
          {/* 2. Hero Section: Route Summary */}
          <section className="admin-panel rounded-[28px] p-5 sm:p-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center gap-8 rounded-[24px] bg-[linear-gradient(180deg,#edf4ff_0%,#e8efff_100%)] p-5 sm:p-6">
              <div className="flex-1 w-full">
                <AdminBadge tone="blue">{t("hero.badge")}</AdminBadge>
                <h2 className="mt-4 max-w-xl text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
                  {t("hero.title")}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--admin-muted)]">
                  {t("hero.description")}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/admin/deliveries?start=1"
                    className="admin-primary-button px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    {t("hero.startRun")}
                    <MoveRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/admin/purchases"
                    className="admin-secondary-button px-4 py-3 text-sm font-semibold flex items-center justify-center"
                  >
                    {t("hero.reviewLedger")}
                  </Link>
                </div>
              </div>
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-[220px] lg:h-[220px] shrink-0 drop-shadow-2xl">
                <Image
                  src="/milk3.png"
                  alt="Milk Overview"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Area Snapshots */}
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {routeSnapshot.slice(0, 3).map((area) => (
                <article key={area.areaCode} className="admin-panel-muted rounded-[22px] px-4 py-4">
                  <p className="text-sm font-medium text-[var(--admin-muted)]">
                    {area.areaName[locale as keyof typeof area.areaName] || area.areaName.en}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--admin-text)]">
                    {t("routeCustomers", { count: area.customerCount })}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[var(--admin-primary-strong)]">
                    {t("routeSummary", { delivered: area.deliveredCount, liters: area.liters.toFixed(1) })}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <div className="space-y-4">
            {/* 3. Quick Actions */}
            <section className="admin-panel rounded-[28px] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--admin-text)]">{t("quickActions.title")}</h2>
                  <p className="mt-1 text-sm text-[var(--admin-muted)]">{t("quickActions.subtitle")}</p>
                </div>
                <Gauge className="h-5 w-5 text-[var(--admin-primary-strong)]" />
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  { label: t("quickActions.addCustomer"), href: "/admin/customers/new" },
                  { label: t("quickActions.markDeliveries"), href: "/admin/deliveries" },
                  { label: t("quickActions.recordPayment"), href: "/admin/billing" },
                  { label: t("quickActions.capturePurchase"), href: "/admin/purchases" },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="admin-secondary-button w-full justify-between px-4 py-3 text-left text-sm font-semibold"
                  >
                    <span>{action.label}</span>
                    <MoveRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </section>

            {/* 4. Today's Progress */}
            <section className="admin-panel rounded-[28px] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--admin-text)]">{t("progress.title")}</h2>
                  <p className="mt-1 text-sm text-[var(--admin-muted)]">{t("progress.subtitle")}</p>
                </div>
                <AdminBadge tone="success">{tStatus("onTrack")}</AdminBadge>
              </div>
              <div className="mt-5 space-y-4">
                {progressRows.map((row) => (
                  <div key={row.label}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <p className="font-medium text-[var(--admin-text)]">{row.label}</p>
                      <p className="text-[var(--admin-muted)]">{row.value}%</p>
                    </div>
                    <div className="admin-progress-track h-2.5">
                      <div
                        className="admin-progress-fill"
                        style={{ width: `${row.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          {/* 5. Customers Needing Attention */}
          <section className="admin-panel rounded-[28px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[var(--admin-text)]">{t("attention.title")}</h2>
                <p className="mt-1 text-sm text-[var(--admin-muted)]">{t("attention.subtitle")}</p>
              </div>
              <Activity className="h-5 w-5 text-[var(--admin-primary-strong)]" />
            </div>
            <div className="mt-4 space-y-3">
              {attentionCustomers.map((entry) => (
                <div
                  key={entry.customerCode}
                  className="admin-panel-muted flex flex-col gap-3 rounded-[22px] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-[var(--admin-text)]">{entry.name}</p>
                    <p className="mt-1 text-sm text-[var(--admin-muted)]">{entry.info}</p>
                  </div>
                  <AdminBadge tone={entry.tone}>
                    {entry.issue}
                  </AdminBadge>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Today's Work Summary */}
          <section className="admin-panel rounded-[28px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[var(--admin-text)]">{t("performance.title")}</h2>
                <p className="mt-1 text-sm text-[var(--admin-muted)]">{t("performance.subtitle")}</p>
              </div>
              <Link
                href="/admin/reports"
                className="admin-outline-button px-4 py-3 text-sm font-semibold"
              >
                {t("performance.viewSummary")}
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="admin-panel-muted rounded-[24px] px-4 py-5">
                <AdminBadge tone="danger">{t("performance.pending")}</AdminBadge>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
                  {kpis.todayPending}
                </p>
              </div>
              <div className="admin-panel-muted rounded-[24px] px-4 py-5">
                <AdminBadge tone="success">{t("performance.delivered")}</AdminBadge>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
                  {kpis.todayDelivered}
                </p>
              </div>
              <div className="admin-panel-muted rounded-[24px] px-4 py-5">
                <AdminBadge tone="warning">{t("performance.unpaidPurchases")}</AdminBadge>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
                  {purchaseLedger.summary.unpaidEntries}
                </p>
              </div>
              <div className="admin-panel-muted rounded-[24px] px-4 py-5">
                <AdminBadge tone="blue">{t("performance.milkInward")}</AdminBadge>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
                  {purchaseLedger.summary.totalMilkInward.toFixed(1)} L
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
const customStyles = `
  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
  
  @media (max-width: 768px) {
    .stats-row { 
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: 8px;
      margin: 0 -16px;
      padding-left: 16px;
      padding-right: 16px;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none;  /* IE and Edge */
    }
    .stats-row::-webkit-scrollbar {
      display: none;
    }
    .stat-card {
      min-width: 200px;
      flex-shrink: 0;
      scroll-snap-align: start;
    }
  }

  .stat-card { 
    background: white; 
    border-radius: 20px; 
    padding: 16px; 
    position: relative; 
    overflow: hidden; 
    border: 1px solid #f3f4f6;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }

  .stat-card .blob { 
    position: absolute; 
    right: -20px; 
    top: -20px; 
    width: 100px; 
    height: 100px; 
    border-radius: 50%; 
    filter: blur(20px);
  }

  .stat-lbl { 
    font-size: 10px; 
    font-weight: 800; 
    color: #9CA3AF; 
    margin-bottom: 8px; 
    text-transform: uppercase; 
    letter-spacing: 0.05em; 
  }

  .stat-val { 
    font-size: 28px; 
    font-weight: 900; 
    color: #111827; 
    line-height: 1; 
    margin-bottom: 12px; 
    letter-spacing: -0.02em; 
  }

  .stat-pill { 
    font-size: 10px; 
    font-weight: 700; 
    padding: 4px 10px; 
    border-radius: 20px; 
    display: inline-block; 
  }
  
  .mid-row { display: grid; grid-template-columns: 1.2fr 1fr 0.8fr; gap: 16px; }
  .bottom-row { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }

  .pill-green { background: #f0fdf4; color: #15803d; }
  .pill-blue { background: #eff6ff; color: #1d4ed8; }
  .pill-amber { background: #fffbeb; color: #b45309; }
  .pill-red { background: #fef2f2; color: #b91c1c; }

  @media (max-width: 1200px) {
    .mid-row { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 768px) {
    .mid-row, .bottom-row { grid-template-columns: 1fr; }
  }
`;
