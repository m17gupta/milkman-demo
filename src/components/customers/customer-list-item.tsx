"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { formatCurrencyINR, cn } from "@/lib/utils";
import { CustomerCardActions } from "./customer-card-actions";
import { CustomerDetailModal } from "./customer-detail-modal";
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
  setMenuOpen
}: CustomerListItemProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const formatDateShort = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
    }).format(new Date(date));
  };

  return (
    <article
      onClick={() => onView?.("view")}
      className={cn(
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
      </div>
    </article>
  );
}