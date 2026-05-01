const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
const ACCESS_TOKEN_KEY = "typerush_access_token";
const USER_CACHE_KEY = "typerush_user";
const AUTH_CHANGED_EVENT = "typerush-auth-changed";

function emitAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function subscribeAuthChanges(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(AUTH_CHANGED_EVENT, callback);
  return () => window.removeEventListener(AUTH_CHANGED_EVENT, callback);
}

async function parseApiResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = payload?.details;
    throw error;
  }

  return payload;
}

export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setAccessToken(token) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    emitAuthChanged();
  } catch {
    // Ignore storage errors in restricted browser modes.
  }
}

export function clearAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    emitAuthChanged();
  } catch {
    // Ignore storage errors in restricted browser modes.
  }
}

export function getCachedUser() {
  try {
    const value = localStorage.getItem(USER_CACHE_KEY);
    if (!value) return null;
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function setCachedUser(user) {
  if (!user) return;
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    emitAuthChanged();
  } catch {
    // Ignore storage errors in restricted browser modes.
  }
}

export function clearCachedUser() {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
    emitAuthChanged();
  } catch {
    // Ignore storage errors in restricted browser modes.
  }
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export async function apiRequest(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  return parseApiResponse(response);
}

export async function signupUser({ username, email, password }) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export async function verifyEmailCode({ email, code }) {
  const response = await apiRequest("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });

  const token = response?.data?.accessToken;
  if (token) {
    setAccessToken(token);
  }

  if (response?.data?.user) {
    setCachedUser(response.data.user);
  }

  return response;
}

export async function loginUser({ email, password }) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const token = response?.data?.accessToken;
  if (token) {
    setAccessToken(token);
  }

  if (response?.data?.user) {
    setCachedUser(response.data.user);
  }

  return response;
}

export async function logoutUser() {
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
    });
  } finally {
    clearAccessToken();
    clearCachedUser();
  }
}

export async function getCurrentUser() {
  const response = await apiRequest("/auth/me", {
    method: "GET",
  });

  if (response?.data) {
    setCachedUser(response.data);
  }

  return response;
}

export async function updateProfile({ username, profileImage } = {}) {
  const payload = {};
  if (typeof username === "string" && username.trim()) {
    payload.username = username.trim();
  }
  if (typeof profileImage === "string" && profileImage.trim()) {
    payload.profileImage = profileImage.trim();
  }

  const response = await apiRequest("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (response?.data) {
    setCachedUser(response.data);
  }

  return response;
}

export async function updateProfilePhoto(profileImage) {
  return updateProfile({ profileImage });
}
