import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import User from '../models/User';

// 1. 🚀 THE FINAL FIX: The magic '__esModule: true' flag
// This guarantees Express receives a real function, not 'undefined'
jest.mock('../services/aiService', () => ({
  __esModule: true,
  parseOrderFromTextService: jest.fn().mockResolvedValue({
    customerName: 'Acme Corp',
    productName: 'Steel Pipes',
    quantity: 50,
    priority: 'High',
    deadline: '2026-12-01T00:00:00.000Z',
    notes: 'Urgent delivery required',
  }),
}));

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
  jest.clearAllMocks();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('POST /api/ai/parse-order', () => {
  
  it('should successfully intercept the mocked service and return JSON order data', async () => {
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
  });

  it('should reject requests with no text (Zod validation)', async () => {
    const res = await request(app)
      .post('/api/ai/parse-order')
      .set('Cookie', authCookie)
      .send({
        text: 'Too short', 
      });

    // Zod will now correctly catch this and return a 400!
    expect(res.status).toBe(400);
    expect(res.body.success).toBeDefined();
  });
});

/**
 * AI INGESTION LAYER - TEST SUITE RETROSPECTIVE
 * Documented fixes for CI/CD Pipeline integration.
 * 
 * 1. OpenAI SDK Initialization Crash
 *    - Error: `new OpenAI()` crashed immediately in Jest due to missing OPENAI_API_KEY.
 *    - Fix: Injected a fallback dummy key `apiKey: process.env.OPENAI_API_KEY || 'dummy_test_key'` to bypass the init block during testing.
 * 
 * 2. Jest Mock Hoisting Trap (500 Error)
 *    - Error: Node.js evaluated the import chain and triggered the SDK crash before the local Jest mock was initialized.
 *    - Fix: Utilized a Jest factory function `jest.mock('openai', () => {...})` which auto-hoists to intercept the module.
 * 
 * 3. ES Module Transpilation Trap (500 Error)
 *    - Error: Jest failed to format the mocked module for TypeScript ES6 syntax, passing `undefined` to the controller.
 *    - Fix: Added the magic `__esModule: true` flag to the mock factory to guarantee Express received a callable function.
 * 
 * 4. The "Servie" Typo (500 Error)
 *    - Error: A spelling error (`parseOrderFromTextServie`) caused the controller to import an undefined mock, crashing the route.
 *    - Fix: Synchronized the spelling to `parseOrderFromTextService` across the service, controller, and test files.
 * 
 * 5. Route Validation Mismatch (500/400 Error)
 *    - Error: The route middleware mistakenly validated the incoming `req.body` against the `aiParsedOrderSchema` (the expected AI output) instead of `parseOrderTextSchema` (the expected frontend input).
 *    - Fix: Swapped the validator in `aiRoutes.ts` to strictly validate the incoming text payload, restoring the correct HTTP status flow.
 */