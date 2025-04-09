const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');
const pool = require('../models/db');

// Mock the database pool
jest.mock('../models/db', () => ({
  query: jest.fn()
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test-token')
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /register should create a new user', async () => {
    // Mock database response
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: 'test@example.com' }]
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user_id', 1);
    expect(response.body).toHaveProperty('email', 'test@example.com');
    expect(response.body).toHaveProperty('message', 'Registration successful');
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test('POST /register should handle duplicate email', async () => {
    // Mock database error for duplicate email
    const error = new Error('Duplicate email');
    error.code = '23505';
    pool.query.mockRejectedValueOnce(error);

    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'existing@example.com', password: 'password123' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Email already exists');
  });

  test('POST /login should authenticate valid user', async () => {
    // Mock database response for user lookup
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: 'test@example.com', password: 'hashedPassword' }]
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user_id', 1);
    expect(response.body).toHaveProperty('email', 'test@example.com');
    expect(response.body).toHaveProperty('token', 'test-token');
    expect(response.body).toHaveProperty('message', 'Login successful');
  });

  test('POST /login should reject invalid user', async () => {
    // Mock empty database response (user not found)
    pool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found');
  });

  test('POST /login should reject invalid password', async () => {
    // Mock database response
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: 'test@example.com', password: 'hashedPassword' }]
    });
    
    // Mock bcrypt.compare to return false (password doesn't match)
    require('bcryptjs').compare.mockResolvedValueOnce(false);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid password');
  });

  test('GET /profile should return user profile with valid token', async () => {
    // Mock token verification
    require('jsonwebtoken').verify = jest.fn((token, secret, callback) => {
      callback(null, { id: 1, email: 'test@example.com' });
    });

    // Mock database response
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: 'test@example.com', created_at: new Date() }]
    });

    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id', 1);
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });
});