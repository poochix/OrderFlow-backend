import {z} from 'zod'

//validates the Http request from the frontend
export const parseOrderTextItem = z.object({
    body: z.object({
        text: z.string().min(10, {message: 'please provide more context to parse the order'}),
    }),
}) ;

//validates the JSON string returned by the LLM
export const aiParsedOrderSchema = z.object({
    customerName: z.string().optional, //We might need to fuzzy search this on the frontend
    productName: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive().optional(),
    deadline: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent' ]).default('Medium'),
    notes: z.string().optional(),
})

export type AIParsedOrder = z.infer<typeof aiParsedOrderSchema> 

