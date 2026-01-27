import { z } from "zod";

export const SupportedMessage = {
    JoinRoom: "JOIN_ROOM",
    SendMessage: "SEND_MESSAGE",
    UpvoteMessage: "UPVOTE_MESSAGE",
};

export const InitMessage = z.object({
    name: z.string(),
    userId: z.string(),
    roomId: z.string(),
});

export const UserMessage = z.object({
    userId: z.string(),
    roomId: z.string(),
    message: z.string(),
});

export const Upvote = z.object({
    userId: z.string(),
    roomId: z.string(),
    chatId: z.string(),
});

export const IncomingMessages = z.discriminatedUnion("type", [
    z.object({
        type: z.literal(SupportedMessage.JoinRoom),
        payload: InitMessage,
    }),
    z.object({
        type: z.literal(SupportedMessage.SendMessage),
        payload: UserMessage,
    }),
    z.object({
        type: z.literal(SupportedMessage.UpvoteMessage),
        payload: Upvote,
    }),
]);
