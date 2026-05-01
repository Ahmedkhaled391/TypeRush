import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lessonId: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },
    wpm: {
      type: Number,
      required: true,
      min: 0,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    elapsedMs: {
      type: Number,
      required: true,
      min: 0,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
  },
  {
    timestamps: true,
  }
);

attemptSchema.index({ userId: 1, lessonId: 1, createdAt: -1 });

export const Attempt = mongoose.model("Attempt", attemptSchema);
