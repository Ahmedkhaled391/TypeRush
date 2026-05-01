import http from "node:http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectMongo } from "./db/connectMongo.js";
import { registerSocketHandlers } from "./sockets/index.js";

async function bootstrap() {
  await connectMongo(env.MONGODB_URI);

  const server = http.createServer(app);

  const io = new SocketIOServer(server, {
    cors: {
      origin: env.CLIENT_URL,
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
