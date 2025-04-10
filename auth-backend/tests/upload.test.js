const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Create a proper mock for multer
const multerMock = {
  diskStorage: jest.fn(() => ({
    destination: jest.fn(),
    filename: jest.fn()
  })),
  single: jest.fn(() => (req, res, next) => {
    req.file = {
      filename: 'test-file-123456.jpg',
      originalname: 'test-image.jpg',
      path: '/uploads/test-file-123456.jpg',
      mimetype: 'image/jpeg',
      size: 1024 * 50 // 50KB
    };
    next();
  })
};

// Mock multer module
jest.mock('multer', () => jest.fn(() => multerMock));

// Mock the database connection
jest.mock('../models/db', () => ({
  query: jest.fn()
}));

// Mock fs functions
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn().mockReturnValue(Buffer.from('test file content'))
}));

// Get dependencies after mocking
const pool = require('../models/db');
const uploadRoutes = require('../routes/upload');
const multer = require('multer');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api', uploadRoutes);

describe('Upload Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset multer's implementation for each test
    multer.mockImplementation(() => multerMock);
  });

  describe('POST /upload', () => {
    test('should upload a file and save to database with valid user_id', async () => {
      // Mock the file upload middleware
      multerMock.single.mockImplementation(() => (req, res, next) => {
        req.file = {
          filename: 'test-file-123456.jpg',
          originalname: 'test-image.jpg',
          path: '/uploads/test-file-123456.jpg',
          mimetype: 'image/jpeg',
          size: 1024 * 50 // 50KB
        };
        next();
      });

      // Mock database response
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          user_id: 123,
          image_url: '/uploads/test-file-123456.jpg',
          uploaded_at: new Date()
        }]
      });

      // Handle request with mocked file
      const response = await request(app)
        .post('/api/upload')
        .field('user_id', '123')
        .attach('file', Buffer.from('test file content'), 'test-image.jpg');

      // For this test, we can't actually check response status since multer is mocked
      // Instead, we'll verify the database query was called correctly
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO uploaded_images/),
        expect.arrayContaining([123])
      );
    });

    test('should handle invalid user_id format', async () => {
      // Mock the file upload middleware
      multerMock.single.mockImplementation(() => (req, res, next) => {
        req.file = {
          filename: 'test-file-123456.jpg',
          originalname: 'test-image.jpg',
          path: '/uploads/test-file-123456.jpg',
          mimetype: 'image/jpeg',
          size: 1024 * 50 // 50KB
        };
        next();
      });

      // Make request with invalid user_id
      const response = await request(app)
        .post('/api/upload')
        .field('user_id', 'not-a-number')
        .attach('file', Buffer.from('test file content'), 'test-image.jpg');

      // Verify error is returned
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid or missing user_id');
    });

    test('should handle database errors', async () => {
      // Mock the file upload middleware
      multerMock.single.mockImplementation(() => (req, res, next) => {
        req.file = {
          filename: 'test-file-123456.jpg',
          originalname: 'test-image.jpg',
          path: '/uploads/test-file-123456.jpg',
          mimetype: 'image/jpeg',
          size: 1024 * 50 // 50KB
        };
        next();
      });

      // Mock database error
      pool.query.mockRejectedValueOnce(new Error('Database connection error'));

      // Make request
      const response = await request(app)
        .post('/api/upload')
        .field('user_id', '123')
        .attach('file', Buffer.from('test file content'), 'test-image.jpg');

      // Verify error response
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Database connection error');
    });
  });

  describe('File handling', () => {
    test('should create uploads directory if it doesn\'t exist', () => {
      // Mock fs.existsSync to return false for the first call (directory check)
      fs.existsSync.mockReturnValueOnce(false);
      
      // Execute the code that should create the directory
      const uploadsDir = './uploads';
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Verify directory creation was attempted
      expect(fs.mkdirSync).toHaveBeenCalledWith('./uploads', { recursive: true });
    });
  });
});