import { Request, Response } from "express";
import { registerUserService } from "../services/authService";


export const registerUser = async(req:Request, res:Response): Promise<void> =>{
    
    try {
           const {name, email, password, role } = req.body;

           //calling the service to handle the business logic
           const newUser = await registerUserService({name, email, password, role});

           //sending back success response (excluding the password for security)
           res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data : {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                createdAt: newUser.createdAt,
            },
           });

    } catch (error) {
        if(error instanceof Error){
            res.status(400).json({
                success: 'failed',
                message: error.message,

            });
            return ;
        }
        res.status(500).json({
            status: 'error',
            message: 'An unexpected error has occurred during registration',
        });
        
    }

}