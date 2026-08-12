import { z } from "zod";

export const createOrderSchema = z.object({
    body: z.object({
        //mongo db ObjectIds are of 24 hex chars
       
        customer: z.string().min(24, {message: 'Invalid Customer ID format'}),
        productName: z.string().min(2, {message: 'Product Name is required'}),
        description: z.string().min(5, {message: 'Description must be atleast 5 characters long'}),

        //Financial/Inventory safety check
        quantity: z.number().int().positive({message: 'Quantity must be a positve Interger'}),
        price: z.number().int().positive({message: 'Price must be a positve Integer'}),

        //enums to match mongo model
        priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),

        deadline: z.string().refine((date)=> !isNaN(Date.parse(date)), {
            message: 'Invalid date format for Deadline'
        }),

        //Optional as it can drop in the "Shared Pool"
        assignedEmployee: z.string().length(24).optional(),
    }),
}) ;

export type createOrderInput = z.infer<typeof createOrderSchema>['body']

    
       
