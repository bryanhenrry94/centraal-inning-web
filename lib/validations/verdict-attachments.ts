import { z } from "zod";

export const VerdictAttachmentSchema = z.object({
  id: z.string().uuid(),
  verdictId: z.string().uuid(),
  filePath: z.string(),
  fileName: z.string(),
  fileSize: z.bigint(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type VerdictAttachment = z.infer<typeof VerdictAttachmentSchema>;
