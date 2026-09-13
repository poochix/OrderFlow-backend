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

export const updateOrderStatusSchema = z.object({
    params: z.object({
        id: z.string().length(24, {message: 'Invalid Order ID Format'}),
    }),
    body: z.object({
        status: z.enum(['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled']),
    }),
})



export const updateOrderSchema = z.object({
    customer: z.string().min(1).optional(),

    productName: z.string().trim().min(1, "Product Name is too short"),

    thickness: z.string().trim(),
    width: z.string().trim(),
    description: z.string().min(1, "Description lenght is too short").trim().optional(),

     quantity: z
    .number()
    .positive("Quantity must be greater than 0")
    .optional(),

    price: z
    .number()
    .min(0, "Price cannot be negative")
    .optional(),

     assignedEmployee: z
    .string()
    .nullable()
    .optional(),

     priority: z
    .enum(["Low", "Medium", "High", "Urgent"])
    .optional(),

    deadline: z
    .string()
    .datetime()
    .optional(),


})

export type createOrderInput = z.infer<typeof createOrderSchema>['body']

    
       
