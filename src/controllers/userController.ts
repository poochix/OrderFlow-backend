import {Request, Response } from 'express'
import { getUserService } from '../services/userService'


export const getUser = async (req:Request, res:Response): Promise<void>=>{
    try {
   const parsedPage = parseInt(req.query.page as string, 10) ;
    const parsedLimit = parseInt(req.query.limit as string, 10);

     const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
        const limit = isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit;

    const search =
            typeof req.query.search === "string"
                ? req.query.search
                : undefined;

        const role =
            typeof req.query.role === "string"
                ? req.query.role
                : undefined;

    const query = { page, limit } as Parameters<typeof getUserService>[0];

    if (search !== undefined) {
        query.search = search;
    }

    if (role !== undefined) {
        query.role = role;
    }

    const result = await getUserService(query)

    res.status(200).json({
        success: true,
   
        data: result.users,
        pagination: result.pagination,
    })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An unexpected ocurred while fetching users"
        })
    }
}