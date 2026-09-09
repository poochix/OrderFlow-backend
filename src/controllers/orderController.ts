
import { Request, Response } from "express"
import { createOrderService, dispatchService, getOrdersService, updateOrderStatusService } from "../services/orderService"

export const createOrder = async(req:Request, res:Response): Promise<void> =>{
    try {
        // grabs the validated date from req body
        const orderData = req.body

        const userId = req.user?._id?.toString()
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized: userId missing from the session",
            })
            return;
        }
        //passes the order data to the createOrderService layer
        const newOrder = await createOrderService(orderData, userId);

        //sends a successfull response
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: newOrder,
        });
        
    } catch (error) {
        if(error instanceof Error && error.message.startsWith('Cannot create order:')){
            //this catches error if the customer does not exist
            res.status(400).json({
                success: false,
                message: error.message,
            })
            return;
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
        const {id} = req.params;
        const {status} = req.body;
        
        if(!id || Array.isArray(id)){
            res.status(400).json({
                success: false,
                message: 'Invalid order Id'
            });
            return;
        }

      // Extract the native Mongoose _id and explicitly convert it to a string
        const userId = req.user?._id?.toString();
        if(!userId){
            res.status(401).json({
                success:false,
                message: 'Unauthorized: userId missing from the session',
            })
            return;
        }
        const updatedStatus = await updateOrderStatusService(id  , status, userId)

        res.status(200).json({
            success: true,
            message: 'order status updated successfully',
            data: updatedStatus,
        })
        
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

export const dispatch = async(req: Request, res:Response): Promise<void> =>{
    try {
        
        const {orderId} = req.params;
        const {dispatchQty} = req.body ;

          if(!orderId || Array.isArray(orderId)){
            throw new Error("Order id is undefined")
          }
        const result = await dispatchService(orderId, Number(dispatchQty));
        
        res.status(200).json({
            success: true,
            message: 'Order dispatched successfully',
            data: result,
        });

    } catch (error) {
        if(error instanceof Error){
            res.status(400).json({
                success:false,
                error: error.message
            })

            return;
        }
        res.status(500).json({
            success: false,
            message: "failed to dispatch order"
        })

    }
}