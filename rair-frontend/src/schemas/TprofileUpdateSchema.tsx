import { z } from "zod";

export const profileUpdateSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters long"),
});

export type TprofileUpdateFormData = z.infer<typeof profileUpdateSchema>;