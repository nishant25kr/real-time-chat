export class InMemoryStore {
    constructor() {
        this.store = new Map();
        this.globalChatId = 0;
    }

    initRoom(roomId) {
        if (!this.store.has(roomId)) {
            this.store.set(roomId, {
                roomId,
                chats: []
            });
        }
    }

    getChats(roomId, limit = 10, offset = 0) {
        const room = this.store.get(roomId);
        if (!room) return [];

        const total = room.chats.length;
        const start = Math.max(total - offset - limit, 0);
        const end = total - offset;

        return room.chats.slice(start, end);
    }

    addChat(roomId, userId, name, message) {
        if (!this.store.has(roomId)) {
            this.initRoom(roomId);
        }

        const room = this.store.get(roomId);
        if (!room) return null;

        const chat = {
            id: (++this.globalChatId).toString(),
            userId,
            name,
            message,
            upvotes: []
        };

        room.chats.push(chat);
        return chat;
    }

    upvote(userId, roomId, chatId) {
        const room = this.store.get(roomId);
        if (!room) return null;

        const chat = room.chats.find(c => c.id === chatId);
        if (!chat) return null;

        if (chat.upvotes.includes(userId)) {
            return chat;
        }

        chat.upvotes.push(userId);
        return chat;
    }

    dump() {
    const snapshot = {};

    this.store.forEach((room, roomId) => {
        snapshot[roomId] = room.chats;
    });

    return snapshot;
}

}
