import OpenAI from "openai";
import { aiParsedOrderSchema, type AIParsedOrder } from "../validators/aiValidator";

//initializing the client (fetches the process.env.OPENAI_API_KEY automatically)
const openai = new OpenAI();

export const parseOrderFromTextServie = async (rawText: string) : Promise<AIParsedOrder> =>{
    const systemPrompt = `
   You are an expert data extraction assistant for an Order Management System.

    Extract the order details from the user's unstructured text.

    You MUST return ONLY a valid JSON object matching this schema:

    {
      "customerName": "string or null",
      "productName": "string",
      "quantity": 0,
      "price": 0,
      "deadline": "ISO date string or null",
      "priority": "Low, Medium, High, or Urgent",
      "notes": "string"
    }

    Rules:
    - quantity must be a number.
    - Convert written numbers into digits. For example, "fifty" becomes 50.
    - price must be a number or null.
    - deadline must be an ISO date string or null.
    - priority must be exactly Low, Medium, High, or Urgent.
    - customerName should be null if it cannot be identified.
    - Do not include markdown, greetings, explanations, or any text outside the JSON
    `;

    //calling the LLM
    const  response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {role:"system", content:systemPrompt},
            {role: "user", content:rawText},
        ],
        temperature: 0.1, //low temp for highly deterministic, robotic output
        response_format: {type: 'json_object'}, // forces the model to return valid json object
    });

    const aiContent = response.choices[0]?.message.content;

    if(!aiContent){
        throw new Error('AI failed to generate a response');
    }
     
    try {
        //parsing the raw string in to json object
        const parsedData = JSON.parse(aiContent);

      //running ai output through strict zod validation schema
      // if ai hallucinates bad data types , then zod will throw an error
      const validatedData = aiParsedOrderSchema.parse(parsedData);

      return validatedData;
    } catch (error) {
        console.log('AI output validation failed', error);
        throw new Error('The AI generated an invalid data structure. Please try rephrasing the text.');
        
    }
};

