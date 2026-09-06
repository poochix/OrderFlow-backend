import mongoose from "mongoose";
import AuditLog, { IAuditLog } from "../models/AuditLog";


interface PaginatedAuditLogs {
    logs: IAuditLog[];
    total: number;
}

interface GetAuditQuery {
    entityId: string;
    page?: number;
    limit?: number;

}

export const getAuditLogService = async (query: GetAuditQuery ): Promise<PaginatedAuditLogs> =>{

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page-1)* limit;

    //against malformed ID
    if(!mongoose.Types.ObjectId.isValid(query.entityId)){
        throw new Error ('Invalid Entity Id format');
    };


    //running Promises 
    const id = query.entityId;
    const [logs, total] = await Promise.all(
        [
            AuditLog.find({entityId: id})
            .populate('performedBy', 'name email')
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit),

            AuditLog.countDocuments({entityId: id})
        ]
    )

    return {logs, total}
}