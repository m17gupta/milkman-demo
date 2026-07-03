import { createAsyncThunk } from "@reduxjs/toolkit";

export type VendorRecord = {
  _id?: string;
  code: string;
  name: string;
  phone?: string;
  defaultRate?: number;
  areaCode?: string;
  areaName?: string;
  notes?: string;
  isActive: boolean;
  sortOrder: number;
};

export const fetchVendors = createAsyncThunk("vendors/fetchVendors", async () => {
  const res = await fetch("/api/vendors");
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? "Failed to fetch vendors");
  }
  const data = await res.json();
  return data.vendors as VendorRecord[];
});

export const fetchVendor = createAsyncThunk(
  "vendors/fetchVendor",
  async (code: string) => {
    const res = await fetch(`/api/vendors/${code}`);
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to fetch vendor");
    }
    const data = await res.json();
    return data.vendor as VendorRecord;
  },
);

export type CreateVendorPayload = {
  code?: string;
  name: string;
  phone?: string;
  defaultRate?: number;
  areaCode?: string;
  notes?: string;
  isActive?: boolean;
};

export const createVendor = createAsyncThunk(
  "vendors/createVendor",
  async (payload: CreateVendorPayload) => {
    const res = await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to create vendor");
    }
    const data = await res.json();
    return data.vendor as VendorRecord;
  },
);

export type UpdateVendorPayload = {
  code: string;
  data: Partial<{
    name: string;
    phone: string;
    defaultRate: number;
    areaCode: string;
    notes: string;
    isActive: boolean;
  }>;
};

export const updateVendor = createAsyncThunk(
  "vendors/updateVendor",
  async ({ code, data }: UpdateVendorPayload) => {
    const res = await fetch(`/api/vendors/${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to update vendor");
    }
    const body = await res.json();
    return body.vendor as VendorRecord;
  },
);

export const deleteVendor = createAsyncThunk(
  "vendors/deleteVendor",
  async (code: string) => {
    const res = await fetch(`/api/vendors/${code}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to delete vendor");
    }
    return code;
  },
);
