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
            conn: socket
        });
    }

    removeUser(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.users = room.users.filter(user => user.id !== userId);

        if (room.users.length === 0) {
            this.rooms.delete(roomId);
        }
    }

    getUser(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (!room) return null;

        return room.users.find(user => user.id === userId) || null;
    }

    broadcast(roomId, userId, message) {
        const room = this.rooms.get(roomId);
        if (!room) {
            console.error("Room not found");
            return;
        }

        const sender = this.getUser(roomId, userId);
        if (!sender) {
            console.error("Sender not found");
            return;
        }

        const payload = JSON.stringify(message);

        room.users.forEach(({ conn, id }) => {
            if (id === userId) return;

            try {
                if (conn && conn.connected) {
                    conn.sendUTF(payload);
                }
            } catch (err) {
                console.error("Send failed:", err.message);
            }
        });
    }

    dump() {
    const snapshot = {};

    this.rooms.forEach((room, roomId) => {
        snapshot[roomId] = room.users.map(user => ({
            id: user.id,
            name: user.name
        }));
    });

    return snapshot;
}

}
