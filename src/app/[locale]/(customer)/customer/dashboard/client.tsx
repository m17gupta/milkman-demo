"use client";

import { useState } from "react";
import {
  Bell,
  Clock,
  History as HistoryIcon,
  MapPin,
  Pause,
  Wallet,
  Droplets,
  Search,
  CalendarDays,
} from "lucide-react";
import { CustomerShell } from "@/components/layout/customer-shell";
import { formatCurrencyINR } from "@/lib/utils";
import { DashboardCalendar } from "@/components/calendar/dashboard-calendar";
import type { CalendarDayRecord } from "@/lib/calendar";

export type DashboardData = {
  name: string;
  phone: string;
  areaName: string;
  quantityLabel: string;
  rate: number;
  billed: number;
  due: number;
  paid: number;
  customerCode: string;
  calendarData: {
    monthLabel: string;
    leadingBlankSlots: number;
    days: CalendarDayRecord[];
  } | null;
};

type CustomerDashboardClientProps = {
  locale: string;
  displayData: DashboardData;
  initials: string;
  translations: Record<string, string>;
};

export function CustomerDashboardClient({
  locale,
  displayData,
  initials,
  translations: t,
}: CustomerDashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <CustomerShell locale={locale}>
      <div className="px-4 pb-10">
        {/* App Header */}
        <div className="app-header">
          <div>
            <div className="eyebrow">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{displayData.areaName}</span>
            </div>
            <div className="title">{t.greeting}</div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="icon-btn" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="dot"></span>
            </button>
            <div className="avatar" aria-hidden="true">{initials || "RM"}</div>
          </div>
        </div>

        {/* Search */}
        <div className="search mb-3">
          <Search className="h-4 w-4 text-[color:var(--ink-300)]" aria-hidden="true" />
          <input
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="button" className="icon-btn" aria-label={t.filter} style={{ width: 32, height: 32, boxShadow: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-funnel h-4 w-4" aria-hidden="true">
              <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" />
            </svg>
          </button>
        </div>

        {/* Hero */}
        <section className="hero">
          <span className="eyebrow">{t.heroEyebrow}</span>
          <h2>{t.heroTitle}</h2>
          <p>{displayData.quantityLabel} · {displayData.areaName}</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-sm btn-ghost">
              <Pause className="h-4 w-4" />
              {t.heroPause}
            </button>
            <button type="button" className="btn btn-sm btn-ghost">{t.heroTrack}</button>
          </div>
        </section>

        {/* Quick Actions */}
        <div className="section-head">
          <h3>{t.quickActions}</h3>
        </div>
        <div className="quick-grid">
          <a className="quick" href="#">
            <span className="q-icn" style={{ background: 'var(--brand-soft)', color: 'var(--brand-ink)' }}>
              <Droplets className="h-5 w-5" />
            </span>
            <span>{t.subscribe}</span>
          </a>
          <a className="quick" href="#">
            <span className="q-icn" style={{ background: 'var(--mint-soft)', color: 'rgb(6, 95, 70)' }}>
              <CalendarDays className="h-5 w-5" />
            </span>
            <span>{t.schedule}</span>
          </a>
          <a className="quick" href="#">
            <span className="q-icn" style={{ background: 'var(--sun-soft)', color: 'rgb(146, 64, 14)' }}>
              <Wallet className="h-5 w-5" />
            </span>
            <span>{t.topUp}</span>
          </a>
          <a className="quick" href="#">
            <span className="q-icn" style={{ background: 'var(--rose-soft)', color: 'rgb(159, 18, 57)' }}>
              <HistoryIcon className="h-5 w-5" />
            </span>
            <span>{t.history}</span>
          </a>
        </div>

        {/* Delivery Calendar Section */}
        {displayData.calendarData && (
          <section className="mt-8">
            <div className="section-head">
              <h3>{t.calendarTitle}</h3>
            </div>
            <div className="w-full">
              <DashboardCalendar
                monthLabel={displayData.calendarData.monthLabel}
                leadingBlankSlots={displayData.calendarData.leadingBlankSlots}
                days={displayData.calendarData.days}
              />
            </div>
          </section>
        )}

        {/* Subscriptions */}
        <div className="section-head">
          <h3>{t.subscriptions}</h3>
          <button className="text-[12px] font-bold text-blue-600">{t.viewAll}</button>
        </div>
        <article className="card">
          <div className="card-row">
            <div className="thumb">
              <Droplets className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="card-title">{displayData.quantityLabel}</div>
                <span className="chip mint"><span className="status-dot mint"></span>{t.active}</span>
              </div>
              <div className="card-sub">{displayData.areaName} · {formatCurrencyINR(displayData.rate)} {t.perLiter}</div>
            </div>
          </div>
          <div className="h-px bg-gray-50 w-full my-4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{t.nextDelivery}</span>
            </div>
            <span className="chip">{t.deliveryStatus}</span>
          </div>
        </article>

        {/* Stats */}
        <div className="section-head">
          <h3>{t.thisMonth}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <article className="stat p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t.thisMonth}</div>
            <div className="text-[22px] font-black text-gray-900">{formatCurrencyINR(displayData.billed)}</div>
            <div className="mt-1 text-[10px] text-emerald-500 font-bold leading-tight">{t.monthHint}</div>
          </article>
          <article className="stat p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t.pendingDue}</div>
            <div className="text-[22px] font-black text-rose-500">{formatCurrencyINR(displayData.due)}</div>
            <div className="mt-1 text-[10px] text-gray-400 font-bold leading-tight">{t.noUpdate}</div>
          </article>
        </div>
      </div>
    </CustomerShell>
  );
}
