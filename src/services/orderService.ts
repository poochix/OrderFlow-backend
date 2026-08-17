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

export const createOrderService = async (inputData: OrderInputData) : Promise<IOrder> =>{

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
    const page= query.page || 1;
    const limit = query.limit || 10;
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
        .populate('Customer', 'name companyName email phone')
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