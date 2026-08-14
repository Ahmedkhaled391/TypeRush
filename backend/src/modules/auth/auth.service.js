import bcrypt from "bcryptjs";
import { User } from "../../models/User.js";
import { getMultiplayerLevelProgress } from "../../utils/multiplayerLevel.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/tokens.js";

export function publicUser(user) {
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

export async function registerUser({ username, email, password }) {
  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username }],
  });
  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      const error = new Error("Email already in use");
      error.statusCode = 409;
      throw error;
    }

    const error = new Error("Username already taken");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    username,
    email: normalizedEmail,
    passwordHash,
  });

  const accessToken = signAccessToken({
    sub: String(user._id),
    email: user.email,
    username: user.username,
  });
  const refreshToken = signRefreshToken({ sub: String(user._id) });

  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: publicUser(user),
  };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken({
    sub: String(user._id),
    email: user.email,
    username: user.username,
  });
  const refreshToken = signRefreshToken({ sub: String(user._id) });

  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: publicUser(user),
  };
}

export async function refreshUserSession(currentRefreshToken) {
  if (!currentRefreshToken) {
    const error = new Error("Missing refresh token");
    error.statusCode = 401;
    throw error;
  }

  const payload = verifyRefreshToken(currentRefreshToken);
  const user = await User.findById(payload.sub);

  if (!user || !user.refreshTokenHash) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const matches = await bcrypt.compare(
    currentRefreshToken,
    user.refreshTokenHash,
  );
  if (!matches) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken({
    sub: String(user._id),
    email: user.email,
    username: user.username,
  });
  const refreshToken = signRefreshToken({ sub: String(user._id) });

  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return { accessToken, refreshToken };
}

export async function logoutUser(currentRefreshToken) {
  if (!currentRefreshToken) {
    return;
  }

  try {
    const payload = verifyRefreshToken(currentRefreshToken);
    await User.findByIdAndUpdate(payload.sub, { refreshTokenHash: null });
  } catch {
    // Invalid or expired refresh token during logout is ignored.
  }
}

export async function updateUserProfile({
  currentUser,
  username,
  profileImage,
}) {
  const payload = {};

  if (typeof username === "string" && username.trim()) {
    const taken = await User.findOne({
      username,
      _id: { $ne: currentUser._id },
    });
    if (taken) {
      const error = new Error("Username already taken");
      error.statusCode = 409;
      throw error;
    }

    payload.username = username.trim();
  }

  if (typeof profileImage === "string" && profileImage.trim()) {
    payload.profileImage = profileImage.trim();
  }

  const updatedUser = await User.findByIdAndUpdate(currentUser._id, payload, {
    new: true,
    runValidators: true,
  }).select("_id username email profileImage level points");

  return publicUser(updatedUser);
}
