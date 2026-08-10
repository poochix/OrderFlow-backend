import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'
import User, { IUser } from "../models/User";


// extends Express Request interface so typescript recognizes 'req.user'
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

interface jwtPayload {
    userId: string;
    role: 'admin' | 'manager' | 'staff';
}

// this authentication middleware check whether user is logged in or not 
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {

        const token = req.cookies.token;

        if(!token){
            res.status(401).json({
                success: false,
                message: 'Not authorized, no Token',
            });
            return;
        }

        const jwtSecret = process.env.JWT_SECRET;

        if(!jwtSecret){
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        const decoded = jwt.verify(token, jwtSecret) as jwtPayload ;

        //finds the user in db (excluding the password) and checks they exist
        const currentUser = await User.findById(decoded.userId).select('-password');
        if(!currentUser || currentUser.isDeleted){
            res.status(401).json({
                success: false,
                message: 'No user found or user has been deleted',
            });
            return;
        }

        //attaches the currentUser to request object
        req.user = currentUser;
        next();



    } catch (error) {

        res.status(401).json({
            success: false,
            message: 'Not authorized, token failed',

        })
        return;
    }
}


export const restrictTo = (...allowedRoles : ('admin'| 'manager' | 'staff')[]) =>{

    return (req:Request, res:Response, next:NextFunction) : void =>{
        if(!req.user || !allowedRoles.includes(req.user.role)){
            res.status(403).json({
                success:false,
                message: 'You do not have permission to perform this action'
            });
            return;
        }
        next();
    };
};