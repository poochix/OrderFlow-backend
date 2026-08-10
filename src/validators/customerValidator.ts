import {z} from "zod"

export const createCustomerSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        companyName: z.string().min(2, {message:'Company name is required'}),
        phone: z.string().min(10, {message:'Phone number must contain 10 digits'}),
        email: z.email({message: "Enter valid email address"}),
        gstNumber: z.string().optional(),
        address: z.string().min(5, {message:'Valid address is required'}),
        notes: z.string().optional(),
    }),
});

export type createCustomerInput = z.infer<typeof createCustomerSchema>
