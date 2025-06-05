import { z } from 'zod';

const itemSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    price: z.number().positive('Price must be a positive number'),
});

const createItemSchema = itemSchema.omit({ id: true });
const updateItemSchema = itemSchema.partial();

export const validateCreateItem = (data) => createItemSchema.parse(data);
export const validateUpdateItem = (data) => updateItemSchema.parse(data);
export const validateItem = (data) => itemSchema.parse(data);