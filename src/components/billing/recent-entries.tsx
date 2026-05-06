"use client";

import { useState } from "react";
import { Clock, Info, ChevronRight, Search, Filter, Calendar, ChevronDown, ChevronUp, History, WalletCards, CheckCircle2 } from "lucide-react";
import { AdminBadge, AdminButton } from "@/components/layout/admin-ui";
import { AdminModal } from "@/components/layout/admin-modal";
import { formatCurrencyINR, cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";

type Transaction = {
  id: string;
  amount: number;
  mode: string;
  date: Date | string;
  note: string;
};

type GroupedPayment = {
  customerId: string;
  customerCode: string;
  customerName: string;
  date: Date;
  dateLabel: string;
  totalAmount: number;
  transactions: Transaction[];
};

type RecentEntriesProps = {
  payments: GroupedPayment[];
  customers: any[]; // Full customer data for billing summary
  viewAllLabel: string;
};

export function RecentEntries({ payments, customers, viewAllLabel }: RecentEntriesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupedPayment | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // History Modal States
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

  const initialLimit = 4;
  const hasMore = payments.length > initialLimit;
  const moreCount = payments.length - initialLimit;
  
  const displayedPayments = isExpanded ? payments : payments.slice(0, initialLimit);

  // Helper to format real-time activity
  const formatActivityTime = (dateInput: Date | string, fallbackLabel: string) => {
    const d = new Date(dateInput);
    const now = new Date();
    
    const timeStr = d.toLocaleTimeString("en-IN", { 
      hour: "numeric", 
      minute: "2-digit", 
      hour12: true,
      timeZone: "Asia/Kolkata" 
    });

    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) return `Today \u2022 ${timeStr}`;
    if (isYesterday) return `Yesterday \u2022 ${timeStr}`;
    
    // Default to the localized date + time
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata"
    }).format(d);
  };

  // Helper to get customer billing state
  const getCustomerSummary = (customerCode: string) => {
    return customers.find(c => c.customerCode === customerCode);
  };

  const filterPayments = (list: GroupedPayment[]) => {
    return list.filter(p => {
      const matchesSearch = p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.customerCode.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMode = modeFilter === "all" || p.transactions.some(t => t.mode === modeFilter);
      
      const pDate = new Date(p.date).toDateString();
      const matchesTime = timeFilter === "all" || 
                         (timeFilter === "today" && pDate === todayStr) ||
                         (timeFilter === "yesterday" && pDate === yesterdayStr) ||
                         (timeFilter === "recent" && pDate !== todayStr && pDate !== yesterdayStr);

      return matchesSearch && matchesMode && matchesTime;
    });
  };

  const filteredHistory = filterPayments(payments);

  return (
    <>
      <div className="mt-5 grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {displayedPayments.map((group, index) => (
          <div
            key={`${group.customerId}-${group.dateLabel}-${index}`}
            className="admin-panel-muted flex flex-col gap-2 rounded-[24px] p-3 transition-all hover:bg-[var(--admin-primary-soft)]/40 sm:gap-3 sm:p-4"
          >
            <div className="flex items-center justify-between gap-1">
              <p className="truncate text-[13px] font-bold text-[var(--admin-text)] sm:text-sm" title={group.customerName}>
                {group.customerName}
              </p>
              <AdminBadge tone="success" className="flex-shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase leading-none sm:text-[9px]">
                {group.transactions[0]?.mode || "UPI"}
              </AdminBadge>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--admin-muted)]">
              <Clock className="h-3 w-3" />
              {formatActivityTime(group.transactions[0]?.date || group.date, group.dateLabel)}
            </div>

            <div className="mt-0.5 flex items-center justify-between">
              <p className="text-[15px] font-black text-emerald-600 sm:text-sm sm:font-extrabold">
                {formatCurrencyINR(group.totalAmount)}
              </p>
              
              <button 
                onClick={() => setSelectedGroup(group)}
                className="flex items-center gap-1 text-[9px] font-bold text-[var(--admin-primary)] hover:underline"
              >
                <Info className="h-3 w-3" />
                Details
              </button>
            </div>
          </div>
        ))}

        {!isExpanded && hasMore && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(true);
            }}
            className="admin-panel-muted group relative flex flex-col items-center justify-center gap-1 rounded-[24px] p-4 border border-dashed border-[var(--admin-border)] bg-[var(--admin-primary-soft)]/10 hover:bg-[var(--admin-primary-soft)]/20 transition-all active:scale-95 cursor-pointer z-10"
          >
            <p className="text-xl font-black text-[var(--admin-primary)]">+{moreCount}</p>
            <p className="text-[9px] font-bold text-[var(--admin-muted)] uppercase tracking-wider group-hover:text-[var(--admin-primary)] transition-colors">More History</p>
          </button>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 relative z-20">
        {isExpanded && (
           <button 
             type="button"
             onClick={() => setIsExpanded(false)}
             className="flex items-center gap-2 text-xs font-bold text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors cursor-pointer"
           >
             <ChevronUp className="h-4 w-4" />
             Show Less
           </button>
        )}
        
        <AdminButton 
          variant="outline" 
          onClick={() => setShowHistoryModal(true)}
          className="rounded-[20px] px-8 py-2.5 font-bold flex items-center gap-2 group transition-all hover:bg-[var(--admin-primary)] hover:text-white cursor-pointer"
        >
          <History className="h-4 w-4" />
          {viewAllLabel}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </AdminButton>
      </div>

      {/* Improved Payment Details Modal - Optimized for Mobile */}
      <AdminModal
        isOpen={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        title={`Ledger: ${selectedGroup?.customerName}`}
      >
        <div className="space-y-5 sm:space-y-6">
          {/* 1. Billing Summary - Responsive Grid */}
          {(() => {
            const summary = selectedGroup ? getCustomerSummary(selectedGroup.customerCode) : null;
            if (!summary) return null;
            
            return (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="flex gap-3 sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-3">
                  <div className="flex-1 rounded-2xl bg-slate-50 p-3 border border-slate-100 sm:p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400 sm:tracking-wider">Total Bill</p>
                    <p className="text-sm font-bold text-slate-700 sm:text-base">{formatCurrencyINR(summary.billed)}</p>
                  </div>
                  <div className="flex-1 rounded-2xl bg-emerald-50 p-3 border border-emerald-100 sm:p-4">
                    <p className="text-[10px] font-bold uppercase text-emerald-500 sm:tracking-wider">Total Paid</p>
                    <p className="text-sm font-bold text-emerald-700 sm:text-base">{formatCurrencyINR(summary.paid)}</p>
                  </div>
                </div>

                <div className={cn(
                  "rounded-2xl p-4 border sm:col-span-2",
                  summary.advance > 0 ? "bg-emerald-100 border-emerald-200" : "bg-rose-50 border-rose-100"
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase opacity-60">
                        {summary.advance > 0 ? "Advance Balance" : "Remaining Due"}
                      </p>
                      <p className={cn("text-lg font-black sm:text-xl", summary.advance > 0 ? "text-emerald-800" : "text-rose-600")}>
                        {formatCurrencyINR(summary.advance > 0 ? summary.advance : summary.due)}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50">
                      {summary.due === 0 && summary.advance >= 0 ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <WalletCards className="h-5 w-5 text-rose-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 2. Transaction Details / Ledger Activity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm font-bold text-[var(--admin-text)]">Ledger Activity</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-muted)]">Verified Record</p>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {selectedGroup?.transactions.map((tx) => {
                return (
                  <div key={tx.id} className="rounded-2xl bg-[var(--admin-panel-muted)] p-3.5 border border-transparent hover:border-[var(--admin-border)] hover:bg-white transition-all sm:p-4">
                    <div className="flex flex-col gap-2">
                      {/* Top Row: Mode and Amount */}
                      <div className="flex items-center justify-between">
                         <p className="text-xs font-bold text-[var(--admin-text)] sm:text-sm">{tx.mode} Payment</p>
                         <p className="text-base font-black text-emerald-600 sm:text-lg">{formatCurrencyINR(tx.amount)}</p>
                      </div>

                      {/* Middle Row: Status and Time */}
                      <div className="flex items-center justify-between">
                        <AdminBadge tone="success" className="rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider sm:text-[9px]">Success</AdminBadge>
                        <p className="text-[10px] font-bold text-[var(--admin-muted)] uppercase tracking-tight sm:text-[11px]">
                           {formatActivityTime(tx.date, selectedGroup.dateLabel)}
                        </p>
                      </div>

                      {tx.note && (
                        <div className="mt-1 flex items-start gap-2 rounded-xl bg-white/50 p-2.5 border border-slate-50 sm:p-3">
                          <Info className="h-3.5 w-3.5 mt-0.5 text-[var(--admin-muted)]" />
                          <p className="text-[10px] font-medium text-[var(--admin-muted)] leading-relaxed italic sm:text-[11px]">
                            "{tx.note}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex pt-2">
            <AdminButton 
              onClick={() => setSelectedGroup(null)} 
              className="w-full rounded-2xl py-3.5 font-bold shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all sm:w-auto sm:ml-auto sm:px-12 sm:py-3"
            >
              Done
            </AdminButton>
          </div>
        </div>
      </AdminModal>


      {/* Global History Modal */}
      <AdminModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Complete Payment History"
      >
        <div className="space-y-6">
          {/* Filters Area */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
              <input 
                type="text"
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel-muted)] py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-[var(--admin-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--admin-primary-soft)]/20"
              />
            </div>

            <div className="flex flex-wrap gap-2">
               <div className="flex rounded-xl bg-[var(--admin-panel-muted)] p-1">
                 {["all", "UPI", "CASH", "BANK"].map((mode) => (
                   <button
                     key={mode}
                     onClick={() => setModeFilter(mode)}
                     className={cn(
                       "rounded-lg px-3 py-1 text-[10px] font-bold uppercase transition-all",
                       modeFilter === mode ? "bg-white text-[var(--admin-primary)] shadow-sm" : "text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
                     )}
                   >
                     {mode}
                   </button>
                 ))}
               </div>

               <div className="flex rounded-xl bg-[var(--admin-panel-muted)] p-1">
                 {["all", "today", "yesterday", "recent"].map((time) => (
                   <button
                     key={time}
                     onClick={() => setTimeFilter(time)}
                     className={cn(
                       "rounded-lg px-3 py-1 text-[10px] font-bold uppercase transition-all",
                       timeFilter === time ? "bg-white text-[var(--admin-primary)] shadow-sm" : "text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
                     )}
                   >
                     {time}
                   </button>
                 ))}
               </div>
            </div>
          </div>

          {/* List Area */}
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {filteredHistory.length > 0 ? filteredHistory.map((group, idx) => (
              <div 
                key={`${group.customerId}-${idx}`}
                className="flex items-center justify-between rounded-2xl border border-[var(--admin-border)] p-4 transition-all hover:bg-[var(--admin-primary-soft)]/10"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[var(--admin-text)]">{group.customerName}</p>
                    <span className="text-[10px] font-bold text-[var(--admin-muted)]">#{group.customerCode}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--admin-muted)]">
                      <Calendar className="h-3 w-3" />
                      {formatActivityTime(group.transactions[0]?.date || group.date, group.dateLabel)}
                    </span>
                    <div className="flex gap-1">
                      {Array.from(new Set(group.transactions.map(t => t.mode))).map(m => (
                        <AdminBadge key={m} tone="blue" className="text-[8px] px-1 py-0">{m}</AdminBadge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-emerald-600">{formatCurrencyINR(group.totalAmount)}</p>
                  <button 
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowHistoryModal(false);
                    }}
                    className="text-[10px] font-bold text-[var(--admin-primary)] hover:underline"
                  >
                    Details
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center opacity-40">
                <Filter className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm font-bold uppercase tracking-widest">No entries found</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <AdminButton variant="outline" onClick={() => setShowHistoryModal(false)} className="rounded-xl px-10 font-bold">
              Close History
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </>
  );
}
