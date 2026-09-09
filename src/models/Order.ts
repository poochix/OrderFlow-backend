import mongoose, { Document, Schema, Types } from "mongoose";
import { string } from "zod";


//Defined TypeScript interface
// this gives us auto complete and strict type checking anywhere

export interface IOrder extends Document {

    orderNumber: string;
    customer: Types.ObjectId;
    productName: string;
    description: string;

    width?: string;
    thickness?: string;


    quantity: number;
    price: number;
    assignedEmployee?: Types.ObjectId;
    status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    deadline: Date;

    dispatch_Qty?: number[];
    // pending_Qty?: number;  calculated in logic

    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;

}

const orderSchema: Schema = new Schema(
    {
        //Auto generated string
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },

        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },

        productName: {
            type: String,
            required: true,
            trim: true,
        },
         
        thickness: {
            type: String,
            trim: true,
        },

        width: {
            type: String,
            trim: true
        },


        description: {
            type: String,
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        // optional assignment for order pool
        assignedEmployee: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,

        },

        // strict status workflow
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
            default: 'Pending',
        },

        // priority levels
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Urgent'],
            default: 'Low',
        },

        deadline: {
            type: Date,
            required: true,
        },

        dispatch_Qty: {
            type: [Number],
            default: 0

        },

        pending_Qty: {
            type: Number,
            trim: true
        },

        //soft delete
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
    },

);


export default mongoose.model<IOrder>('Order', orderSchema);









