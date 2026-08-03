import mongoose from 'mongoose'
 
const dns = require('dns')

dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
])

const connectDB = async () : Promise<void> =>{

    try {
        //grab the connection string from Environment variables
        const mongoURI = process.env.MONGO_URI;
        
        //  typescript strict mode error checking 
        if(!mongoURI){
            throw new Error('Mongo Uri is missing in the .env file');
        }
    
        // attempt the connection
        const conn = await mongoose.connect(mongoURI);
  
        //log success with connected host
         console.log(`Mongo DB connected : ${conn.connection.host}`);

    } catch (error) {
        // narrow the error type for strict type checking compatibility
        if(error instanceof Error){
            console.error(`Mongo DB connection failed due to ${error.message}`);
        } else{
            console.error('Mongo DB connection failed due to an unknown error');
        }

        //exit the node process with  a failure code = (1) if connection fails

        process.exit(1);
    }
};


export default connectDB;