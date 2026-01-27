import { z } from "zod";

export const SupportedMessage = {
    AddChat: "ADD_CHAT",
    UpdateChat: "UPDATE_CHAT",
};

export const MessagePayload = z.object({
    roomId: z.string(),
    message: z.string(),
    name: z.string(),
    upvotes: z.number(),
});

export const OutgoingMessages = z.discriminatedUnion("type", [
    z.object({
        type: z.literal(SupportedMessage.AddChat),
        payload: MessagePayload,
    }),
    z.object({
        type: z.literal(SupportedMessage.UpdateChat),
        payload: MessagePayload,
    }),
]);
