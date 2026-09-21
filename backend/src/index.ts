import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface Client {
  ws: WebSocket;
  userId: string;
  roomId: string;
  userName: string;
}

// roomId -> Set<Client>
const rooms = new Map<string, Set<Client>>();
// ws -> Client
const clients = new Map<WebSocket, Client>();

const MAX_ROOM_SIZE = 5;

wss.on("connection", (ws: WebSocket) => {

  ws.on("message", (data: any) => {
    let message: any;
    try {
      message = JSON.parse(data.toString());
    } catch {
      return;
    }

    switch (message.type) {

      case "join": {
        const { roomId, userId, userName } = message;
        if (!roomId || !userId || !userName) return;

        if (!rooms.has(roomId)) rooms.set(roomId, new Set());
        const room = rooms.get(roomId)!;

        if (room.size >= MAX_ROOM_SIZE) {
          ws.send(JSON.stringify({ type: "error", message: "Room is full (max 5 members)" }));
          return;
        }

        // Prevent duplicate userId in same room
        if ([...room].some(c => c.userId === userId)) {
          ws.send(JSON.stringify({ type: "error", message: "User ID already taken in this room" }));
          return;
        }

        const client: Client = { ws, userId, roomId, userName };
        room.add(client);
        clients.set(ws, client);

        // Tell the new joiner which peers are already in the room
        const existingPeers = [...room]
          .filter(c => c.userId !== userId)
          .map(c => ({ userId: c.userId, userName: c.userName }));

        ws.send(JSON.stringify({ type: "joined", roomId, userId, peers: existingPeers }));

        // Notify existing peers that someone new joined
        room.forEach(c => {
          if (c.userId !== userId) {
            c.ws.send(JSON.stringify({ type: "peer-joined", userId, userName }));
          }
        });
        break;
      }

      // Forward offer / answer / ice-candidate to the target peer in the same room
      case "offer":
      case "answer":
      case "ice-candidate": {
        const sender = clients.get(ws);
        if (!sender) return;

        const room = rooms.get(sender.roomId);
        if (!room) return;

        const target = [...room].find(c => c.userId === message.to);
        if (target) {
          target.ws.send(JSON.stringify({ ...message, from: sender.userId }));
        }
        break;
      }

      // Broadcast chat message to all other peers in the room
      case "chat": {
        const sender = clients.get(ws);
        if (!sender) return;

        const room = rooms.get(sender.roomId);
        if (!room) return;

        room.forEach(c => {
          if (c.userId !== sender.userId) {
            c.ws.send(JSON.stringify({ type: "chat", from: sender.userId, text: message.text, time: message.time }));
          }
        });
        break;
      }
    }
  });

  ws.on("close", () => {
    const client = clients.get(ws);
    if (!client) return;

    clients.delete(ws);

    const room = rooms.get(client.roomId);
    if (!room) return;

    room.delete(client);

    // Notify remaining peers
    room.forEach(c => {
      c.ws.send(JSON.stringify({ type: "peer-left", userId: client.userId }));
    });

    if (room.size === 0) rooms.delete(client.roomId);
  });

  ws.on("error", () => { /* absorb errors */ });
});

console.log("Signaling server running on ws://localhost:8080");