"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { formatCurrencyINR, cn } from "@/lib/utils";
import { CustomerCardActions } from "./customer-card-actions";
import { CustomerSchedulePopover } from "./customer-schedule-popover";

type CustomerListItemProps = {
  customer: any;
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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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
    <article
      onClick={() => onView?.("view")}
      className={cn(
<<<<<<< Updated upstream
        "bg-white rounded-[20px] px-4 py-4 transition-all relative group border border-gray-100 mb-3 cursor-pointer hover:border-green-200 hover:shadow-md",
        // Dynamic Z-index to keep popovers on top
        (isMenuOpen || isPopoverOpen) ? "z-[50] ring-2 ring-[#064e3b]/10 shadow-lg" : "z-10 shadow-sm"
      )}
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Info Block */}
        <div className="flex items-center gap-3">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#064e3b] font-black text-xs sm:flex shadow-sm">
            {customer.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-sm tracking-tight">{customer.name}</h3>
              <span className={cn(
                "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                customer.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              )}>
                {customer.status}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
              {customer.areaName} <span className="mx-1 text-gray-200">•</span> {customer.quantity.toFixed(1)}L
            </p>
          </div>
        </div>

        {/* Action Block */}
        <div className="flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0">
          <div className="text-left md:text-right">
            <p className={cn(
              "text-base font-black tracking-tighter leading-none",
              customer.due > 500 ? "text-red-600" : "text-[#064e3b]"
            )}>
              {formatCurrencyINR(customer.due)}
            </p>
            <div className="flex items-center justify-start md:justify-end gap-1 mt-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">
              DUE <span className="w-1 h-1 bg-gray-200 rounded-full" /> PAID: {formatDateShort(customer.lastPaymentDate)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents row click
                  setIsPopoverOpen(!isPopoverOpen);
                }}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all border",
                  isPopoverOpen
                    ? "bg-green-100 text-[#064e3b] border-green-200 shadow-inner"
                    : "bg-gray-50 text-gray-400 border-transparent hover:bg-green-50 hover:text-[#064e3b]"
                )}
              >
                <CalendarDays size={16} strokeWidth={2.5} />
              </button>
=======
        "bg-white rounded-2xl px-4 py-4 transition-all relative group border border-gray-100 mb-3 cursor-pointer",
        isMenuOpen || isPopoverOpen
          ? "z-[50] shadow-xl border-[#064e3b]/20 overflow-visible"
          : "z-10 shadow-sm hover:shadow-md hover:border-gray-200 overflow-visible"
      )}
    >
      <div className="relative z-10 flex items-center gap-2 sm:gap-3">

        {/* Avatar — desktop only */}
        <div className={cn(
          "hidden sm:flex h-11 w-11 shrink-0 rounded-xl items-center justify-center font-black text-sm shadow-sm",
          isActive
            ? "bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] text-[#064e3b]"
            : "bg-amber-50 text-amber-700"
        )}>
          {initials}
        </div>

        {/* Info — flex-1 with min-w-0 prevents name from wrapping */}
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-[15px] font-bold text-gray-900 tracking-tight leading-snug">
            {customer.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn(
              "shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide",
              isActive ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            )}>
              {customer.status}
            </span>
            <span className="text-[11px] text-gray-400 font-semibold truncate">
              {customer.areaName}
              <span className="mx-1 text-gray-300">·</span>
              {customer.quantity.toFixed(1)}L
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="shrink-0 text-right mr-1">
          <p className={cn(
            "text-[15px] font-black tracking-tight leading-none",
            hasDue ? "text-red-500" : "text-[#059669]"
          )}>
            {formatCurrencyINR(customer.due)}
          </p>
          <p className="text-[9px] font-semibold text-gray-400 mt-0.5 uppercase tracking-widest">
            due · paid: {formatDateShort(customer.lastPaymentDate)}
          </p>
        </div>

        {/* Calendar button */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPopoverOpen(!isPopoverOpen);
            }}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
              isPopoverOpen
                ? "bg-[#dcfce7] text-[#064e3b]"
                : "text-gray-400 hover:bg-gray-50 hover:text-[#064e3b]"
            )}
          >
            <CalendarDays size={16} strokeWidth={2} />
          </button>
>>>>>>> Stashed changes

          <CustomerSchedulePopover
            isOpen={isPopoverOpen}
            onClose={() => setIsPopoverOpen(false)}
            customerCode={customer.customerCode}
            onViewFull={() => {
              setIsPopoverOpen(false);
              onView?.("schedule");
            }}
          />
        </div>

        {/* Menu */}
        <div className="shrink-0">
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
  );
}