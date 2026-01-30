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
            try {
                // The server uses the 'ws' package. Use readyState and send().
                // readyState === 1 means OPEN.
                if (conn && conn.readyState === 1) {
                    conn.send(payload);
                }
            } catch (err) {
                console.error("Send failed:", err.message);
            }
        });
    }

    removeSocket(ws){
        // Remove any users whose socket matches the one that closed
        this.rooms.forEach((room, roomId) => {
            room.users = room.users.filter(user => user.conn !== ws);
            if (room.users.length === 0) {
                this.rooms.delete(roomId);
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
