import mongoose from "mongoose";
import {
  MAX_MULTIPLAYER_LEVEL,
  MAX_MULTIPLAYER_POINTS,
} from "../utils/multiplayerLevel.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    refreshTokenHash: {
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: "",
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: MAX_MULTIPLAYER_LEVEL,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
      max: MAX_MULTIPLAYER_POINTS,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
