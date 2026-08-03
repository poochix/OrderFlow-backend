import User , {IUser} from "../models/User";
import bcrypt from "bcryptjs";

//defined the input types for registration
interface registerInputData {
    name: string;
    email: string;
    password: string;
    role?:'admin' | 'manager' | 'staff';
}

export const registerUserService = async (inputData: registerInputData): Promise<IUser> =>{
     
    const {name, email, password, role} = inputData;

    //check if user already exists
   const existingUser = await User.findOne({email});

   if(existingUser){
    throw new Error('User with this email is already registered');
   }

   // hashing password securly with salt rounds of 10
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);
   
   //create and save the user to db

   const newUser = await User.create({
    name: name,
    email: email,
    password: hashedPassword,
    ...(role !== undefined && {role}),
   })

   return newUser;




}