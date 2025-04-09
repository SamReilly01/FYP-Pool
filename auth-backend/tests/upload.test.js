const request = require('supertest');
const express = require('express');
const uploadRoutes = require('../routes/upload');
const pool = require('../models/db');
const fs = require('fs');
const path = require('path');

// Mock database pool
jest.mock('../models/db', () => ({
  query: jest.fn()
}));

// Mock fs functions
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn()
}));

// Mock multer
jest.mock('multer', () => {
  const multerMock = () => ({
    single: () => (req, res, next) => {
      req.file = {
        filename: 'test-file-123456.jpg',
        originalname: 'test-image.jpg',
        path: '/uploads/test-file-123456.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 50 // 50KB
      };
      next();
    }
  });
  multerMock.diskStorage = () => ({});
  return multerMock;
});

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api', uploadRoutes);

describe('Upload Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /upload should upload a file and save to database', async () => {
    // Mock database response
    pool.query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        user_id: 123,
        image_url: '/uploads/test-file-123456.jpg',
        uploaded_at: new Date()
      }]
    });

    const response = await request(app)
      .post('/api/upload')
      .field('user_id', '123')
      .attach('file', Buffer.from('test file content'), 'test-image.jpg');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Image uploaded successfully');
    expect(response.body).toHaveProperty('image');
    expect(response.body.image).toHaveProperty('image_url', '/uploads/test-file-123456.jpg');
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query.mock.calls[0][1]).toContain(123); // Check user_id param
  });

  test('POST /upload should handle missing user_id', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('test file content'), 'test-image.jpg');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Invalid or missing user_id');
  });
});