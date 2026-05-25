import { apiRequest } from "./authService";

export async function createMatch({ lessonId = 1, code } = {}) {
  const response = await apiRequest("/matches", {
    method: "POST",
    body: JSON.stringify({
      lessonId,
      ...(code ? { code } : {}),
    }),
  });

  return response.data;
}

export async function joinMatch({ code, username }) {
  const response = await apiRequest("/matches/join", {
    method: "POST",
    body: JSON.stringify({
      code: String(code || "").toUpperCase(),
      username,
    }),
  });

  return response.data;
}

export async function getMatchByCode(code) {
  const response = await apiRequest(`/matches/${String(code || "").toUpperCase()}`, {
    method: "GET",
  });

  return response.data;
}
