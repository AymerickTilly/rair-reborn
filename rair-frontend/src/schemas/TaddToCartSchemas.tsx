import { z } from "zod";

export const addToCartSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL"], {
    errorMap: () => ({ message: "Please select a valid size" }),
  }),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export type TAddToCartSchema = z.infer<typeof addToCartSchema>;