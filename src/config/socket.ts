import {Server as HttpServer} from 'http'
import {Server, Socket} from 'socket.io'

let io:Server;

export const initSocket = (httpServer: HttpServer): Server =>{
    io = new Server(httpServer, {
        cors: {
            //allows connection from frontend
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
            credentials: true // strictly required as we are using http-Only cookie for authentication
        },
    });

    io.on('connection', (socket: Socket)=>{
        console.log(`client connected to WebSockets : ${socket.id}`);

        //listens for custom events (eg joining a specific room for managers)
        socket.on('join_dashboard', ()=>{
            socket.join('admin_dashboard');
            console.log(`client ${socket.id} has joined the admin_dashboard`);
        });

        socket.on('disconnect', ()=>{
            console.log(`client :${socket.id} disconnected `)
        });
    });

    return io;
};

export const getIo = ():Server =>{
    if(!io){
        throw new Error('Socket.io has not initialized!');
    }
    return io;
}

