import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose  from "mongoose";
import jwt from 'jsonwebtoken'
import request from "supertest";
import User from "../models/User";
import Customer from "../models/Customer";
import app from "../app";



let mongoServer: MongoMemoryServer;
let adminCookie: string

//spins up the in-memory MongoDb server

beforeAll(async ()=>{
   //sets dummy jwt secret for test if not present 
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
   
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

//before each test , creates a dummy admin user and generates user token

beforeEach(async ()=>{
    const admin = await User.create({
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: "admin123",
        role: 'admin',
    });

    //generates a valid token for our mock admin
    const token = jwt.sign({userId: admin._id, role: admin.role},
        process.env.JWT_SECRET as string,
        {expiresIn: '1h'}
    );

    //format it exactly how cookie-parser accepts it 
    adminCookie = `token=${token}`;

});

//clears out collection after each test to ensure test isolation
afterEach(async ()=>{
    await User.deleteMany({});
    await Customer.deleteMany({});
});

//shuts down the memory
afterAll(async ()=>{
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});


describe('POST /api/customers/create', ()=>{
    it('should successfully create a customer when authenticated and valid data is given', async ()=>{
        const res = await request(app)
        .post('/api/customers/create')
        .set('Cookie',adminCookie)
        .send({
            name: 'John Doe',
            companyName: 'Acme Corp',
            phone: '1234567890',
            email: 'johndoe@gmail.com',
            address: '123 business road, tech city',
        });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('John Doe');
        expect(res.body.data.companyName).toBe('Acme Corp');

    });

    it('should reject the request if user is not authenticated (no-cookie)', async ()=>{
        const res = await request(app)
        .post('/api/customers/create')
        // !!!NO COOKIE !!!
        .send({
            name: "Hacker Name",
            companyName: "Hacker Group",
            phone: "0987654321",
            email: 'hacker@gmail.com',
            address: 'Nowhere',

        });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Not authorized');
    });

    it('should fail validation if required field are missing (Zod Validation)', async () =>{
        const res = await request(app)
        .post('/api/customers/create')
        .set('Cookie', adminCookie)
        .send({
            name: "Incomplete User",
            //missing companyName, phone, email, and address

        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false) // standard middle ware error format
        expect(res.body.errors).toBeDefined();
    } );

    it('should reject the request if a customer with same email already exists', async ()=>{
        // create first customer
        await Customer.create({
           name: 'Original User',
            companyName: "Original Corp",
            phone: '1111111111',
            email: 'duplicate@gmail.com',
            address: 'original street, duplicate city'
        });

        //crreating duplicate user with the same credentials

        const res = await request(app)
        .post('/api/customers/create')
        .set('Cookie', adminCookie)
        .send({
             name: 'New User',
            companyName: "New Corp",
            phone: '2222222222',   //Diff phone
            email: 'duplicate@gmail.com', //Same email
            address: 'new street, duplicate city'
        });

        expect(res.status).toBe(400)
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('already exists');
    });
});

