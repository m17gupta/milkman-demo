import { createAsyncThunk } from "@reduxjs/toolkit";

export type AreaRecord = {
  code: string;
  name: string | { en: string; hi?: string; pa?: string };
  isActive: boolean;
  sortOrder: number;
};

export const fetchAreas = createAsyncThunk("areas/fetchAreas", async () => {
  const res = await fetch("/api/areas");
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? "Failed to fetch areas");
  }
  const data = await res.json();
  return data.areas as AreaRecord[];
});

export const fetchArea = createAsyncThunk(
  "areas/fetchArea",
  async (code: string) => {
    const res = await fetch(`/api/areas/${code}`);
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to fetch area");
    }
    const data = await res.json();
    return data.area as AreaRecord;
  },
);

export type CreateAreaPayload = {
  code?: string;
  name: string | { en: string; hi?: string; pa?: string };
};

export const createArea = createAsyncThunk(
  "areas/createArea",
  async (payload: CreateAreaPayload) => {
    const res = await fetch("/api/areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to create area");
    }
    const data = await res.json();
    return data.area as AreaRecord;
  },
);

export type UpdateAreaPayload = {
  code: string;
  data: { code?: string; name?: string; isActive?: boolean };
};

export const updateArea = createAsyncThunk(
  "areas/updateArea",
  async ({ code, data }: UpdateAreaPayload) => {
    const res = await fetch(`/api/areas/${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to update area");
    }
    const body = await res.json();
    return body.area as AreaRecord;
  },
);

export const deleteArea = createAsyncThunk(
  "areas/deleteArea",
  async (code: string) => {
    const res = await fetch(`/api/areas/${code}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to delete area");
    }
    return code;
  },
);
