import { z } from "zod";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const presignUploadSchema = z.object({
  name: z.string().trim().min(1).max(200),
  fileName: z.string().trim().min(1).max(255),
  contentType: z.literal("application/pdf", {
    message: "Only PDF files are supported in this MVP",
  }),
  size: z.number().int().positive().max(MAX_FILE_SIZE),
});