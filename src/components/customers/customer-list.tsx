"use client";

import { useState, useMemo } from "react";
import { Filter, Search, CirclePlus, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CustomerListItem } from "./customer-list-item";
import { CustomerDetailModal } from "./customer-detail-modal";

type CustomerListEntry = {
  id: string;
  customerCode: string;
  name: string;
  phone: string;
  address: string;
  areaCode: string;
  status: string;
  areaName: string;
  quantityLabel: string;
  quantity: number;
  rate: number;
  due: number;
  advance: number;
  billed: number;
  paid: number;
  notes?: string;
  deliveryInstruction?: string;
  deliverySlot?: string;
  deliveryStatus?: string | null;
  extraQuantity?: number;
  lastPaymentDate?: string | Date | null;
};

type AreaOption = {
  code: string;
  name: string | {
    en: string;
    hi: string;
    pa: string;
  };
};

type CustomerListProps = {
  customers: CustomerListEntry[];
  areas: AreaOption[];
  locale: string;
};

export function CustomerList({ customers, areas, locale }: CustomerListProps) {
  const t = useTranslations("admin.customers");
  const tCommon = useTranslations("common");
  const localizedAreas = areas.map((area) => ({
    code: area.code,
    name: typeof area.name === "string"
      ? area.name
      : area.name[locale as keyof typeof area.name] || area.name.en,
  }));

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerListEntry | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'details' | 'edit' | 'schedule'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // SEARCH & FILTER LOGIC[cite: 1]
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm);

      const matchesFilter = activeFilter === "ALL" || c.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [customers, searchTerm, activeFilter]);

  const handleViewCustomer = (customer: CustomerListEntry, mode: 'view' | 'details' | 'edit' | 'schedule' = 'view') => {
    setSelectedCustomer(customer);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* SEARCH, FILTER & ADD BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search customer"
            className="w-full bg-[#f8fafc] border border-transparent focus:border-gray-200 focus:bg-white rounded-xl py-3 pl-12 pr-10 outline-none text-sm font-medium transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <select
            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 text-xs font-black text-gray-600 outline-none cursor-pointer hover:bg-gray-50 transition-all"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <Link
            href={`/${locale}/admin/customers/new`}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#064e3b] text-white rounded-xl text-sm font-bold shadow-lg shadow-green-900/10 hover:bg-black transition-all"
          >
            <CirclePlus size={18} />
            Add customer
          </Link>
        </div>
      </div>

      {/* RENDER FILTERED LIST */}
      <section className="grid gap-1">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <CustomerListItem
              key={customer.id}
              customer={customer}
              locale={locale}
              onView={(mode) => handleViewCustomer(customer, mode)}
              isMenuOpen={openMenuId === customer.id}
              setMenuOpen={(isOpen) => setOpenMenuId(isOpen ? customer.id : null)}
            />
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No customers found</p>
          </div>
        )}
      </section>

      <CustomerDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
        areas={localizedAreas}
        locale={locale}
        mode={modalMode}
      />
    </div>
  );
}
