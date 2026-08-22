import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import User from '../models/User';
import OpenAI from 'openai';

// 1. 🚀 ENTERPRISE MOCKING: Intercept the OpenAI module completely
jest.mock('openai');

let mongoServer: MongoMemoryServer;
let authCookie: string;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  const user = await User.create({
    name: 'Sales Rep',
    email: 'sales@test.com',
    password: 'securepassword',
    role: 'staff',
  });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );
  authCookie = `token=${token}`;
});

afterEach(async () => {
  await User.deleteMany({});
  jest.clearAllMocks(); // Reset our OpenAI mock between tests
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('POST /api/ai/parse-order', () => {

  it('should successfully intercept AI and return validated JSON order data', async () => {
    // 2. Setup our fake AI response that matches our Zod Schema
    const fakeAiResponse = {
      customerName: 'Acme Corp',
      productName: 'Steel Pipes',
      quantity: 50,
      priority: 'High',
      deadline: '2026-12-01T00:00:00.000Z',
      notes: 'Urgent delivery required',
    };

    // 3. Override the OpenAI mock to return our fake stringified JSON
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(fakeAiResponse),
          },
        },
      ],
    });

    // Apply the mock to the instances
    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));

    // 4. Fire the request
    const res = await request(app)
      .post('/api/ai/parse-order')
      .set('Cookie', authCookie)
      .send({
        text: 'Need 50 Steel pipes for Acme Corp by Dec 1st. Make it high priority, urgent delivery.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.productName).toBe('Steel Pipes');
    expect(res.body.data.quantity).toBe(50);
    
    // Verify our mock was actually called instead of the real OpenAI API
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('should reject requests with no text (Zod validation)', async () => {
    const res = await request(app)
      .post('/api/ai/parse-order')
      .set('Cookie', authCookie)
      .send({
        text: 'Too short', // Fails the min(10) Zod rule
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});