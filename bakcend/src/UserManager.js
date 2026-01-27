import { SupportedMessage } from "./messages/outgoingMessages.js";

export class UserManager {
    constructor() {
        this.rooms = new Map();
    }

    addUser(name, userId, roomId, socket) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, { users: [] });
        }

        this.rooms.get(roomId).users.push({
            id: userId,
            name,
            conn: socket,
        });
    }

    removeUser(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.users = room.users.filter(user => user.id !== userId);
    }

    getUser(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (!room) return null;

        return room.users.find(user => user.id === userId);
    }

    broadcastToRoom(roomId, payload) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const message = {
            type: SupportedMessage.AddChat,
            payload,
        };

        room.users.forEach(({ conn }) => {
            conn.send(JSON.stringify(message));
        });
    }
}
