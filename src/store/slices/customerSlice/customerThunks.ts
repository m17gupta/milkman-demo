import { createAsyncThunk } from "@reduxjs/toolkit";

export type CustomerRecord = {
  id: string;
  customerCode: string;
  name: string;
  phone: string;
  address: string;
  areaCode: string;
  status: "ACTIVE" | "PAUSED" | "INACTIVE";
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
  preferredLanguage?: "en" | "hi" | "pa";
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
};

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async () => {
    const res = await fetch("/api/customers");
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to fetch customers");
    }
    const data = await res.json();
    return data.customers as CustomerRecord[];
  }
);

export const fetchCustomer = createAsyncThunk(
  "customers/fetchCustomer",
  async (customerCode: string) => {
    const res = await fetch(`/api/customers/${customerCode}`);
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to fetch customer");
    }
    const data = await res.json();
    return data.customer as CustomerRecord;
  }
);

export type CreateCustomerPayload = {
  name: string;
  phone: string;
  preferredLanguage?: "en" | "hi" | "pa";
  addressLine1: string;
  addressLine2?: string;
  areaCode: string;
  landmark?: string;
  notes?: string;
  deliveryInstruction?: string;
  quantityLiters: number;
  pricePerLiter: number;
  unitLabel?: string;
  status?: "ACTIVE" | "PAUSED" | "INACTIVE";
};

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (payload: CreateCustomerPayload) => {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to create customer");
    }
    const data = await res.json();
    return data.profile as CustomerRecord;
  }
);

export type UpdateCustomerPayload = {
  customerCode: string;
  data: Partial<CreateCustomerPayload>;
};

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ customerCode, data }: UpdateCustomerPayload) => {
    const res = await fetch(`/api/customers/${customerCode}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to update customer");
    }
    const body = await res.json();
    return body.profile as CustomerRecord;
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (customerCode: string) => {
    const res = await fetch(`/api/customers/${customerCode}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to delete customer");
    }
    return customerCode;
  }
);
