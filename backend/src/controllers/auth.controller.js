import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import {
  loginSchema,
  profileUpdateSchema,
  signupSchema,
  validateBody,
} from "../validators/auth.validators.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";
import { getMultiplayerLevelProgress } from "../utils/multiplayerLevel.js";

function setRefreshTokenCookie(res, token) {
  const isProduction = env.NODE_ENV === "production";
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth/refresh-token",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function publicUser(user) {
  const levelProgress = getMultiplayerLevelProgress(user);

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage || "",
    level: levelProgress.level,
    points: levelProgress.points,
    levelProgress,
  };
}

export const signup = asyncHandler(async (req, res) => {
  const validated = validateBody(signupSchema, req.body);
  if (!validated.ok) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Invalid payload",
        details: validated.errors,
      });
  }

  const { username, email, password } = validated.data;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }
    return res
      .status(409)
      .json({ success: false, message: "Username already taken" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    username,
    email: email.toLowerCase(),
    passwordHash,
  });

  const tokenPayload = {
    sub: String(user._id),
    email: user.email,
    username: user.username,
  };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ sub: String(user._id) });
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  setRefreshTokenCookie(res, refreshToken);

  return res.status(201).json({
    success: true,
    message: "Account created successfully.",
    data: {
      accessToken,
      user: publicUser(user),
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const validated = validateBody(loginSchema, req.body);
  if (!validated.ok) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Invalid payload",
        details: validated.errors,
      });
  }

  const { email, password } = validated.data;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  const tokenPayload = {
    sub: String(user._id),
    email: user.email,
    username: user.username,
  };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ sub: String(user._id) });
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  setRefreshTokenCookie(res, refreshToken);

  return res.status(200).json({
    success: true,
    data: {
      accessToken,
      user: publicUser(user),
    },
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const currentToken = req.cookies?.refreshToken;

  if (!currentToken) {
    return res
      .status(401)
      .json({ success: false, message: "Missing refresh token" });
  }

  const payload = verifyRefreshToken(currentToken);
  const user = await User.findById(payload.sub);

  if (!user || !user.refreshTokenHash) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid refresh token" });
  }

  const matches = await bcrypt.compare(currentToken, user.refreshTokenHash);
  if (!matches) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid refresh token" });
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
    data: publicUser(req.user),
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const validated = validateBody(profileUpdateSchema, req.body);
  if (!validated.ok) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Invalid payload",
        details: validated.errors,
      });
  }

  const payload = {};
  if (validated.data.username) {
    const taken = await User.findOne({
      username: validated.data.username,
      _id: { $ne: req.user._id },
    });
    if (taken) {
      return res
        .status(409)
        .json({ success: false, message: "Username already taken" });
    }
    payload.username = validated.data.username;
  }
  if (validated.data.profileImage) {
    payload.profileImage = validated.data.profileImage;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, payload, {
    new: true,
    runValidators: true,
  }).select("_id username email profileImage level points");

  return res.status(200).json({
    success: true,
    message: "Profile updated",
    data: publicUser(updatedUser),
  });
});
