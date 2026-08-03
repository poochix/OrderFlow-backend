import { z } from 'zod';

// Define the rulebook for user registration
export const registerSchema = z.object({
 body: z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
    email: z.email({ message: 'Invalid email address format' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    role: z.enum(['admin', 'manager', 'staff']).optional(),
  }),
});

// Infer the TypeScript type automatically from the Zod schema
export type RegisterInput = z.infer<typeof registerSchema>