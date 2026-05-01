import { z } from "zod";

export const attemptSchema = z.object({
  lessonId: z.number().int().min(1).max(100),
  wpm: z.number().min(0).max(300),
  accuracy: z.number().min(0).max(100),
  elapsedMs: z.number().int().min(0).max(60 * 60 * 1000),
  wpmRequirement: z.number().min(1).max(300),
  accuracyRequirement: z.number().min(1).max(100),
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
