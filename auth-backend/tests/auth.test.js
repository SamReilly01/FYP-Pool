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
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn((token, secret, callback) => {
    if (token === 'test-token') {
      callback(null, { id: 1, email: 'test@example.com' });
    } else {
      callback(new Error('Invalid token'), null);
    }
  })
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    test('should create a new user successfully', async () => {
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
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
        ['test@example.com', 'hashedPassword']
      );
    });

    test('should handle duplicate email error', async () => {
      // Mock database error for duplicate email
      const error = new Error('Duplicate email');
      error.code = '23505';
      pool.query.mockRejectedValueOnce(error);

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'existing@example.com', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email already exists');
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test('should handle database errors', async () => {
      // Mock general database error
      pool.query.mockRejectedValueOnce(new Error('Database connection error'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /login', () => {
    test('should authenticate valid user and return token', async () => {
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
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        ['test@example.com']
      );
    });

    test('should reject unknown user', async () => {
      // Mock empty database response (user not found)
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test('should reject invalid password', async () => {
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
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test('should handle database errors during login', async () => {
      // Mock database error
      pool.query.mockRejectedValueOnce(new Error('Database connection error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('GET /profile', () => {
    test('should return user profile when token is valid', async () => {
      // Mock database response for profile query
      pool.query.mockResolvedValueOnce({
        rows: [{ 
          id: 1, 
          email: 'test@example.com', 
          created_at: new Date('2023-01-01') 
        }]
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', 1);
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, email, created_at FROM users WHERE id = $1',
        [1] // Should match the id from the mocked verify function
      );
    });

    test('should reject requests with no token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Access token required');
      expect(pool.query).not.toHaveBeenCalled();
    });

    test('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
      expect(pool.query).not.toHaveBeenCalled();
    });

    test('should handle case when user not found', async () => {
      // Mock empty result
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('Password and Email Update Routes', () => {
    test('POST /update-password should update password when current password is correct', async () => {
      // Mock user lookup
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, email: 'test@example.com', password: 'hashedPassword' }]
      });
      
      // Mock update query
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/update-password')
        .set('Authorization', 'Bearer test-token')
        .send({ 
          user_id: 1, 
          current_password: 'password123', 
          new_password: 'newpassword123' 
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Password updated successfully');
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    test('POST /update-email should update email for authenticated user', async () => {
      // Mock email check
      pool.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock update query
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/update-email')
        .set('Authorization', 'Bearer test-token')
        .send({ 
          user_id: 1, 
          new_email: 'newemail@example.com' 
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Email updated successfully');
      expect(response.body).toHaveProperty('email', 'newemail@example.com');
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    test('POST /update-email should prevent updates to an already used email', async () => {
      // Mock email already exists
      pool.query.mockResolvedValueOnce({ rows: [{ id: 2, email: 'existing@example.com' }] });

      const response = await request(app)
        .post('/api/auth/update-email')
        .set('Authorization', 'Bearer test-token')
        .send({ 
          user_id: 1, 
          new_email: 'existing@example.com' 
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email already in use');
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /account', () => {
    test('should delete user account and associated data', async () => {
      // Mock delete queries
      pool.query.mockResolvedValueOnce({ rows: [] }); // Delete simulation_results
      pool.query.mockResolvedValueOnce({ rows: [] }); // Delete uploaded_images
      pool.query.mockResolvedValueOnce({ rows: [] }); // Delete user

      const response = await request(app)
        .delete('/api/auth/account')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Account deleted successfully');
      expect(pool.query).toHaveBeenCalledTimes(3);
    });
  });
});