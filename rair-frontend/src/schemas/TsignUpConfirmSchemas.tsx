import { z } from "zod";

export const signUpConfirmSchema = z.object({
    email: z.string().email("Invalid email address"),
    code: z.string(),
    password: z.string().min(8, "Password must be 10 characters minimum")
  });
  
  export type TsignUpConfirmSchema = z.infer<typeof signUpConfirmSchema>;