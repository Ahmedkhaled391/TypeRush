export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.on("match:create", (payload, callback) => {
      callback?.({
        ok: false,
        message: "match:create is scaffolded but not implemented yet",
        payload,
      });
    });

    socket.on("match:join", (payload, callback) => {
      callback?.({
        ok: false,
        message: "match:join is scaffolded but not implemented yet",
        payload,
      });
    });

    socket.on("match:progress", (payload) => {
      socket.broadcast.emit("match:progress", payload);
    });
  });
}
