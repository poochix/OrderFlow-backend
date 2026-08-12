import mongoose, { Document, Schema } from "mongoose";


//Omit overrides the defined type of _id from document
export interface ICounter extends Omit<Document, '_id'>{

    _id: string;  // stores name of the sequesnce(e.g "OrderNumber")
    seq: number;  // stores the current value of the order(1001 )
}

 const counterSchema = new Schema({
    _id:{
        //name id as string so that we can use what ever we want
        type: String,
        required: true,
    },

    seq:{
        type: Number,
        default: 1000, 
    },

 })

 export default mongoose.model<ICounter>('Counter', counterSchema);