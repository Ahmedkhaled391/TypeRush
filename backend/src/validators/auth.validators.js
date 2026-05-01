import { z } from "zod";

export const signupSchema = z.object({
  username: z.string().trim().min(3).max(32),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().regex(/^\d{6}$/, "Code must be 6 digits"),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const profileUpdateSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3)
      .max(20)
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
      .optional(),
    profileImage: z
      .string()
      .trim()
      .startsWith("data:image/", "Profile image must be a valid data URL")
      .max(1_500_000, "Profile image is too large")
      .optional(),
  })
  .refine((value) => Boolean(value.username || value.profileImage), {
    message: "Provide at least one field to update",
  });

export function validateBody(schema, payload) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  return {
    ok: true,
    data: parsed.data,
  };
}
