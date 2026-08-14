import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import test from "node:test";

import { Match } from "../src/models/Match.js";
import { User } from "../src/models/User.js";
import { loginUser, registerUser } from "../src/modules/auth/auth.service.js";
import {
  createMatchRecord,
  generateUniqueCode,
} from "../src/modules/matches/match.service.js";

test("registerUser creates a valid authenticated user payload", async () => {
  const originalFindOne = User.findOne;
  const originalCreate = User.create;

  User.findOne = async () => null;
  User.create = async (doc) => ({
    ...doc,
    _id: "user_123",
    async save() {
      this.refreshTokenHash = this.refreshTokenHash || "saved-hash";
    },
  });

  try {
    const result = await registerUser({
      username: "alice",
      email: "alice@example.com",
      password: "Passw0rd!",
    });

    assert.equal(result.user.username, "alice");
    assert.equal(result.user.email, "alice@example.com");
    assert.ok(result.accessToken);
    assert.ok(result.refreshToken);
  } finally {
    User.findOne = originalFindOne;
    User.create = originalCreate;
  }
});

test("loginUser authenticates with a valid password and returns the expected payload", async () => {
  const originalFindOne = User.findOne;
  const user = {
    _id: "user_456",
    username: "bob",
    email: "bob@example.com",
    passwordHash: await bcrypt.hash("Passw0rd!", 12),
    async save() {
      this.refreshTokenHash = this.refreshTokenHash || "saved-hash";
    },
  };

  User.findOne = async () => user;

  try {
    const result = await loginUser({
      email: "bob@example.com",
      password: "Passw0rd!",
    });

    assert.equal(result.user.username, "bob");
    assert.ok(result.accessToken);
    assert.ok(result.refreshToken);
  } finally {
    User.findOne = originalFindOne;
  }
});

test("generateUniqueCode produces a six-digit match code", async () => {
  const originalExists = Match.exists;
  Match.exists = async () => false;

  try {
    const code = await generateUniqueCode();
    assert.match(code, /^\d{6}$/);
  } finally {
    Match.exists = originalExists;
  }
});

test("createMatchRecord builds the same payload the API already exposes", () => {
  const match = createMatchRecord({
    hostUserId: "user_789",
    lessonId: 12,
    code: "123456",
    username: "host",
  });

  assert.deepEqual(match, {
    code: "123456",
    lessonId: 12,
    status: "waiting",
    participants: [{ userId: "user_789", username: "host" }],
  });
});
