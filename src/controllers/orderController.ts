
import { Request, Response } from "express"
import { createOrderService, getOrdersService } from "../services/orderService"

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

export const getOrders = async(req:Request, res:Response) : Promise<void> =>{
    
    try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const status = req.query.status as string;
    
    //fetch the data from our service 
    const result = await getOrdersService({page, limit, status});

    //send success response

    res.status(201).json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
    });

} catch (error) {
     res.status(500).json({
        success: false,
        message: 'An unexpected error occured while fetching the orders',
     });   
    }

};

export const updateOrderStatus = async (req:Request, res:Response) : Promise<void> =>{
    try {
        
    } catch (error) {
        if(error instanceof Error){
            res.status(404).json({
                success: false,
                message: error.message,
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'An unexpected error has occurred while updating the order status',
        });
    }
}