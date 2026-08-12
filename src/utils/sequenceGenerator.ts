import Counter from "../models/Counter"



//automatically increments the sequence counter and returns the new value
export const getNextSequence = async (sequenceName: string): Promise<number> =>{

    const sequenceDocument = await Counter.findByIdAndUpdate(
        sequenceName,
        {$inc: {seq:1}},
        {
            new: true,   // returns updated document 
            upsert: true  // creates new Counter if it does not exist
        },
    )

    return sequenceDocument.seq ;           

}