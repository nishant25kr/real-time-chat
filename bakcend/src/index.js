import express from "express";
import { WebSocketServer } from "ws";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.json({ message: "Server is Up" });
});

const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.send("Hello!! from the server");

    ws.on("message", (message) => {
        const data = message.toString();

        wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
                client.send(`Received: ${data}`);
            }
        });
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});
