import { createAsyncThunk } from "@reduxjs/toolkit";

export type UserRecord = {
  id: string;
  phone: string;
  role: string;
  name: string;
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ phone, pin }: { phone: string; pin: string }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, pin }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Login failed");
    }

    const data = await res.json();
    console.log("logindatta", data)
    return { user: data.user as UserRecord, token: data.token as string };
  },
);
