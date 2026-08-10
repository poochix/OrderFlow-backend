import mongoose, { Document, Schema } from "mongoose";

// Defined the typescript Interface
// this gives us autoComplete and strict type checking any where we use Customer object in the code

export  interface ICustomer extends Document {

    name?: string;
    companyName: string;
    phone: string;
    email: string;
    gstNumber?: string;
    address: string;
    notes: string;    
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date 

}

//Defined mongoose schema based on our requirements
const customerSchema: Schema = new Schema({
    name: {
        type: String,
        trim: true,
        
    },

    companyName: {
        type: String,
        required: true,
        trim: true,
    },

    phone: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        trim: true,
    },

    gstNumber: {        //optional field for b2b billing
        type: String,
        trim: true
    },

    address: {
        type: String,
        required: true,
    },

    notes: {
        type: String,
        
    },

    //Soft delete implementation 
    isDeleted: {
        type: Boolean,
        default: false,
    },

    deletedAt: {
        type: Date,
        default: null,
    },

},
{
    timestamps: true,
}
)

export default mongoose.model<ICustomer>('Customer', customerSchema);
