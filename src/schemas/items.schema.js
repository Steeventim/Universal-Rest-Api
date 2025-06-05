import { z } from "zod";

// Valid categories enum
const validCategories = [
  "electronics",
  "books",
  "clothing",
  "home",
  "sports",
  "toys",
];

export const itemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  category: z.enum(validCategories, {
    errorMap: () => ({
      message: `Category must be one of: ${validCategories.join(", ")}`,
    }),
  }),
});

export const createItemSchema = itemSchema.omit({ id: true });

// Update schema that requires at least one field to be present
export const updateItemSchema = itemSchema
  .partial()
  .omit({ id: true })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const itemResponseSchema = itemSchema.required();
