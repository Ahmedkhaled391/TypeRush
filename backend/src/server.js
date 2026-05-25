import http from "node:http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectMongo } from "./db/connectMongo.js";
import { registerSocketHandlers } from "./sockets/socket.js";

const devOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const normalizeOrigin = (value) => String(value || "").trim().replace(/\/+$/, "").toLowerCase();

async function bootstrap() {
  await connectMongo(env.MONGODB_URI);

  const server = http.createServer(app);

  const io = new SocketIOServer(server, {
    cors: {
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (env.NODE_ENV === "development" && devOrigin.test(origin)) {
          return callback(null, true);
        }
        if (normalizeOrigin(origin) === normalizeOrigin(env.CLIENT_URL)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by Socket.IO CORS"));
      },
      credentials: true,
    },
  });

  registerSocketHandlers(io);

  server.listen(env.PORT, () => {
    console.log(`TypeRush backend listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start TypeRush backend:", error);
  process.exit(1);
});
