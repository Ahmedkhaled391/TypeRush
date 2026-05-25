import { io } from "socket.io-client";

function getSocketUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "");
  }

  return "http://localhost:5001";
}

export const socket = io(getSocketUrl(), {
  withCredentials: true,
  autoConnect: false,
});
