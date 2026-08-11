
import Customer, { ICustomer } from "../models/Customer";


interface CustomerInputData {
    name: string;
    companyName: string;
    phone: string;
    email: string
    gstNumber: string;
    address: string;
    notes: string
    
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