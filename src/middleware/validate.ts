    import { Request, Response, NextFunction } from 'express';
    import { ZodObject, ZodError } from 'zod';

    const validate = (schema: ZodObject) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Parse and validate the incoming request parts (body, query, params) against the Zod schema
        await schema.parseAsync({
        body: req.body,         //take  request recieved from the client and matches the schema from the fn(schema)
        query: req.query,
        params: req.params,
        });
        
        // If validation succeeds, move on to the next function (Controller/Service)
        return next();
    } catch (error) {
        if (error instanceof ZodError) {
        // Send back a clean, structured array of validation errors
        res.status(400).json({
            status: 'fail',
            errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
            })),
        });
        return;
        }
        
        // Handle unexpected non-Zod errors
        res.status(500).json({ status: 'error', message: 'Internal Server Error during validation' });
        return;
    }
    };

    export default validate;