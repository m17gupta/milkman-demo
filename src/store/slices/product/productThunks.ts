import { createAsyncThunk } from "@reduxjs/toolkit";

export type ProductRecord = {
  _id?: string;
  code: string;
  name: string;
  category: "MILK" | "DAIRY_ADDON" | "OTHER";
  unit: string;
  defaultRate: number;
  isActive: boolean;
  sortOrder: number;
};

export const fetchProducts = createAsyncThunk("products/fetchProducts", async () => {
  const res = await fetch("/api/products");
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? "Failed to fetch products");
  }
  const data = await res.json();
  return data.products as ProductRecord[];
});

export const fetchProduct = createAsyncThunk(
  "products/fetchProduct",
  async (code: string) => {
    const res = await fetch(`/api/products/${code}`);
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to fetch product");
    }
    const data = await res.json();
    return data.product as ProductRecord;
  },
);

export type CreateProductPayload = {
  code?: string;
  name: string;
  category: "MILK" | "DAIRY_ADDON" | "OTHER";
  unit: string;
  defaultRate: number;
  isActive?: boolean;
};

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (payload: CreateProductPayload) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to create product");
    }
    const data = await res.json();
    return data.product as ProductRecord;
  },
);

export type UpdateProductPayload = {
  code: string;
  data: Partial<{
    name: string;
    category: string;
    unit: string;
    defaultRate: number;
    isActive: boolean;
  }>;
};

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ code, data }: UpdateProductPayload) => {
    const res = await fetch(`/api/products/${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to update product");
    }
    const body = await res.json();
    return body.product as ProductRecord;
  },
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (code: string) => {
    const res = await fetch(`/api/products/${code}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to delete product");
    }
    return code;
  },
);
