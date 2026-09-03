import { regex } from "zod";
import User from "../models/User";




interface GetUserQuery {
    page? : number;
    limit? : number;
    search? : string;
    role? : string;
}

export const getUserService = async (query: GetUserQuery) =>{
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page-1)* limit;

    const dbQuery :Record<string, unknown> = {};

    if(query.role){
        dbQuery.role = query.role;
    }

    if(query.search){
        dbQuery.$or = [
            {name: {$regex: query.search, $options: 'i'}},
            {email: {$regex: query.search, $options: 'i'}}
        ]
    }


    const [users, total] = await Promise.all([
        User.find(dbQuery)
        .skip(skip)
        .limit(limit)
        .sort({createdAt: -1}),

        User.countDocuments(dbQuery)
    ]);

    const totalPages = Math.ceil(total/limit)

    return {
        users,
        pagination:{
            totalUsers: total,
            totalPages: totalPages,
            currentPage: page,
            limit,
        }
    }


}