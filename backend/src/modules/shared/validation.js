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
