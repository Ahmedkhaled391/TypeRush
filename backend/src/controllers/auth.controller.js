import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { PendingRegistration } from "../models/PendingRegistration.js";
import {
  loginSchema,
  profileUpdateSchema,
  signupSchema,
  validateBody,
  verifyEmailSchema,
} from "../validators/auth.validators.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";
import { sendVerificationEmail } from "../services/mail.service.js";
import { env } from "../config/env.js";

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function setRefreshTokenCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/refresh-token",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const signup = asyncHandler(async (req, res) => {
  const validated = validateBody(signupSchema, req.body);
  if (!validated.ok) {
    return res.status(400).json({ success: false, message: "Invalid payload", details: validated.errors });
  }

  const { username, email, password } = validated.data;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }
    return res.status(409).json({ success: false, message: "Username already taken" });
  }

  const existingPending = await PendingRegistration.findOne({ email: email.toLowerCase() });
  if (existingPending) {
    return res.status(409).json({ success: false, message: "A verification email was already sent. Please check your inbox or wait 10 minutes to try again." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationCode = generateVerificationCode();
  const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const pending = await PendingRegistration.create({
    username,
    email,
    passwordHash,
    verificationCode,
    verificationCodeExpiresAt,
  });

  try {
    await sendVerificationEmail({ email: pending.email, username: pending.username, code: verificationCode });
  } catch (mailErr) {
    console.error("[signup] SMTP error:", mailErr?.message || mailErr);
    if (env.NODE_ENV === "production") {
      await PendingRegistration.deleteOne({ _id: pending._id });
      return res.status(500).json({ success: false, message: "Failed to send verification email. Please try again." });
    }
    // In development, log the code and continue so the flow can be tested without valid SMTP
    console.warn(`[signup:dev] Verification code for ${pending.email}: ${verificationCode}`);
  }

  return res.status(201).json({
    success: true,
    message: "Verification code sent. Please check your email.",
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const validated = validateBody(verifyEmailSchema, req.body);
  if (!validated.ok) {
    return res.status(400).json({ success: false, message: "Invalid payload", details: validated.errors });
  }

  const { email, code } = validated.data;
  const pending = await PendingRegistration.findOne({ email: email.toLowerCase() });

  if (!pending) {
    return res.status(404).json({ success: false, message: "No pending registration found for this email" });
  }

  if (new Date() > pending.verificationCodeExpiresAt) {
    await PendingRegistration.deleteOne({ _id: pending._id });
    return res.status(400).json({ success: false, message: "Verification code has expired. Please sign up again." });
  }

  if (pending.verificationCode !== code) {
    return res.status(400).json({ success: false, message: "Invalid verification code" });
  }

  const user = await User.create({
    username: pending.username,
    email: pending.email,
    passwordHash: pending.passwordHash,
    emailVerified: true,
  });

  await PendingRegistration.deleteOne({ _id: pending._id });

  const tokenPayload = { sub: String(user._id), email: user.email, username: user.username };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ sub: String(user._id) });
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  setRefreshTokenCookie(res, refreshToken);

  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: {
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        profileImage: user.profileImage || "",
      },
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const validated = validateBody(loginSchema, req.body);
  if (!validated.ok) {
    return res.status(400).json({ success: false, message: "Invalid payload", details: validated.errors });
  }

  const { email, password } = validated.data;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  if (!user.emailVerified) {
    return res.status(403).json({ success: false, message: "Please verify your email first" });
  }

  const tokenPayload = { sub: String(user._id), email: user.email, username: user.username };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ sub: String(user._id) });
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  setRefreshTokenCookie(res, refreshToken);

  return res.status(200).json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        profileImage: user.profileImage || "",
      },
    },
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const currentToken = req.cookies?.refreshToken;

  if (!currentToken) {
    return res.status(401).json({ success: false, message: "Missing refresh token" });
  }

  const payload = verifyRefreshToken(currentToken);
  const user = await User.findById(payload.sub);

  if (!user || !user.refreshTokenHash) {
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }

  const matches = await bcrypt.compare(currentToken, user.refreshTokenHash);
  if (!matches) {
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }

  const newAccessToken = signAccessToken({
    sub: String(user._id),
    email: user.email,
    username: user.username,
  });
  const newRefreshToken = signRefreshToken({ sub: String(user._id) });

  user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
  await user.save();

  setRefreshTokenCookie(res, newRefreshToken);

  return res.status(200).json({
    success: true,
    data: { accessToken: newAccessToken },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const currentToken = req.cookies?.refreshToken;
  if (currentToken) {
    try {
      const payload = verifyRefreshToken(currentToken);
      await User.findByIdAndUpdate(payload.sub, { refreshTokenHash: null });
    } catch {
      // Ignore invalid or expired refresh token during logout.
    }
  }

  res.clearCookie("refreshToken", { path: "/api/auth/refresh-token" });
  return res.status(200).json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      emailVerified: req.user.emailVerified,
      profileImage: req.user.profileImage || "",
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const validated = validateBody(profileUpdateSchema, req.body);
  if (!validated.ok) {
    return res.status(400).json({ success: false, message: "Invalid payload", details: validated.errors });
  }

  const payload = {};
  if (validated.data.username) {
    const taken = await User.findOne({ username: validated.data.username, _id: { $ne: req.user._id } });
    if (taken) {
      return res.status(409).json({ success: false, message: "Username already taken" });
    }
    payload.username = validated.data.username;
  }
  if (validated.data.profileImage) {
    payload.profileImage = validated.data.profileImage;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    payload,
    { new: true, runValidators: true }
  ).select("_id username email emailVerified profileImage");

  return res.status(200).json({
    success: true,
    message: "Profile updated",
    data: {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      emailVerified: updatedUser.emailVerified,
      profileImage: updatedUser.profileImage || "",
    },
  });
});
