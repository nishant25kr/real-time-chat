let globalchatID = 0;

export class Store {
    constructor() {
        this.rooms = new Map();
    }

    initRoom(roomId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, []);
        }
    }

    getChats(roomId, limit = 10, offset = 0) {
        const chats = this.rooms.get(roomId) || [];

        return chats
            .slice()
            .reverse()
            .slice(offset, offset + limit);
    }

    addChat(userId, name, roomId, message) {
        if (!this.rooms.has(roomId)) return;

        this.rooms.get(roomId).push({
            id: globalchatID++,
            userId,
            name,
            message,
            upvotes: []
        });
    }

    upvote(roomId, chatId, userId) {
        const chats = this.rooms.get(roomId);
        if (!chats) return;

        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;

        if (!chat.upvotes.includes(userId)) {
            chat.upvotes.push(userId);
        }
    }
}
