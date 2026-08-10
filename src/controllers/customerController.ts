import  {Request, Response, NextFunction} from "express";
import { createCustomerService } from "../services/customerService";


export const createCustomer = async(req:Request, res:Response): Promise<void> =>{
    try {
        // extract validate customer data from request body
        const {name, companyName, email, phone, gstNumber, address, notes} = req.body;

        // pass the data to the customer service layer
        const newCustomer = await createCustomerService({
            name,
            companyName,
            phone,
            email,
            gstNumber,
            address,
            notes,
        })

        //sends standardized success response
        res.status(201).json({
            success: true,
            message: 'Customer has been created successfully',
            data: newCustomer,
        });


        
    } catch (error) {
        if(error instanceof Error){
                //Handles know service error (like duplicate emails and phones)
                res.status(400).json({
                    success: false,
                    message: 'error.message',
                });
                return;
        }
        // handles unexpected server errors
        res.status(500).json({
            success: false,
            message:'An unexpected server error has occured while creating the customer',
        });
    }
};