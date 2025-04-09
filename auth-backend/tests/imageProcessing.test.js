const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');
const imageProcessingRoutes = require('../routes/imageProcessing');
const pool = require('../models/db');
const { PythonShell } = require('python-shell');

// Mock database pool
jest.mock('../models/db', () => ({
  query: jest.fn()
}));

// Mock PythonShell
jest.mock('python-shell', () => ({
  PythonShell: {
    run: jest.fn()
  }
}));

// Mock fs functions
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  statSync: jest.fn().mockReturnValue({ size: 1024 * 1024 }) // 1MB
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/image', imageProcessingRoutes);

describe('Image Processing Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /latest should return the latest uploaded image', async () => {
    // Mock database response
    pool.query.mockResolvedValueOnce({
      rows: [{
        image_url: '/uploads/test-image.jpg',
        uploaded_at: new Date(),
        player_level: 'intermediate'
      }]
    });

    const response = await request(app)
      .get('/api/image/latest');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('image_url', '/uploads/test-image.jpg');
    expect(response.body).toHaveProperty('player_level', 'intermediate');
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test('GET /latest should handle no images found', async () => {
    // Mock empty database response
    pool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .get('/api/image/latest');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'No uploaded images found');
  });

  test('POST /process should process an image successfully', async () => {
    // Mock PythonShell behavior
    const mockPyshell = {
      on: jest.fn(),
      end: jest.fn()
    };
    
    // Mock PythonShell constructor
    jest.spyOn(PythonShell, 'PythonShell').mockImplementation(() => mockPyshell);
    
    // Simulate successful processing by calling the 'end' callback
    mockPyshell.on.mockImplementation((event, callback) => {
      if (event === 'message') {
        callback(JSON.stringify({
          image_url: '/uploads/processed_test-image.jpg',
          ball_positions: [
            { color: 'white', x: 100, y: 100 },
            { color: 'red', x: 200, y: 200, number: 1 }
          ]
        }));
      }
      return mockPyshell;
    });
    
    mockPyshell.end.mockImplementation((callback) => {
      callback(null, 0); // No error, exit code 0
    });

    const response = await request(app)
      .post('/api/image/process')
      .send({ image_path: '/uploads/test-image.jpg' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('transformed_image_url');
    expect(response.body).toHaveProperty('ball_positions');
    expect(response.body.ball_positions).toHaveLength(2);
  });

  test('POST /process should handle processing errors', async () => {
    // Mock PythonShell to throw an error
    PythonShell.run.mockImplementation((script, options, callback) => {
      callback(new Error('Python processing error'), null);
    });

    const response = await request(app)
      .post('/api/image/process')
      .send({ image_path: '/uploads/test-image.jpg' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Error processing image');
  });
});