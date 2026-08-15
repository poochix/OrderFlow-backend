import Counter from "../models/Counter"



//automatically increments the sequence counter and returns the new value
export const getNextSequence = async (sequenceName: string): Promise<number> =>{

    const sequenceDocument = await Counter.findByIdAndUpdate(
        sequenceName,
        {$inc: {seq:1}},
        // {
        //     new: true,   // returns updated document 
        //     upsert: true  // creates new Counter if it does not exist
        // },
        {
            returnDocument: 'after'   // fixes mongoose deprecating warning
        },
    );

    //if sequence document exists then will return incremented value
if(sequenceDocument){
    return sequenceDocument.seq;
}

//if it does not exists then this intialized the counter
try {
    const newCounter = await Counter.create({
        _id: sequenceName,
        seq: 1001,
    })

    return newCounter.seq;
    

} catch (error: any) {
    //Race condition fallback, 
    //if 5 requests generated to create the very first order in the very same milisecond,
    // 1 will succeed in creating the order , the rest 4 will fail with a duplicate key error (11000)
    //this catches the 11000 error code , and retry the atomic increment
    if(error.code===11000){
        const retryDocument = await Counter.findByIdAndUpdate(
            sequenceName,
            {$inc: {seq:1}},
            {returnDocument: 'after'}   
        )
        if(!retryDocument ){
            throw new Error(`Failed to Initialize : ${sequenceName}`);
        }
        return retryDocument.seq;
    }
   // If it is NOT an 11000 error, we must throw it so the controller can catch it!
    throw error;
}




            

}