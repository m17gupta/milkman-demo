"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  Bell,
  CalendarDays,
  ChartColumn,
  ChevronRight,
  CreditCard,
  Droplets,
  Home,
  Menu,
  NotebookText,
  Package2,
  ShoppingCart,
  Store,
  Users,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: React.ReactNode;
  locale: string;
  title: string;
  subtitle: string;
  hideHero?: boolean;
  search?: React.ReactNode;
};

type NavKey =
  | "dashboard"
  | "vendors"
  | "customers"
  | "deliveries"
  | "calendar"
  | "billing"
  | "reports"
  | "area-insights"
  | "purchases"
  | "areas"
  | "products";

type NavItem = {
  href: NavKey | "reports/area-insights";
  icon: typeof Home;
  labelKey?: string;
  isLive?: boolean;
};

const navItems: NavItem[] = [
  { href: "dashboard", icon: Home, isLive: true },
  { href: "vendors", icon: Store },
  { href: "customers", icon: Users },
  { href: "deliveries", icon: Droplets },
  { href: "calendar", icon: CalendarDays },
  { href: "billing", icon: CreditCard },
  { href: "reports", icon: ChartColumn },
  { href: "reports/area-insights", icon: NotebookText, labelKey: "areaInsights" },
  { href: "purchases", icon: ShoppingCart },
  { href: "areas", icon: Building2 },
  { href: "products", icon: Package2 },
];

export function AdminShell({
  children,
  locale,
  title,
  subtitle,
  hideHero,
  search,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const tShell = useTranslations("admin.shell");
  const tNav = useTranslations("admin.nav");

  const isDashboard = pathname === `/${locale}/admin/dashboard`;

  const renderNavItem = ({ href, icon: Icon, labelKey, isLive }: NavItem) => {
    const target = `/${locale}/admin/${href}`;
    const isActive = pathname === target || pathname.startsWith(`${target}/`);
    const navKey = href === "reports/area-insights" ? "reports" : href;
    const label = labelKey ? tNav(labelKey) : tNav(navKey);

    return (
      <Link
        key={href}
        href={target}
        onClick={() => setIsDrawerOpen(false)}
        className={cn("admin-nav-item", isActive && "admin-nav-item-active")}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-sm font-medium">{label}</span>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
      </Link>
    );
  };

  return (
    <div className="admin-theme">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] max-w-[1440px] gap-4 px-3 pt-2 pb-3 sm:px-4 lg:px-5">
        <aside className="admin-panel sticky top-[72px] hidden h-[calc(100vh-1.25rem-64px)] w-[296px] shrink-0 rounded-[32px] p-5 lg:flex lg:flex-col overflow-y-auto">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary-strong)]">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-gray-900 leading-none">Dairy</h1>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Milkman Panel</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-3">Workspace</p>
            {navItems.map(renderNavItem)}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-50">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-900 mb-1">Support Center</p>
              <p className="text-[11px] leading-relaxed text-gray-400 font-medium tracking-tight">Need help? Contact our support team for any workspace issues.</p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex min-w-0 flex-1 flex-col lg:h-full lg:overflow-hidden">
          <div className="min-w-0 flex-1">
            <header className="sticky top-16 z-30 mb-3 sm:top-[72px] sm:mb-3">
              <div className="admin-panel rounded-[30px] px-4 py-3 shadow-lg shadow-blue-900/5 sm:px-5 sm:shadow-none">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(true)}
                      className="admin-icon-button h-11 w-11 lg:hidden"
                      aria-label={tShell("openMenu")}
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--admin-muted)] sm:text-[13px]">
                        {tShell("workspaceEyebrow")}
                      </p>
                      <p className="truncate text-base font-bold text-[var(--admin-text)] sm:text-xl">
                        {title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="admin-icon-button h-11 w-11"
                      aria-label={tShell("notifications")}
                    >
                      <Bell className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 pb-10 sm:px-8">
              <div className="mx-auto max-w-[1200px]">
                {children}
              </div>
            </main>

            {/* Sticky Bottom Nav (Mobile Only) */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-slate-200 flex items-center justify-around h-16 px-2 lg:hidden">
              {[
                { href: "dashboard", icon: Home },
                { href: "deliveries", icon: Droplets },
                { href: "customers", icon: Users },
                { href: "billing", icon: CreditCard },
              ].map(({ href, icon: Icon }) => {
                const target = `/${locale}/admin/${href}`;
                const isActive = pathname === target || pathname.startsWith(`${target}/`);
                return (
                  <Link
                    key={href}
                    href={target}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 transition-all active:scale-90",
                      isActive ? "text-blue-600" : "text-slate-400"
                    )}
                  >
                    <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
                    <span className={cn("text-[10px] font-bold", isActive ? "text-blue-600" : "text-slate-400")}>
                      {tNav(href)}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <div className={cn("fixed inset-0 z-40 bg-[#064e3b]/40 backdrop-blur-sm lg:hidden transition-opacity", isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0")} onClick={() => setIsDrawerOpen(false)} />
      <aside className={cn("fixed left-0 top-0 z-50 h-full w-[300px] overflow-y-auto bg-white p-6 transition-transform lg:hidden shadow-2xl", isDrawerOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between mb-8">
          <span className="font-black tracking-tighter text-xl text-gray-900">Dairy</span>
          <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-400 hover:text-gray-900"><X size={20} /></button>
        </div>
        <nav className="space-y-1">{navItems.map(renderNavItem)}</nav>
      </aside>
    </div>
  );
}
