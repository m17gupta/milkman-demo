"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  BadgeIndianRupee, 
  ChevronRight, 
  CircleDollarSign, 
  Clock, 
  History, 
  Plus, 
  WalletCards,
  CheckCircle2
} from "lucide-react";
import { useTranslations } from "next-intl";
import { 
  AdminBadge, 
  AdminButton, 
  AdminCard, 
  AdminField, 
  AdminInput, 
  AdminSelect 
} from "@/components/layout/admin-ui";
import { AdminModal } from "@/components/layout/admin-modal";
import { formatCurrencyINR, cn } from "@/lib/utils";

type Payment = {
  id: string;
  amount: number;
  date: string | Date;
  dateLabel: string;
  mode: string;
  note: string;
};

type CustomerAccount = {
  id: string;
  customerCode: string;
  name: string;
  phone: string;
  areaCode: string;
  areaName: string;
  billed: number;
  paid: number;
  due: number;
  advance: number;
  lastPayment: {
    amount: number;
    date: string | Date;
    dateLabel: string;
    mode: string;
  } | null;
  paymentHistory: Payment[];
};

type BillingManagementProps = {
  customers: CustomerAccount[];
};

export function BillingManagement({ customers }: BillingManagementProps) {
  const router = useRouter();
  const t = useTranslations("admin.billing");
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAccount | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("UPI");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const openPaymentModal = (customer: CustomerAccount) => {
    setSelectedCustomer(customer);
    setAmount("");
    setMode("UPI");
    setNote("");
    setFeedback(null);
    setIsPaymentModalOpen(true);
  };

  const openHistoryModal = (customer: CustomerAccount) => {
    setSelectedCustomer(customer);
    setIsHistoryModalOpen(true);
  };

  const handleSavePayment = async () => {
    if (!selectedCustomer || !amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerCode: selectedCustomer.customerCode,
          amount: Number(amount),
          mode,
          note,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save payment");
      }

      setFeedback({
        message: `₹${amount} received from ${selectedCustomer.name}`,
        type: "success",
      });

      // Clear form after a short delay and close modal
      setTimeout(() => {
        setIsPaymentModalOpen(false);
        router.refresh();
      }, 1500);

    } catch (error) {
      setFeedback({
        message: "Unable to save payment. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic Calculation Logic for Modal
  const paymentAmount = Number(amount) || 0;
  const currentBilled = selectedCustomer?.billed || 0;
  const alreadyPaid = selectedCustomer?.paid || 0;
  const currentDue = selectedCustomer?.due || 0;
  const currentAdvance = selectedCustomer?.advance || 0;
  
  // 1. Grouping and Sorting Logic
  const groupedCustomers = useMemo(() => {
    const groups = {
      advance: [] as CustomerAccount[],
      fullyPaid: [] as CustomerAccount[],
      partialDue: [] as CustomerAccount[],
      highDue: [] as CustomerAccount[],
      noPayments: [] as CustomerAccount[],
    };

    customers.forEach(customer => {
      if (customer.advance > 0) {
        groups.advance.push(customer);
      } else if (customer.due === 0 && customer.paid > 0) {
        groups.fullyPaid.push(customer);
      } else if (customer.due > 0 && customer.paid > 0) {
        groups.partialDue.push(customer);
      } else if (customer.due > 0 && customer.paid === 0) {
        groups.highDue.push(customer);
      } else {
        groups.noPayments.push(customer);
      }
    });

    // Sorting within groups
    const sortByLatestPayment = (a: CustomerAccount, b: CustomerAccount) => {
      const dateA = a.lastPayment ? new Date(a.lastPayment.date).getTime() : 0;
      const dateB = b.lastPayment ? new Date(b.lastPayment.date).getTime() : 0;
      return dateB - dateA;
    };

    const sortByAmountDesc = (key: 'advance' | 'due') => (a: CustomerAccount, b: CustomerAccount) => b[key] - a[key];

    groups.advance.sort(sortByAmountDesc('advance'));
    groups.fullyPaid.sort(sortByLatestPayment);
    groups.partialDue.sort(sortByLatestPayment);
    groups.highDue.sort(sortByAmountDesc('due'));
    
    return [
      { id: 'advance', label: 'Advance Balance', items: groups.advance, tone: 'success' },
      { id: 'fullyPaid', label: 'Fully Paid', items: groups.fullyPaid, tone: 'success' },
      { id: 'partialDue', label: 'Partial Due', items: groups.partialDue, tone: 'warning' },
      { id: 'highDue', label: 'High Due', items: groups.highDue, tone: 'danger' },
      { id: 'noPayments', label: 'No Payments Yet', items: groups.noPayments, tone: 'muted' },
    ].filter(group => group.items.length > 0);
  }, [customers]);

  // Logic: 
  // If customer has due, payment first clears due.
  // If payment > due, the rest adds to advance.
  const netDueBefore = currentDue > 0 ? currentDue : -currentAdvance;
  const netDueAfter = netDueBefore - paymentAmount;
  
  const displayRemainingDue = netDueAfter > 0 ? netDueAfter : 0;
  const displayNewAdvance = netDueAfter < 0 ? Math.abs(netDueAfter) : 0;

  return (
    <>
      <div className="mt-6 space-y-8">
        {groupedCustomers.map((group) => (
          <div key={group.id} className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <h3 className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] sm:text-xs",
                group.tone === 'success' ? "text-emerald-600" : 
                group.tone === 'warning' ? "text-amber-600" :
                group.tone === 'danger' ? "text-rose-600" : "text-slate-400"
              )}>
                {group.label}
              </h3>
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-300">{group.items.length}</span>
            </div>

            <div className="grid gap-4">
              {group.items.map((account) => (
                <article 
                  key={account.customerCode} 
                  className="admin-panel-muted group relative rounded-[28px] p-4 sm:p-5 transition-all hover:bg-[var(--admin-primary-soft)]/40 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:gap-6">
                    {/* Row 1: Name + Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <h3 className="truncate text-base font-bold text-[var(--admin-text)] sm:text-xl">
                          {account.name && !account.name.startsWith("CUST-") ? account.name : (account.phone || account.customerCode)}
                        </h3>
                        <AdminBadge 
                          tone={account.advance > 0 ? "success" : account.due > 0 ? "warning" : "success"} 
                          className={cn(
                            "flex-shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight sm:px-3 sm:py-1 sm:text-[11px]",
                            account.advance > 0 ? "bg-emerald-100 text-emerald-700" : account.due > 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                          )}
                        >
                          {account.advance > 0 ? `Advance ₹${account.advance}` : account.due > 0 ? `Due ₹${account.due}` : "Fully Paid ✅"}
                        </AdminBadge>
                      </div>

                      <AdminButton 
                        onClick={() => openPaymentModal(account)}
                        className="h-9 flex-shrink-0 flex items-center justify-center gap-1 rounded-xl px-3 py-2 shadow-lg shadow-blue-500/10 active:scale-95 transition-all sm:h-12 sm:gap-2 sm:px-6 sm:py-3"
                      >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-[13px] font-bold sm:text-base">Pay</span>
                      </AdminButton>
                    </div>

                    {/* Row 2: Last Payment */}
                    <div className="flex items-center justify-between">
                      {account.lastPayment ? (
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--admin-muted)] sm:text-sm">
                          <Clock className="h-3.5 w-3.5 text-[var(--admin-primary)] sm:h-4 sm:w-4" />
                          Last: <span className="text-[var(--admin-text)]">{formatCurrencyINR(account.lastPayment.amount)}</span>
                          <span className="hidden sm:inline"> ({account.lastPayment.dateLabel}, {account.lastPayment.mode})</span>
                        </p>
                      ) : (
                        <p className="flex items-center gap-1.5 text-[11px] text-[var(--admin-muted)] italic sm:text-sm">
                          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          No payments yet
                        </p>
                      )}

                      <button 
                        onClick={() => openHistoryModal(account)}
                        className="flex items-center gap-1 text-xs font-bold text-[var(--admin-primary)] hover:underline sm:text-sm"
                      >
                        <History className="h-3.5 w-3.5 sm:h-4 w-4" />
                        History
                      </button>
                    </div>

                    {/* Row 3: 3-Column Grid */}
                    <div className="grid grid-cols-3 gap-2 border-t border-[var(--admin-border)]/30 pt-3 sm:flex sm:flex-wrap sm:gap-x-8 sm:border-0 sm:pt-1">
                      <div className="flex flex-col items-center sm:items-start">
                        <p className="text-[10px] font-bold uppercase tracking-tight text-[var(--admin-muted)] sm:tracking-widest">Billed</p>
                        <p className="text-sm font-bold text-[var(--admin-text)] sm:text-lg">{formatCurrencyINR(account.billed)}</p>
                      </div>
                      <div className="flex flex-col items-center sm:items-start">
                        <p className="text-[10px] font-bold uppercase tracking-tight text-[var(--admin-muted)] sm:tracking-widest">Paid</p>
                        <p className="text-sm font-bold text-emerald-600 sm:text-lg">{formatCurrencyINR(account.paid)}</p>
                      </div>
                      <div className={cn(
                        "flex flex-col items-center sm:items-start rounded-xl sm:px-4 sm:py-1 sm:-ml-4",
                        account.advance > 0 ? "bg-emerald-50/50 sm:bg-emerald-50/50" : "bg-amber-50/50 sm:bg-white/50"
                      )}>
                        <p className="text-[10px] font-bold uppercase tracking-tight text-[var(--admin-muted)] sm:tracking-widest">
                          {account.advance > 0 ? "Advance" : "Balance Due"}
                        </p>
                        <p className={cn(
                          "text-sm font-black sm:text-lg",
                          account.advance > 0 ? "text-emerald-700" : "text-amber-600"
                        )}>
                          {formatCurrencyINR(account.advance > 0 ? account.advance : account.due)}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}

        {groupedCustomers.length === 0 && (
          <div className="py-20 text-center opacity-20">
            <History className="mx-auto h-12 w-12" />
            <p className="mt-4 text-lg font-bold uppercase tracking-widest">No matching customers</p>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      <AdminModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Collect Payment: ${selectedCustomer?.name}`}
      >
        <div className="space-y-6">
          {/* Billing Summary Card */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
             <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Bill</p>
                  <p className="text-sm font-bold text-slate-700">{formatCurrencyINR(currentBilled)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paid Till Now</p>
                  <p className="text-sm font-bold text-emerald-600">{formatCurrencyINR(alreadyPaid)}</p>
                </div>
                <div className="col-span-2 space-y-1 sm:col-span-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Due</p>
                  <p className={cn(
                    "text-sm font-black",
                    currentDue > 0 ? "text-amber-600" : "text-emerald-600"
                  )}>
                    {currentDue > 0 ? formatCurrencyINR(currentDue) : `Advance: ${formatCurrencyINR(currentAdvance)}`}
                  </p>
                </div>
             </div>
          </div>

          {feedback ? (
            <div className={cn(
              "flex items-center gap-3 rounded-[24px] p-5 animate-in fade-in slide-in-from-top-4 duration-500",
              feedback.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
            )}>
              {feedback.type === "success" && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
              <p className="text-base font-bold">{feedback.message}</p>
            </div>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2">
            <AdminField label="Amount to pay (₹)">
              <div className="relative">
                <AdminInput 
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg font-bold py-4 pr-12"
                  autoFocus
                />
                {paymentAmount > 0 && (
                  <div className="absolute inset-y-0 right-4 flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                )}
              </div>
            </AdminField>
            
            <AdminField label="Payment Mode">
              <AdminSelect 
                value={mode} 
                onChange={(e) => setMode(e.target.value)}
                className="text-base font-semibold py-4"
              >
                <option value="UPI">UPI Payment</option>
                <option value="CASH">Cash Payment</option>
                <option value="BANK">Bank Transfer</option>
              </AdminSelect>
            </AdminField>
          </div>

          {/* Real-time Calculation Preview */}
          {paymentAmount > 0 && (
            <div className="rounded-2xl bg-[var(--admin-primary-soft)]/20 p-4 border border-dashed border-[var(--admin-primary)]/30">
               <div className="flex items-center justify-between">
                 <p className="text-sm font-bold text-[var(--admin-text)]">After Payment Preview:</p>
                 <div className="text-right">
                   {displayRemainingDue > 0 ? (
                     <div className="flex flex-col items-end">
                       <p className="text-xs font-bold text-[var(--admin-muted)] uppercase">Remaining Due</p>
                       <p className="text-lg font-black text-amber-600">{formatCurrencyINR(displayRemainingDue)}</p>
                     </div>
                   ) : (
                     <div className="flex flex-col items-end">
                       <p className="text-xs font-bold text-[var(--admin-muted)] uppercase">
                         {displayNewAdvance > 0 ? "New Advance Balance" : "Payment Status"}
                       </p>
                       <p className="text-lg font-black text-emerald-600">
                         {displayNewAdvance > 0 ? formatCurrencyINR(displayNewAdvance) : "Fully Paid ✅"}
                       </p>
                     </div>
                   )}
                 </div>
               </div>
            </div>
          )}

          <AdminField label="Optional Note">
            <AdminInput 
              placeholder="e.g. Received at doorstep"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="py-4"
            />
          </AdminField>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
            <AdminButton 
              variant="outline" 
              onClick={() => setIsPaymentModalOpen(false)}
              className="rounded-2xl px-8 py-4 font-bold sm:w-auto"
            >
              Cancel
            </AdminButton>
            <AdminButton 
              onClick={handleSavePayment} 
              disabled={isSubmitting || !amount || Number(amount) <= 0}
              className="rounded-2xl px-10 py-4 font-bold shadow-xl shadow-blue-500/20 sm:w-auto"
            >
              {isSubmitting ? "Saving Entry..." : "Save Payment"}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      {/* History Modal */}
      <AdminModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Payment History: ${selectedCustomer?.name}`}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-2xl bg-[var(--admin-primary-soft)]/30 p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Monthly Billed</p>
              <p className="text-xl font-bold text-[var(--admin-text)]">{formatCurrencyINR(selectedCustomer?.billed || 0)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">Advance Balance</p>
              <p className="text-xl font-black text-emerald-600">{formatCurrencyINR(selectedCustomer?.advance || 0)}</p>
            </div>
          </div>

          {selectedCustomer?.paymentHistory && selectedCustomer.paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {selectedCustomer.paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-2xl bg-[var(--admin-panel-muted)] p-4 border border-transparent hover:border-[var(--admin-border)] transition-all">
                  <div className="space-y-1">
                    <p className="text-base font-bold text-[var(--admin-text)]">
                      {payment.dateLabel}
                    </p>
                    <div className="flex items-center gap-2">
                      <AdminBadge tone="blue" className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase">{payment.mode}</AdminBadge>
                      {payment.note && (
                        <p className="text-xs font-medium text-[var(--admin-muted)] italic">
                          {payment.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-emerald-600">
                      {formatCurrencyINR(payment.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--admin-panel-muted)] text-[var(--admin-muted)]">
                <History className="h-10 w-10 opacity-20" />
              </div>
              <p className="mt-6 text-lg font-bold text-[var(--admin-muted)]">No payments recorded yet</p>
              <p className="mt-2 text-sm text-[var(--admin-muted)] opacity-60">Add a payment to see it here.</p>
            </div>
          )}
          
          <div className="flex justify-end pt-2">
            <AdminButton 
              variant="outline" 
              onClick={() => setIsHistoryModalOpen(false)}
              className="rounded-2xl px-10 font-bold"
            >
              Close
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </>
  );
}
