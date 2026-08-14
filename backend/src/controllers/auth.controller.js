import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  loginSchema,
  profileUpdateSchema,
  signupSchema,
} from "../validators/auth.validators.js";
import {
  loginUser,
  logoutUser,
  publicUser,
  refreshUserSession,
  registerUser,
  updateUserProfile,
} from "../modules/auth/auth.service.js";
import { validateBody } from "../modules/shared/validation.js";

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

  const result = await registerUser(validated.data);
  setRefreshTokenCookie(res, result.refreshToken);

  return res.status(201).json({
    success: true,
    message: "Account created successfully.",
    data: {
      accessToken: result.accessToken,
      user: result.user,
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

  const result = await loginUser(validated.data);
  setRefreshTokenCookie(res, result.refreshToken);

  return res.status(200).json({
    success: true,
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const currentToken = req.cookies?.refreshToken;
  const result = await refreshUserSession(currentToken);
  setRefreshTokenCookie(res, result.refreshToken);

  return res.status(200).json({
    success: true,
    data: { accessToken: result.accessToken },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const currentToken = req.cookies?.refreshToken;
  await logoutUser(currentToken);

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

  const updatedUser = await updateUserProfile({
    currentUser: req.user,
    username: validated.data.username,
    profileImage: validated.data.profileImage,
  });

  return res.status(200).json({
    success: true,
    message: "Profile updated",
    data: updatedUser,
  });
});
