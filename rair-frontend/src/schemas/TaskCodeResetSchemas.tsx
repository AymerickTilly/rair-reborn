import { z } from "zod";

export const askCodeResetSchema = z.object({
    email: z.string().email("Invalid email address"),
  });
  
  export type TaskCodeResetSchema = z.infer<typeof askCodeResetSchema>;