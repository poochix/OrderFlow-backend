import { email, z } from "zod";

export const loginSchema = z.object({
    body: z.object({
        email: z.email({message:"Invalid email address format"}),
        password: z.string().min(1, {message: 'password is required'}),
    }),
});

export type loginInput = z.infer<typeof loginSchema>;