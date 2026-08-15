import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import request from "supertest";
import User from "../models/User";
import Customer from "../models/Customer";
import Order from "../models/Order";
import Counter from "../models/Counter";
import app from "../app";





let mongoServer: MongoMemoryServer
let authCookie: string;
let validCustomerId: string;


beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri()
    await mongoose.connect(uri);

});

beforeEach(async () => {
    // creating a dummy authenticated user
    const user = await User.create({
        name: 'Sales Rep',
        email: 'salerep@gmail.com',
        password: 'testSalesRep',
        role: 'staff',

    })

    //creating token
    const token = jwt.sign(
        { userId: user._id, role: 'staff' },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
    );
    authCookie = `token=${token}`;

    // Creating a dummy customer (Orders requires a valid customer id)

    const customer = await Customer.create({
        name: 'test customer',
        companyName: 'Tech Corp LLC',
        phone: '1234567890',
        email: 'testCustomer',
        address: 'test company dehli',
        
    });

    validCustomerId = customer._id.toString();

});

afterEach(async () => {
    // cleans the data base after each test so that counters and data can be reset

    await User.deleteMany({});
    await Customer.deleteMany({});
    await Order.deleteMany({});
    await Counter.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop()
});


describe('POST /api/orders/create', () => {
    it('should success fully create an order and assign ORD-1001', async () => {
        const res = await request(app)
            .post('/api/orders/create')
            .set('Cookie', authCookie)
            .send({
                customer: validCustomerId,
                productName: "5130",
                description: '60mm 70mm ',
                quantity: 2000,
                price: 25,
                priority: 'Medium',
                deadline: '2026-12-31T00:00:00.000Z',
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.orderNumber).toBe('ORD-1001'); //mathematical proving order starts from here
        expect(res.body.data.productName).toBe('5130');

    });

    it('should prevent Order creation if valid customer id does not exists in the db', async () => {
        const fakeCustomerId = new mongoose.Types.ObjectId().toString()
        const res = await request(app)
            .post('/api/orders/create')
            .set('Cookie', authCookie)
            .send({
                customer: fakeCustomerId,  // wrong cutomerId
                productName: "5100",
                description: '60mm  ',
                quantity: 2000,
                price: 25,
                priority: 'Medium',
                deadline: '2026-12-25T00:00:00.000Z',
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('customer does not exist');
    });


    it('should block request with negative quantities and invalid data (zod validation)', async () => {
        const res = await request(app)
            .post('/api/orders/create')
            .set('Cookie', authCookie)
            .send({
                customer: validCustomerId,
                productName: "5130",
                description: '60mm 70mm ',
                quantity: -2000,
                price: '25',
                priority: 'Medium',
                deadline: 'fake date',
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toBeDefined();
    });


    //===============================================
    //         CONCURRENCY TEST
    //==============================================

    it('should generate unique order numbers for concurrent requests', async () => {
        const orderPayload = {
            customer: validCustomerId,
            productName: 'Bulk Order',
            description: 'Testing concurrency',
            quantity: 100,
            price: 50,
            deadline: '2026-12-31T00:00:00.000Z',
        };

        const concurrentRequests = Array.from({ length: 5 }).map(() =>
            request(app).post('/api/orders/create').set('Cookie', authCookie).send(orderPayload)
        );

        const responses = await Promise.all(concurrentRequests);

        // ensures all 5 succeeds
        responses.forEach((res) => expect(res.status).toBe(201));

        //Extracts the order numbers
        const orderNumbers = responses.map((res) => res.body.data.orderNumber);

        // sorting them for strict assertion
        orderNumbers.sort();

        //proves there  are exact 5 ordernumbers and are in sequence
        expect(orderNumbers).toHaveLength(5);
        expect(orderNumbers).toEqual([
            'ORD-1001',
            'ORD-1002',
            'ORD-1003',
            'ORD-1004',
            'ORD-1005',

        ])

        //checks in db too
        const orders = await Order.find({});

        expect(orders).toHaveLength(5);

    })

})