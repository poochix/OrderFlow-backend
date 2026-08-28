import User , {IUser} from "../models/User";
import bcrypt from "bcryptjs";
import  jwt  from "jsonwebtoken";
//  const jwt = require('jasonwebtoken')
 
// REGISTER SERVICE

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


//============================================================
  // LOGIN SERVICE


  //Defined an interface for the loginUservice
  interface loginInputData {
    email: string;
    password: string;
  };

  //defined the login logic
  export  const loginUserService = async (inputData: loginInputData) =>{
    
    //destructuring
    const {email, password} = inputData ;
   
    //checking user in database
    const user = await User.findOne({email});
    if(!user){
        throw new Error('Invalid email or password');
    }

    // Support both bcrypt-hashed passwords and legacy plain-text rows.
    // This keeps older seeded users working while migrating them to a hash on successful login.
    const isHashedPasswordValid = await bcrypt.compare(password, user.password).catch(() => false);
    const isLegacyPlainTextPassword = user.password === password;

    if(!isHashedPasswordValid && !isLegacyPlainTextPassword){
        throw new Error('Invalid email or Password');
    }

    // Rehash legacy text passwords after a successful match so the account is migrated safely.
    if (isLegacyPlainTextPassword) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
    }

    
   const jwtSecret = process.env.JWT_SECRET;
   if(!jwtSecret){
    throw new Error('No Jwt ket found iin env');
   };

    const token =  jwt.sign(
        { userId: user._id, role: user.role },

        jwtSecret,

        {expiresIn: '1d'}

    ) ;
       
    // check user for security leakage
   return {token , user}
   


  }