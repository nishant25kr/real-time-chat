import express from "express";
import { WebSocketServer } from "ws";
import { SupportedMessage, IncomingMessageSchema } from "./messages/incommingMessages.js";
import { UserManager } from "./UserManager.js";
import { InMemoryStore } from "./store/InMemoryStore.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const userManager = new UserManager();
const store = new InMemoryStore();

app.get("/", (_, res) => {
    res.json({ message: "Hello from Real-Time Chat Server!" });
});

const server = app.listen(PORT, () => {
    console.log(`Server running`);
});

const wss = new WebSocketServer({ server });

function printState() {
    console.log("USERS:");
    console.dir(userManager.dump(), { depth: null });

    console.log("MESSAGES:");
    console.dir(store.dump(), { depth: null });
}


wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", (data) => {
        let parsed;

        try {
            parsed = JSON.parse(data.toString());
        } catch {
            return;
        }

        const result = IncomingMessageSchema.safeParse(parsed);
        if (!result.success) {
            ws.send(JSON.stringify({ error: "Invalid message format" }));
            return;
        }

        messageHandler(ws, result.data);
    });

    ws.on("close", () => {
        userManager.removeSocket(ws);
        console.log("Client disconnected");
    });
});

function messageHandler(ws, message) {
    switch (message.type) {
        case SupportedMessage.JoinRoom: {
            const { name, userId, roomId } = message.payload;
            userManager.addUser(name, userId, roomId, ws);
            break;
        }

        case SupportedMessage.SendMessage: {
            const { userId, roomId, message: text } = message.payload;

            const user = userManager.getUser(roomId, userId);
            if (!user) return;

            const chat = store.addChat(roomId, userId, user.name, text);

            userManager.broadcast(roomId, userId, {
                type: "ADD_CHAT",
                payload: {
                    chatId: chat.id,
                    roomId,
                    message: chat.message,
                    name: user.name,
                    upvotes: chat.upvotes.length
                }
            });
            break;
        }

        case SupportedMessage.Upvote: {
            const { roomId, chatId, userId } = message.payload;

            const chat = store.upvote(userId, roomId, chatId);
            if (!chat) return;

            userManager.broadcast(roomId, userId, {
                type: "UPDATE_CHAT",
                payload: {
                    chatId,
                    roomId,
                    upvotes: chat.upvotes.length
                }
            });
            break;
        }
    }
}
