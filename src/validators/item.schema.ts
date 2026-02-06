import { z } from 'zod';

export const CreateItemSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  description: z.string().min(1, 'Description is required'),
  unitPrice: z.number().nonnegative('Unit price must be a number >= 0'),
});
