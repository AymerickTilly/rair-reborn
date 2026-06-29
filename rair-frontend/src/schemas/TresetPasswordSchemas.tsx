import { z } from "zod";

export const resetPasswordSchema = z.object({
    code: z.string(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmpassword: z.string(),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: 'Passwords must match',
    path: ['confirmpassword'],
  });
  
  export type TresetPasswordSchema = z.infer<typeof resetPasswordSchema>;