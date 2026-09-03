
import Customer, { ICustomer } from "../models/Customer";


interface CustomerInputData {
    name?: string;
    companyName: string;
    phone: string;
    email: string
    gstNumber?: string;
    address?: string;
    notes?: string
    
}


export  const createCustomerService = async (inputData: CustomerInputData): Promise<ICustomer> =>{
    const {email, phone} = inputData;

    //preventing duplication of customers
    const existingCustomer = await Customer.findOne({
        $or: [{email}, {phone}],
        isDeleted: false
    }) ;

    if(existingCustomer){
        throw new Error('Customer with this email and phone number already exists');
       
    };


    // save the customer to the db
    const newCustomer = await Customer.create(inputData);

    return newCustomer;
}

//===================================================================================
  // get customer service

  interface GetCustomerQuery{
         companyName?: string;
         page?: number;
         limit?: number;
         
        
  }


  export const getCustomerService = async(query: GetCustomerQuery) =>{
       
   const page = query.page || 1;
   const limit = query.limit || 10;
   const skip = (page-1)* limit;
 

   // database filter 
   const dbQuery: Record<string, unknown> = {
        isDeleted: false,
   }
         if(query.companyName){
            dbQuery.companyName = query.companyName
         }

   const customers = await Customer.find(dbQuery)
   .sort({createdAt: -1})
   .skip(skip)
   .limit(limit);

   const total = await Customer.countDocuments(dbQuery)

  return {

      customers,
      pagination: {
          totalCustomers: total,
          totalPages: Math.ceil(total/limit),
          currentPage: page,
          limit,
          
        },
    };
  

  }