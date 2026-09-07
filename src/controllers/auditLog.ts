import {Request, Response} from 'express'
import { getAuditLogService } from '../services/auditLogService';


export const getAuditLogs = async (req:Request, res:Response) : Promise<void> =>{
    try {

        const {entityId} = req.params;
        const page = parseInt(req.query.page as string) ?? 1;
        const limit = parseInt(req.query.limit as string) ?? 10;
        if (!entityId || Array.isArray(entityId)) {
            res.status(400).json({
                success: false,
                message: 'entityId is required'
            });
            return;
        }
        const result = await getAuditLogService({entityId, page, limit} )
        res.status(200).json({
            success: true,
            data: result.logs,
            pagination: {
                total: result.total,
                page,
                limit,
            },
        });
    } catch (error) {
        if(error instanceof Error){
            res.status(400).json({
                success: false,
                message: error.message
            })
            return;
        }

        res.status(500).json({
            success:false,
            message: 'An unexpected error occured while fetching the Audit Logs'
        });
    }
}