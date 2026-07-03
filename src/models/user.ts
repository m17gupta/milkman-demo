import { Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["CUSTOMER", "ADMIN", "SUPER_ADMIN"],
      required: true,
      default: "CUSTOMER",
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
    },
    name: {
      en: { type: String, trim: true },
      hi: { type: String, trim: true },
      pa: { type: String, trim: true },
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    preferredLanguage: {
      type: String,
      enum: ["en", "hi", "pa"],
      default: "en",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    lastLoginAt: {
      type: Date,
    },
    lastLoginIp: {
      type: String,
    },
    lastLogoutAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const User = models.User || model("User", userSchema);
