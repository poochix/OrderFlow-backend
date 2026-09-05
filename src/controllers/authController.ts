import { Request, Response } from "express";
import { loginUserService, registerUserService } from "../services/authService";
import User from "../models/User"
import { success } from "zod";

//REGISTER USER Controller
export const registerUser = async (req: Request, res: Response): Promise<void> => {

    try {
        const { name, email, password, role } = req.body;

        //calling the service to handle the business logic
        const newUser = await registerUserService({ name, email, password, role });

        //sending back success response (excluding the password for security)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                createdAt: newUser.createdAt,
            },
        });

    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({
                success: false,
                message: error.message,

            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'An unexpected error has occurred during registration',
        });

    }

}


//=======================================================================================================

// LOGIN USER controller

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {

        const { email, password } = req.body;

        // destructuring token and user from loginUserService
        const { token, user } = await loginUserService({ email, password });

        //sends token inside http-only cookie for max security from xss attacks
        // res.cookie('token', token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production',  // true in production cookie sent through https connection
        //     sameSite: 'strict',
        //     maxAge: 24 * 60 * 60 * 1000,    
        // });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: 'user logged in successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        if (error instanceof Error) {
            res.status(401).json({
                success: false,
                message: error.message,
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'An unexpected error has occured during login',
        });

    }

}

//============================================================================================




export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?._id).select('-password');

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: `${user.name}`,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
};