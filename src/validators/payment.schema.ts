import {z} from 'zod';

export const MakePaymentSchema = z.object({
    amount : z.number().positive('Amount must be a positive number'),
    paymentMethod : z.enum(['Card', 'Bank Transfer', 'UPI', 'Cash'], 'Invalid payment method'),
});