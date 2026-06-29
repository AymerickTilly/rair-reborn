import { z } from "zod";

export const updateItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  stock: z.array(z.object({
    size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]),
    stockAmount: z.coerce.number().int().min(0, "Stock must be at least 0"),
  })),
  image: z
    .any()
    .optional(), // since image might not be changed
});

export type TUpdateItemSchema = z.infer<typeof updateItemSchema>;
