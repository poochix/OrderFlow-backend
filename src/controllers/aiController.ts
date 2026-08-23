import {Request, Response} from 'express';
import { parseOrderFromTextService } from '../services/aiService';


export const parseOrderText = async(req:Request, res:Response): Promise<void> =>{
    try {
        const {text } = req.body;
        const parsedOrder = await parseOrderFromTextService(text);
            res.status(200).json({
                success: true,
                message: 'Text successfully parsed into structured order data',
                data: parsedOrder,
            })
    } catch (error) {
        if(error instanceof Error){
            res.status(400).json({
                success: false,
                message: error.message,
            });
            return;
        }
        res.status(500).json({
            success:false,
            message: 'An unexpected error has occured during AI parsing',
        })
    }
}