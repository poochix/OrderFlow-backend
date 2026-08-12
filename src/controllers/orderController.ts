
import { Request, Response } from "express"
import { createOrderService } from "../services/orderService"

export const createOrder = async(req:Request, res:Response): Promise<void> =>{
    try {
        // grabs the validated date from req body
        const orderData = req.body

        //passes the order data to the createOrderService layer
        const newOrder = await createOrderService(orderData);

        //sends a successfull response
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: newOrder,
        });
        
    } catch (error) {
        if(error instanceof Error){
            //this catches error if the customer does not exist
            res.status(400).json({
                success: false,
                message: error.message,
            })
        }

        //fallback for unexpected server crashes
        res.status(500).json({
            success: false,
            message: "An unexpected error has occurred while creating the order"
        })
    }
}