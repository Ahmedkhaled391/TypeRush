import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    wpm: {
      type: Number,
      default: 0,
      min: 0,
    },
    accuracy: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    finishedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      minlength: 6,
      maxlength: 6,
      index: true,
    },
    hostUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["waiting", "countdown", "active", "finished"],
      default: "waiting",
      index: true,
    },
    lessonId: {
      type: Number,
      required: true,
      min: 1,
    },
    participants: {
      type: [participantSchema],
      default: [],
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Match = mongoose.model("Match", matchSchema);
