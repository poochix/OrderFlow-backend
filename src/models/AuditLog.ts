import mongoose ,{ Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
    entityType: 'Order' | 'Customer';
    entityId: mongoose.Types.ObjectId;
    action: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'DELETED';
    performedBy: mongoose.Types.ObjectId;
    changes? : Record<string, any>;
    createdAt: Date;
}

const AuditLogSchema = new Schema(
    {
        entityType : {
            type: String,
            enum: ['Order', 'Customer'],
            required: true,
        },

        entityId: {
            type: Schema.Types.ObjectId,
            required: true,
        },

        action : {
            type: String,
            enum : ['CREATED', 'UPDATED', 'STATUS_CHANGED', 'DELETED'],
            required: true,
        },

        performedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        changes: {
            type: Schema.Types.Mixed
        },
    },
    {
        timestamps: {createdAt: true, updatedAt: false},
    }
);

//Indexes for rapid timeline retrieval and user accountability lookups

AuditLogSchema.index({entityId: 1});
AuditLogSchema.index({perfomedBy: 1});
AuditLogSchema.index({createdAt: -1});

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);




