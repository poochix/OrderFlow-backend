

import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/User';
import request from 'supertest';


let mongoServer: MongoMemoryServer;


// Before all tests, spins up an in-memory MongoDB server and connect Mongoose to it 

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
})

// after each test ,  clear out any user data so tests stay independent
afterEach(async () => {
    await User.deleteMany({});
});

// after all Tests are complete, shut down the memory server and disconnect the db connection

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop()
});

describe('POST /api/auth/register', () => {
    it('should successfully reigter a new user when valid data is provided', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'testuser@gmail.com',
                password: 'securePaasword123',
                role: 'staff',
            });

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('success');
        console.log("========",res.body)
        expect(res.body.data.email).toBe('testuser@gmail.com');
        expect(res.body.data).not.toHaveProperty('password'); // security check: ensures that password is not leaked
    });


    it('should fail registration if required fields are missing or invalid (zod validation)', async ()=>{
        const res = await request(app)
        .post('/api/auth/register')
        .send({
             name: 'T', //too short
                email: 'testuser', // bad format
                password: '123', // to short
               
        });

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('fail');
        expect(res.body.errors).toBeDefined();
    });
});