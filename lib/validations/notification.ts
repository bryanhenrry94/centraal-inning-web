import { z } from "zod";
import { CollectionCaseSchema } from "@/lib/validations/collection";

export enum NotificationType {
  AANMANING = "AANMANING",
  SOMMATIE = "SOMMATIE",
  INGEBREKESTELLING = "INGEBREKESTELLING",
  BLOKKADE = "BLOKKADE",
}

export const NotificationSchema = z.object({
  id: z.string(), // cuid
  collection_case_id: z.string(),
  type: z.enum([
    NotificationType.AANMANING,
    NotificationType.SOMMATIE,
    NotificationType.INGEBREKESTELLING,
    NotificationType.BLOKKADE,
  ]),
  title: z.string(),
  message: z.string(),
  sent_at: z.date(),
  read: z.boolean(),
  created_at: z.date(),
});

export const NotificationResponseSchema = NotificationSchema.extend({
  collection_case: CollectionCaseSchema,
});

export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationResponse = z.infer<typeof NotificationResponseSchema>;
