"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { AdminModal } from "@/components/layout/admin-modal";
import { AdminButton } from "@/components/layout/admin-ui";
import "react-day-picker/dist/style.css";

type CustomerCalendarModalProps = {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: string;
    customerCode: string;
    name: string;
  } | null;
};

export function CustomerCalendarModal({
  isOpen,
  onClose,
  customer,
}: CustomerCalendarModalProps) {
  const [month, setMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<{ days: Array<{ date: string; status: string }> } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      fetchCalendarData(month.getMonth() + 1, month.getFullYear());
    }
  }, [isOpen, customer, month]);

  const fetchCalendarData = async (m: number, y: number) => {
    if (!customer) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/customers/${customer.customerCode}/calendar?month=${m}&year=${y}`);
      const data = await res.json();
      setCalendarData(data);
    } catch (error) {
      console.error("Failed to fetch calendar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!customer) return null;

  // Process data for DayPicker modifiers
  const deliveredDays = calendarData?.days
    ?.filter((d: { status: string }) => d.status === "DELIVERED")
    .map((d: { date: string }) => new Date(d.date)) || [];
  
  const pausedDays = calendarData?.days
    ?.filter((d: { status: string }) => d.status === "PAUSED")
    .map((d: { date: string }) => new Date(d.date)) || [];

  const skippedDays = calendarData?.days
    ?.filter((d: { status: string }) => d.status === "SKIPPED")
    .map((d: { date: string }) => new Date(d.date)) || [];

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${customer.name}'s Delivery History`}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">
              {format(month, "MMMM yyyy")}
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.18em]">
              Delivery Calendar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="relative bg-white rounded-[32px] p-4 sm:p-8 border border-gray-100 shadow-sm overflow-hidden min-h-[380px]">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-[32px]">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          <div className="calendar-modern-wrapper">
            <DayPicker
              month={month}
              onMonthChange={setMonth}
              showOutsideDays
              modifiers={{
                delivered: deliveredDays,
                paused: pausedDays,
                skipped: skippedDays,
              }}
              className="mx-auto"
              classNames={{
                month: "space-y-0",
                caption: "hidden",
                table: "w-full border-collapse",
                head_row: "flex w-full mb-6",
                head_cell: "text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] w-full text-center",
                row: "flex w-full mt-2",
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full",
                day: "h-10 w-10 sm:h-12 sm:w-12 p-0 font-bold text-gray-400 transition-all rounded-full flex items-center justify-center mx-auto bg-gray-50/50 hover:bg-gray-100",
                day_today: "ring-2 ring-blue-500 ring-offset-2 !text-blue-600 !bg-white",
                day_outside: "text-gray-200 opacity-30 font-medium",
              }}
            />
          </div>
        </div>

        <style jsx global>{`
          .calendar-modern-wrapper .rdp-month {
            width: 100%;
          }
          .calendar-modern-wrapper .rdp-day_delivered {
            background-color: #22c55e !important;
            color: white !important;
            font-weight: 800 !important;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
          }
          .calendar-modern-wrapper .rdp-day_paused {
            background-color: #fef3c7 !important;
            color: #d97706 !important;
            font-weight: 800 !important;
          }
          .calendar-modern-wrapper .rdp-day_skipped {
            background-color: #fee2e2 !important;
            color: #dc2626 !important;
            opacity: 0.5;
            text-decoration: line-through;
          }
        `}</style>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Delivered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pending</span>
            </div>
          </div>

          <AdminButton variant="secondary" onClick={onClose} className="px-8 py-3 h-auto text-sm font-black rounded-2xl bg-gray-900 text-white hover:bg-black shadow-xl shadow-gray-900/10 transition-all active:scale-95">
            Done
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  );
}
