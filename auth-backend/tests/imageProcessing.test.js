const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Mock the database pool
jest.mock('../models/db', () => ({
  query: jest.fn()
}));

// Create a mock for PythonShell
class MockPythonShell {
  constructor() {
    this.messageHandlers = {};
    this.stderrHandlers = {};
    this.endHandler = null;
  }

  on(event, callback) {
    if (event === 'message') {
      this.messageHandlers[event] = callback;
    } else if (event === 'stderr') {
      this.stderrHandlers[event] = callback;
    }
    return this;
  }

  end(callback) {
    this.endHandler = callback;
  }

  // Helper methods to trigger events during tests
  emitMessage(message) {
    if (this.messageHandlers['message']) {
      this.messageHandlers['message'](message);
    }
  }

  emitStderr(error) {
    if (this.stderrHandlers['stderr']) {
      this.stderrHandlers['stderr'](error);
    }
  }

  emitEnd(error, code, signal) {
    if (this.endHandler) {
      this.endHandler(error, code, signal);
    }
  }
}

// Mock the PythonShell module
jest.mock('python-shell', () => {
  return {
    PythonShell: jest.fn().mockImplementation(() => new MockPythonShell())
  };
});

// Mock fs functions
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  statSync: jest.fn().mockReturnValue({ size: 1024 * 1024 }), // 1MB
  readFileSync: jest.fn().mockReturnValue(Buffer.from('test file content')),
  readdirSync: jest.fn().mockReturnValue(['debug1.jpg', 'debug2.jpg'])
}));

// Mock multer with the proper structure
jest.mock('multer', () => {
  return jest.fn().mockImplementation(() => ({
    diskStorage: jest.fn().mockReturnValue({
      destination: jest.fn(),
      filename: jest.fn()
    }),
    single: jest.fn().mockReturnValue((req, res, next) => {
      req.file = {
        filename: 'test-image.jpg',
        path: '/uploads/test-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 50 // 50KB
      };
      next();
    })
  }));
});

// Import dependencies after mocking
const pool = require('../models/db');
const { PythonShell } = require('python-shell');
const imageProcessingRoutes = require('../routes/imageProcessing');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/image', imageProcessingRoutes);

describe('Image Processing Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /latest', () => {
    test('should return the latest uploaded image', async () => {
      // Mock database response
      pool.query.mockResolvedValueOnce({
        rows: [{
          image_url: '/uploads/test-image.jpg',
          uploaded_at: new Date(),
          player_level: 'intermediate'
        }]
      });

      // Mock fs.existsSync for the image check
      fs.existsSync.mockReturnValue(true);

      const response = await request(app)
        .get('/api/image/latest');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('image_url', '/uploads/test-image.jpg');
      expect(response.body).toHaveProperty('player_level', 'intermediate');
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test('should handle no images found', async () => {
      // Mock empty database response
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/image/latest');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'No uploaded images found');
    });

    test('should handle missing image file', async () => {
      // Mock database response
      pool.query.mockResolvedValueOnce({
        rows: [{
          image_url: '/uploads/missing-image.jpg',
          uploaded_at: new Date(),
          player_level: 'intermediate'
        }]
      });

      // Mock fs.existsSync to return false for the image file check
      fs.existsSync.mockReturnValue(false);

      const response = await request(app)
        .get('/api/image/latest');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Image file not found on server');
    });
  });

  describe('POST /process', () => {
    test('should handle special pool-table image case', async () => {
      const response = await request(app)
        .post('/api/image/process')
        .send({ image_path: '/uploads/pool-table-123456.jpg' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Image processed successfully');
      expect(response.body).toHaveProperty('transformed_image_url', '/uploads/processed_default_table.jpg');
      expect(response.body).toHaveProperty('ball_positions');
      expect(response.body.ball_positions.length).toBeGreaterThan(0);
    });

    test('should handle invalid image path', async () => {
      const response = await request(app)
        .post('/api/image/process')
        .send({ image_path: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid image path received');
    });

    test('should handle missing image file', async () => {
      // Mock fs.existsSync to return false for the image file check
      fs.existsSync.mockReturnValueOnce(false);

      const response = await request(app)
        .post('/api/image/process')
        .send({ image_path: '/uploads/missing-image.jpg' });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Image file not found');
    });
  });

  describe('GET /debug', () => {
    test('should retrieve debug images', async () => {
      const response = await request(app)
        .get('/api/image/debug');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Debug images retrieved successfully');
      expect(response.body).toHaveProperty('debug_images');
      expect(response.body.debug_images).toHaveLength(2);
    });

    test('should handle missing debug directory', async () => {
      // Mock fs.existsSync to return false for the debug directory
      fs.existsSync.mockReturnValueOnce(false);

      const response = await request(app)
        .get('/api/image/debug');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Debug directory not found');
    });
  });

  // Add cleanup for open handles
  afterAll(done => {
    app.mockClose && app.mockClose();
    done();
  });
});