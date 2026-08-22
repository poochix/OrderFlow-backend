import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import User from '../models/User';
import Customer from '../models/Customer';
import Order from '../models/Order';

let mongoServer: MongoMemoryServer;
let adminCookie: string;
let managerCookie: string;
let salesCookie: string;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  // 1. Create users with different RBAC roles
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
  });

  const manager = await User.create({
    name: 'Manager User',
    email: 'manager@test.com',
    password: 'password123',
    role: 'manager',
  });

  const sales = await User.create({
    name: 'Sales Rep',
    email: 'sales@test.com',
    password: 'password123',
    role: 'staff',
  });

  // 2. Generate Auth Tokens & HTTP Cookies
  const adminToken = jwt.sign(
    { userId: admin._id, role: admin.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );

  const managerToken = jwt.sign(
    { userId: manager._id, role: manager.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );

  const salesToken = jwt.sign(
    { userId: sales._id, role: sales.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );

  adminCookie = `token=${adminToken}`;
  managerCookie = `token=${managerToken}`;
  salesCookie = `token=${salesToken}`;
});

afterEach(async () => {
  await User.deleteMany({});
  await Customer.deleteMany({});
  await Order.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('GET /api/analytics/dashboard', () => {

  it('should correctly aggregate revenue, status counts, and overdue orders for Admin', async () => {
    // 1. Create dummy customer
    const customer = await Customer.create({
      name: 'Analytics Corp',
      companyName: 'Analytics LLC',
      phone: '1234567890',
      email: 'analytics@corp.com',
      address: '100 Data St',
    });

    const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);   // 7 days ago
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days in future

    // 2. Seed orders with various statuses and prices
    // Order 1: Pending, Future Deadline (Revenue = 2 * 100 = 200)
    await Order.create({
      orderNumber: 'ORD-1001',
      customer: customer._id,
      productName: 'Product A',
      description: 'Desc A',
      quantity: 2,
      price: 100,
      priority: 'Medium',
      status: 'Pending',
      deadline: futureDate,
    });

    // Order 2: In Progress, Past Deadline -> OVERDUE (Revenue = 5 * 50 = 250)
    await Order.create({
      orderNumber: 'ORD-1002',
      customer: customer._id,
      productName: 'Product B',
      description: 'Desc B',
      quantity: 5,
      price: 50,
      priority: 'High',
      status: 'In Progress',
      deadline: pastDate,
    });

    // Order 3: Completed, Past Deadline -> NOT overdue because completed (Revenue = 1 * 500 = 500)
    await Order.create({
      orderNumber: 'ORD-1003',
      customer: customer._id,
      productName: 'Product C',
      description: 'Desc C',
      quantity: 1,
      price: 500,
      priority: 'Low',
      status: 'Completed',
      deadline: pastDate,
    });

    // 3. Dispatch aggregation request
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalOrders).toBe(3);
    expect(res.body.data.totalRevenue).toBe(950);      // 200 + 250 + 500
    expect(res.body.data.avgOrderValue).toBe(316.67);   // Math.round((950 / 3) * 100) / 100
    expect(res.body.data.overdueOrders).toBe(1);        // Only Order 2
    expect(res.body.data.statusCounts.Pending).toBe(1);
    expect(res.body.data.statusCounts['In Progress']).toBe(1);
    expect(res.body.data.statusCounts.Completed).toBe(1);
    expect(res.body.data.statusCounts['On Hold']).toBe(0);
  });

  it('should allow access for Manager role', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Cookie', managerCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject requests from unauthorized roles (Sales / Staff)', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Cookie', salesCookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should reject unauthenticated requests (No Cookie)', async () => {
    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});