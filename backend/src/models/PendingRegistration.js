import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  verificationCode: { type: String, required: true },
  verificationCodeExpiresAt: { type: Date, required: true },
  // MongoDB TTL index: document is auto-deleted 10 minutes after creation
  createdAt: { type: Date, default: Date.now, expires: 600 },
});

export const PendingRegistration = mongoose.model("PendingRegistration", pendingRegistrationSchema);
