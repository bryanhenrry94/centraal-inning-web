import { z } from "zod";

export const ChatMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  senderId: z.string(),
  message: z.string(),
  fileUrl: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  timestamp: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const ChatMessageCreateSchema = ChatMessageSchema.omit({
  id: true,
  timestamp: true,
  createdAt: true,
  updatedAt: true,
});

export const ChatMessageResponseSchema = ChatMessageSchema.extend({
  fullname: z.string(),
  email: z.string().email(),
});

export const ChatRoomSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  collectionCaseId: z.string(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  messages: z.array(ChatMessageSchema),
});

export type IChatMessage = z.infer<typeof ChatMessageSchema>;
export type IChatMessageCreate = z.infer<typeof ChatMessageCreateSchema>;
export type ChatRoom = z.infer<typeof ChatRoomSchema>;
