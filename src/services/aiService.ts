import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Ensure you import your actual Zod schema from your validators file
import { aiParsedOrderSchema } from '../validators/aiValidator';

// Initialize the Gemini SDK
const getGeminiClient = (): GoogleGenerativeAI => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error(
            "GEMINI_API_KEY is missing from environment variables"
        );
    }

    return new GoogleGenerativeAI(apiKey);
};

export const parseOrderTextService = async (rawText: string) => {
    // 1. Guard clause for missing API key
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    // 2. We use gemini-1.5-flash because it is extremely fast and heavily prioritized on the free tier
    const model = getGeminiClient().getGenerativeModel({
        model: 'gemini-3.5-flash-lite',
        generationConfig: {
            // This natively forces the AI to only return a valid JSON string
            responseMimeType: 'application/json',
        }
    });

    // 3. The Strict Prompting Strategy
    const currentDate = new Date().toISOString().split("T")[0];
    const currentYear = new Date().getFullYear();
    const prompt = `
    You are an enterprise data extraction assistant for a manufacturing order system. 
    Extract the order details from the following raw text and format it into a strictly typed JSON object.
    if some data is not present in the raw text, keep it default value.
    Current date: ${currentDate}
    Current year: ${currentYear}

    DATE RULES: 
    1. Extract deadlines from the customer's message.
    2. If the customer provides a day and month but no year,
    use the next upcoming occurrence of that date.
    3. Never assume a year from old examples or training data.
    4. Return deadlines in YYYY-MM-DD format.
    5. If a deadline is ambiguous, use null rather than inventing a date.
    6. Do not change a deadline that explicitly includes a year.
    
    Required JSON Keys and Types:
    - "companyName" (string, extract the client or company name if mentioned, otherwise null)
    - "productName" (string, the name of the product, e.g., "Steel Pipes", otherwise null)
    - "thickness" (string, include units if mentioned, e.g., "2mm", otherwise null)
    - "width" (string, include units if mentioned, e.g., "50cm", otherwise null)
    - "quantity" (number, default to 1 if a product is mentioned but no quantity is specified)
    - "price" (number, extract the unit price if mentioned, otherwise 0)
    - "deadline" (ISO date string, if a relative date like "next friday" or specific date is mentioned, calculate/format it, otherwise null)
    - "priority" (string: strictly choose between "Low", "Medium", "High", or "Urgent" based on tone, default to "Medium")
    - "notes" (string, summarizing any extra details, special requests, or raw text that doesn't fit elsewhere, otherwise "")

    Raw Text: "${rawText}"
    `;

    try {
        // 4. Call the Gemini API
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 5. Parse the string into a JavaScript Object
        const rawJsonData = JSON.parse(responseText);

        // 6. Pass the data through Zod to guarantee it matches the Mongoose schema perfectly
        const validatedData = aiParsedOrderSchema.parse(rawJsonData);

        // return validatedData;

        return validatedData; // (Replace this with the validatedData once your Zod schema is imported)

    } catch (error: any) {
        // Catch parsing errors or Zod validation failures
        if (error.name === 'ZodError') {
            throw new Error('AI extracted data did not match the required database schema');
        }
        throw new Error(`AI Processing Failed: ${error.message}`);
    }
};