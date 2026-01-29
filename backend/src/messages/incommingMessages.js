import { z } from "zod";

export const SupportedMessage = {
    JoinRoom: "JOIN_ROOM",
    SendMessage: "SEND_MESSAGE",
    Upvote: "UPVOTE_MESSAGE",
}

export const InitMessage = z.object({
    name: z.string(),
    userId: z.string(),
    roomId: z.string()
}).strict();

export const UserMessage = z.object({
    userId: z.string(),
    roomId: z.string(),
    message: z.string()
}).strict();

export const UpvoteMessage = z.object({
    userId: z.string(),
    roomId: z.string(),
    chatId: z.string()
}).strict();

export const IncomingMessageSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal(SupportedMessage.JoinRoom),
        payload: InitMessage
    }),
    z.object({
        type: z.literal(SupportedMessage.SendMessage),
        payload: UserMessage
    }),
    z.object({
        type: z.literal(SupportedMessage.Upvote),
        payload: UpvoteMessage
    })
]);
