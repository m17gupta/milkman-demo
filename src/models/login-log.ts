import { Schema, model, models } from "mongoose";

const loginLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
    },
    role: {
      type: String,
      required: true,
    },
    loginTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    collection: "login_logs",
    timestamps: false,
  }
);

export const LoginLog = models.LoginLog || model("LoginLog", loginLogSchema);
