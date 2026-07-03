import { createAsyncThunk } from "@reduxjs/toolkit";

export type UserRecord = {
  id: string;
  phone: string;
  role: string;
  name: string;
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (phone: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Login failed");
    }

    const data = await res.json();
    return { user: data.user as UserRecord, token: data.token as string };
  },
);
