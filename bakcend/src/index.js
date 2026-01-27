import express from "express";
import { WebSocketServer } from "ws";
import { SupportedMessage } from "./messages/incommingMessages.js";
import { UserManager } from "./UserManager.js";
import { Store } from "./store/Store.js";

const app = express();
const PORT = 3000;

const userManager = new UserManager();
const store = new Store();

app.get("/", (_, res) => {
    res.json({ message: "Server is Up" });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log("Received message:", message);
            messageHandler(ws, message);
        } catch (err) {
            console.error("Invalid message:", err);
        }
    });

    ws.on("close", () => {
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

            const chat = store.addChat(userId, user.name, roomId, text);

            userManager.broadcastToRoom(roomId, {
                roomId,
                message: chat.message,
                name: user.name,
                upvotes: chat.upvotes.length,
            });

            break;
        }

        case SupportedMessage.UpvoteMessage: {
            const { roomId, chatId, userId } = message.payload;
            store.upvote(roomId, chatId, userId);
            break;
        }
    }
}

