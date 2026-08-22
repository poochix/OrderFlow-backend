import { Request, Response } from "express"
import { getManagerAnalyticsService } from "../services/analyticsService";


export const getManagerAnalytics = async(req:Request, res:Response) : Promise<void> =>{
    try {
        const analyticsData = await getManagerAnalyticsService();

        res.status(200).json({
            success: true,
            message: 'Analytics dataset generated successfully',
            data: analyticsData,
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An unexpected error has occured while executing aggregation pipeline',
        });
    }
};