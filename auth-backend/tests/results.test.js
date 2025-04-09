const request = require('supertest');
const express = require('express');
const resultsRoutes = require('../routes/results');
const pool = require('../models/db');

// Mock database pool
jest.mock('../models/db', () => ({
  query: jest.fn()
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/results', resultsRoutes);

describe('Results Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /save should save simulation results', async () => {
    // Mock database response
    pool.query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        user_id: 123,
        simulation_name: 'Test Simulation',
        image_url: '/uploads/test-image.jpg',
        created_at: new Date()
      }]
    });

    const testData = {
      user_id: 123,
      simulation_name: 'Test Simulation',
      image_url: '/uploads/test-image.jpg',
      ball_positions: [{ color: 'white', x: 100, y: 100 }],
      initial_positions: [{ color: 'white', x: 90, y: 90 }],
      pocketed_balls: [{ color: 'red', number: 1 }],
      player_level: 'intermediate'
    };

    const response = await request(app)
      .post('/api/results/save')
      .send(testData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('simulation_id', 1);
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query.mock.calls[0][1][0]).toBe(123); // Check user_id param
  });

  test('POST /save should require user_id', async () => {
    const response = await request(app)
      .post('/api/results/save')
      .send({
        simulation_name: 'Test Simulation',
        image_url: '/uploads/test-image.jpg'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'User ID is required');
  });

  test('GET /user/:user_id should return user simulation results', async () => {
    // Mock database response
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          user_id: 123,
          simulation_name: 'Simulation 1',
          created_at: new Date()
        },
        {
          id: 2,
          user_id: 123,
          simulation_name: 'Simulation 2',
          created_at: new Date()
        }
      ]
    });

    const response = await request(app)
      .get('/api/results/user/123');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('count', 2);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveLength(2);
    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      ["123"]
    );
  });

  test('GET /:id should return a specific simulation result', async () => {
    // Mock database response
    pool.query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        user_id: 123,
        simulation_name: 'Test Simulation',
        ball_positions: JSON.stringify([{ color: 'white', x: 100, y: 100 }])
      }]
    });

    const response = await request(app)
      .get('/api/results/1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id', 1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      ["1"]
    );
  });

  test('DELETE /:id should delete a simulation result', async () => {
    // Mock database responses
    pool.query.mockResolvedValueOnce({
      rows: [{ user_id: 123 }]
    }).mockResolvedValueOnce({
      rows: []
    });

    const response = await request(app)
      .delete('/api/results/1')
      .send({ user_id: 123 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Simulation result deleted successfully');
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test('DELETE /:id should prevent unauthorized deletion', async () => {
    // Mock database response with different user_id
    pool.query.mockResolvedValueOnce({
      rows: [{ user_id: 456 }]
    });

    const response = await request(app)
      .delete('/api/results/1')
      .send({ user_id: 123 });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Unauthorized: You cannot delete this simulation');
    expect(pool.query).toHaveBeenCalledTimes(1);
  });
});