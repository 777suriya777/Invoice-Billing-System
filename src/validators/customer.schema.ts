import {z} from 'zod';

export const CreateCustomerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    address: z.string().optional()
});