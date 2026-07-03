"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { formatCurrencyINR, cn } from "@/lib/utils";
import { CustomerCardActions } from "./customer-card-actions";
import { CustomerCalendarModal } from "./customer-calendar-modal";

type CustomerListItemProps = {
  customer: {
    id: string;
    customerCode: string;
    name: string;
    status: string;
    areaName: string;
    quantity: number;
    due: number;
    lastPaymentDate?: string | Date | null;
  };
  locale: string;
  onView?: (mode: "view" | "details" | "schedule" | "edit") => void;
  isMenuOpen: boolean;
  setMenuOpen: (isOpen: boolean) => void;
};

export function CustomerListItem({
  customer,
  locale,
  onView,
  isMenuOpen,
  setMenuOpen,
}: CustomerListItemProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatDateShort = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
    }).format(new Date(date));
  };

  const initials = customer.name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  const isActive = customer.status === "ACTIVE";
  const hasDue = customer.due > 0;

  return (
    <>
      <article
        onClick={() => onView?.("view")}
        className={cn(
          "bg-white rounded-2xl px-4 py-4 transition-all relative group border border-gray-100 mb-3 cursor-pointer",
          isMenuOpen
            ? "z-[50] shadow-xl border-[#064e3b]/20 overflow-visible"
            : "z-10 shadow-sm hover:shadow-md hover:border-gray-200 overflow-visible",
        )}
      >
        <div className="relative z-10 flex items-center gap-2 sm:gap-3">
          <div
            className={cn(
              "hidden sm:flex h-11 w-11 shrink-0 rounded-xl items-center justify-center font-black text-sm shadow-sm",
              isActive
                ? "bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] text-[#064e3b]"
                : "bg-amber-50 text-amber-700",
            )}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="truncate text-[15px] font-bold text-gray-900 tracking-tight leading-snug">
              {customer.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 overflow-hidden">
              <span
                className={cn(
                  "shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide",
                  isActive ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700",
                )}
              >
                {customer.status}
              </span>
              <span className="text-[11px] text-gray-400 font-semibold truncate">
                {customer.areaName}
                <span className="mx-1 text-gray-300">·</span>
                {customer.quantity.toFixed(1)}L
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right flex flex-col items-end justify-center min-w-[100px] mr-4 sm:mr-6">
            <p className="text-xl font-black tracking-tighter leading-none text-[#e11d48]">
              {formatCurrencyINR(customer.due)}
            </p>
            <div className="mt-2 flex items-center justify-end gap-1.5 opacity-70">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.12em]">DUE</span>
              <span className="text-gray-300 text-[10px]">•</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.12em]">
                paid:{" "}
                {customer.lastPaymentDate
                  ? new Date(customer.lastPaymentDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })
                  : "n/a"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCalendarOpen(true);
              }}
              className="w-11 h-11 rounded-xl flex items-center justify-center border border-gray-100 bg-white text-gray-400 hover:text-gray-900 hover:shadow-md transition-all active:scale-90 shadow-sm"
            >
              <CalendarDays size={18} strokeWidth={2.5} />
            </button>

            <CustomerCardActions
              id={customer.id}
              customerCode={customer.customerCode}
              isMenuOpen={isMenuOpen}
              setMenuOpen={setMenuOpen}
              locale={locale}
              onView={onView}
            />
          </div>
        </div>
      </article>

      <CustomerCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        customer={customer}
      />
    </>
  );
}
