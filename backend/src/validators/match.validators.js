import { z } from "zod";

export const createMatchSchema = z.object({
  lessonId: z.number().int().min(1).max(100),
});

export const joinMatchSchema = z.object({
  code: z.string().trim().length(6),
  username: z.string().trim().min(3).max(32),
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

  return { ok: true, data: parsed.data };
}
