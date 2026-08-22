import Order from "../models/Order";


export const getManagerAnalyticsService = async () =>{
    const now = new Date();

    //if database failes to return the below aggregation
    const [analytics={}] = await Order.aggregate([
        //filters out soft deleted records
        {
            $match: {isDeleted: false},
        },
        //$facet runs multiple parallel sub-pipelines on matching documents
        {
            $facet: {
                //Overall Orders and Revenue Totals
                overallStats: [
                    {
                        $group: {
                            _id: null,
                            totalOrders: {$sum:1},
                            totalRevenue: {$sum:{$multiply: ['$quantity', '$price']}},
                            avgOrderValue: {$avg: {$multiply: ['$quantity', '$price']}},
                        },  
                    },
                ],
                // Group and counts order by status
                statusBreakdown: [
                    {
                        $group:{
                            _id: '$status',
                            count: {$sum:1}
                        },
                    },
                ] ,
                // Counts overdue Orders (deadline passed but not completed or cancelled)
                overdueStats: [
                    {
                        $match: {
                             deadline: {$lt: now},
                             status: {$nin: ['Completed', 'Cancelled']},

                        },
                    },
                    {
                        $count : 'overdueCount',
                    },
                ],


            },
        },
    ]);

    //Extracts aggregation results safely with fallbacks
    const overall = analytics.overallStats?.[0] || {totalOrders: 0, totalRevenue: 0, avgOrderValue: 0};
    const overdueCount = analytics.overdueStats?.[0]?.overdueCount || 0; 

    //formats statusBreakdown into key-value pairs
    const statusCounts : Record<string, number> ={
        Pending:0,
        'In Progress':0,
        Completed: 0,
        'On Hold': 0,
        Cancelled: 0,

    };

    //added ? so it safely skips the loop  if status breakdown does not exists
    analytics.statusBreakdown?.forEach((item: {_id:string, count:number})=>{

        if(item._id){
            statusCounts[item._id] = item.count
        }
    });

    return {
        totalOrders: overall.totalOrders,
        totalRevenue: Math.round(overall.totalRevenue * 100)/100,
        avgOrderValue: Math.round(overall.avgOrderValue * 100)/100,
        overdueOrders: overdueCount,
        statusCounts,
    }





}