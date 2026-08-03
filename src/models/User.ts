import mongoose, {Document, Schema} from "mongoose";

// defined the TypeScript Interface
// this gives us autocomplete and strict type-checking anywhere we use a  User Object  in out code

export interface IUser  extends Document {
    name: string;
    email: string;
    password: string;
    role: 'admin'| 'manager'| 'staff';
    createdAt: Date;
    updatedAt: Date;

}

//defined the mongoose Schema
// this tell MongoDb exactly how to structure the data and enforces rules at the database level

const userSchema: Schema  = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email:{
            type: String,
            required: true,
            unique: true,
            lowercase:true,
            trim:true
        },
        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ['admin', 'manager', 'staff'],
            default: 'staff'
        },

    },
{
    timestamps: true,
}
)

export default mongoose.model<IUser>('User', userSchema);