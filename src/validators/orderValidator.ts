import { z } from "zod";
import { iso } from "zod";

export const createOrderSchema = z.object({
    body: z.object({
        //mongo db ObjectIds are of 24 hex chars

        customer: z.string().length(24, { message: 'Invalid Customer ID format' }),
        productName: z.string().trim().min(2, { message: 'Product Name is required' }),
        description: z.string().trim().min(5, { message: 'Description must be atleast 5 characters long' }),

        //Financial/Inventory safety check
        quantity: z.number().int().positive({ message: 'Quantity must be a positve Interger' }),
        price: z.number().nonnegative({ message: 'Price cannot be negative' }),

        //enums to match mongo model
        priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),

        deadline: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
            message: 'Invalid date format for Deadline'
        }),

        //Optional as it can drop in the "Shared Pool"
        assignedEmployee: z.string().length(24, { message: "Invalid Employee ID format" }).optional(),
    }),
});

export const updateOrderStatusSchema = z.object({
    params: z.object({
        id: z.string().length(24, { message: 'Invalid Order ID Format' }),
    }),
    body: z.object({
        status: z.enum(['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled']),
    }),
})



export const editOrderSchema = z.object({
    customer: z.string().length(24, { message: "Invalid Customer ID format" }).optional(),

    productName: z.string().trim().min(1, "Product Name is too short").optional(),

    thickness: z.string().trim().optional(),
    width: z.string().trim().optional(),
    description: z.string().trim().min(1, "Description lenght is too short").optional(),

    quantity: z
        .number()
        .int()
        .positive("Quantity must be positive Integer")
        .optional(),

    price: z
        .number()
        .nonnegative({ message: "Price cannot be negative" })

        .optional(),

    assignedEmployee: z
        .string()
        .length(24, {
            message: "Invalid Employee ID format",
        })
        .nullable()
        .optional(),

    priority: z
        .enum(["Low", "Medium", "High", "Urgent"])
        .optional(),

    deadline: z
        .string()
        .refine(
            (date) => !Number.isNaN(Date.parse(date)),
            {
                message: "Invalid deadline",
            }
        )
        .optional(),

}).strict()   // prevent client from injecting unapproved fields

export type createOrderInput = z.infer<typeof createOrderSchema>['body']
export type updateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type editOrderInput = z.infer<typeof editOrderSchema>



