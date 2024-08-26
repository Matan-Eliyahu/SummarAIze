import WebSocket, { Server as WebSocketServer } from "ws";
import http from "http";

export const clients = new Map<string, WebSocket>();

export function initWebSocketServer(server: http.Server): WebSocketServer {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    const userId = new URLSearchParams(req.url?.split("?")[1]).get("userId");
    if (userId) {
      clients.set(userId, ws);

      ws.on("message", (message) => {
        const parsedMessage = JSON.parse(message.toString());
        if (parsedMessage.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      });

      ws.on("close", () => {
        clients.delete(userId);
      });
    }
  });

  return wss;
}
