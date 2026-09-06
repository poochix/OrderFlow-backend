import { getIo } from "../config/socket";
import AuditLog from "../models/AuditLog";
import Customer from "../models/Customer";
import Order, { IOrder } from "../models/Order";
import { getNextSequence } from "../utils/sequenceGenerator";


interface OrderInputData {
    customer: string;
    productName: string;
    description: string;
    quantity: number;
    price: number;
    priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
    deadline: string; // comes as string later parsed into date by mongoose
    assignedEmployee?: string; 
}

export const createOrderService = async (inputData: OrderInputData, userId:string) : Promise<IOrder> =>{

    //verifies customer actually exists (Referential Integrity Check)
    const existingCustomer = await Customer.findById(inputData.customer);
    
    if(!existingCustomer || existingCustomer.isDeleted){
        throw new Error('Cannot create order: Specified customer does not exists')
    };


    //generate atomic order numbers
    //we pass 'orderNumber' as id to create a specific counter for order
    const sequenceNumber = await getNextSequence('orderNumber');

    //formating the order number 
    const orderNumber = `ORD-${sequenceNumber}`;

    //saved to db
    const newOrder = await Order.create({
        ...inputData,
        orderNumber,
    });

    await AuditLog.create({
        entityType: 'Order',
        entityId: newOrder._id,
        action : 'CREATED',
        performedBy: userId,
        changes : {
            initialStatus : 'Pending',
            product : newOrder.productName
        }
    })

    return newOrder;

}


//==================================================================================================

// GET Orders

interface GetOrdersQuerry {
    page?:number;
    limit?: number;
    status?: string;
}

export const getOrdersService = async(query: GetOrdersQuerry) =>{

    //setting us pagination defaults
    const page= query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page-1)* limit;

    //database filter (always hides soft deleted records)
    const dbQuery: any = {
        isDeleted: false
    };

    //if frontend requests a specific status (e.g 'Pending')    
        if(query.status){
            dbQuery.status= query.status;
        };
            
        const orders = await Order.find(dbQuery)
        .populate('customer', 'name companyName email phone')
        .populate('assignedEmployee', 'name email')
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit);

        //gets the total count for front end pagination UI
        const total = await Order.countDocuments(dbQuery);

        return {
            orders,
            pagination:{
              totalOrders: total,
              totalPages: Math.ceil(total/limit),
              currentPage: page,
              limit,
            },
        };
    
};

  // Update Order Service
 export const updateOrderStatusService = async (orderId: string, newStatus: string, userId: string) => {
    // 1. Fetch and populate the order immediately
    const order = await Order.findOne({ _id: orderId, isDeleted: false })
        .populate('customer', 'name companyName phone')
        .populate('assignedEmployee', 'name email');

    if (!order) {
        throw new Error('Order not found or has been removed from the system');
    }
   
    const oldStatus = order.status;

    // 2. The Guard is now much cleaner
    if (oldStatus === newStatus) {
        return order; // We can return it directly because it is already populated!
    }

    order.status = newStatus as any; 
    const updatedOrder = await order.save(); 

    await AuditLog.create({
        entityType: 'Order',
        entityId: updatedOrder._id,
        action: 'STATUS_CHANGED',
        performedBy: userId,
        changes: { from: oldStatus, to: newStatus }
    });

    // THE REAL TIME BROADCAST
    // updatedOrder maintains the populated fields from the initial query
    getIo().to('admin_dashboard').emit('order_status_updated', updatedOrder);
    
    return updatedOrder;
}

// export const updateOrderStatusService = async(orderId:string, newStatus:string, userId: string) =>{

//     //finding the order to make sure it exists and is not soft deleted
//     const order = await Order.findOne({_id:orderId, isDeleted:false});

//     if(!order){
//         throw new Error('Order not found or has been removed from the system');
//     }
   
//      //capturing the old Status
//      const oldStatus = order.status;

//      //updating the status
//     order.status = newStatus as any // casting can be undone if newstatus matches the structure of status

//     //updating the order (this will automatically update the timestamps)
//     const updatedOrder = await order.save(); 

//     const populatedOrder= await Order.findById(updatedOrder._id)
//     .populate('customer', 'name companyName phone')
//     .populate('assignedEmployee', 'name email')
    
//     //THE REAL TIME BROADCAST
//     //Emit an event to anyone listening in the 'admin_dashboard' room
//     getIo().to('admin_dashboard').emit('order_status_updated', populatedOrder);
    
//     //returning the populated order so the frontend has immediate access to the relations   
//     return populatedOrder;

// }