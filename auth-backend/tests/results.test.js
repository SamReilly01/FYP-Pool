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

  describe('POST /save', () => {
    test('should save simulation results successfully', async () => {
      // Mock database response
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          user_id: 123,
          simulation_name: 'Test Simulation',
          image_url: '/uploads/test-image.jpg',
          ball_positions: JSON.stringify([{ color: 'white', x: 100, y: 100 }]),
          initial_positions: JSON.stringify([{ color: 'white', x: 90, y: 90 }]),
          pocketed_balls: JSON.stringify([{ color: 'red', number: 1 }]),
          player_level: 'intermediate',
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
      expect(response.body).toHaveProperty('message', 'Simulation results saved successfully');
      expect(response.body).toHaveProperty('simulation_id', 1);
      expect(response.body).toHaveProperty('data');
      
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO simulation_results'),
        expect.arrayContaining([123, 'Test Simulation'])
      );
    });

    test('should require a user_id', async () => {
      const testData = {
        simulation_name: 'Test Simulation',
        image_url: '/uploads/test-image.jpg',
        ball_positions: [{ color: 'white', x: 100, y: 100 }]
      };

      const response = await request(app)
        .post('/api/results/save')
        .send(testData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'User ID is required');
      expect(pool.query).not.toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      // Mock database error
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const testData = {
        user_id: 123,
        simulation_name: 'Test Simulation',
        image_url: '/uploads/test-image.jpg',
        ball_positions: [{ color: 'white', x: 100, y: 100 }]
      };

      const response = await request(app)
        .post('/api/results/save')
        .send(testData);

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Internal server error');
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test('should use default name if none provided', async () => {
      // Mock database response
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1 }]
      });

      const testData = {
        user_id: 123,
        image_url: '/uploads/test-image.jpg',
        ball_positions: [{ color: 'white', x: 100, y: 100 }]
      };

      const response = await request(app)
        .post('/api/results/save')
        .send(testData);

      expect(response.status).toBe(201);
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['Untitled Simulation'])
      );
    });
  });

  describe('GET /user/:user_id', () => {
    test('should return all simulation results for a user', async () => {
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
        'SELECT * FROM simulation_results WHERE user_id = $1 ORDER BY created_at DESC',
        ["123"]
      );
    });

    test('should handle empty results', async () => {
      // Mock empty database response
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/results/user/123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count', 0);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(0);
    });

    test('should handle database errors', async () => {
      // Mock database error
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/results/user/123');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Internal server error');
    });
  });

  describe('GET /:id', () => {
    test('should return a specific simulation result', async () => {
      // Mock database response
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          user_id: 123,
          simulation_name: 'Test Simulation',
          ball_positions: JSON.stringify([{ color: 'white', x: 100, y: 100 }]),
          created_at: new Date()
        }]
      });

      const response = await request(app)
        .get('/api/results/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 1);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM simulation_results WHERE id = $1',
        ["1"]
      );
    });

    test('should handle non-existent result', async () => {
      // Mock empty database response
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/results/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Simulation result not found');
    });

    test('should handle database errors', async () => {
      // Mock database error
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/results/1');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Internal server error');
    });
  });

  describe('DELETE /:id', () => {
    test('should delete a simulation result owned by the user', async () => {
      // Mock database responses for ownership check and deletion
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
      
      // Verify the second query is for deletion
      expect(pool.query.mock.calls[1][0]).toBe('DELETE FROM simulation_results WHERE id = $1');
      expect(pool.query.mock.calls[1][1]).toEqual(["1"]);
    });

    test('should prevent unauthorized deletion', async () => {
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
      
      // Verify no deletion query was called
      expect(pool.query.mock.calls[0][0]).not.toBe('DELETE FROM simulation_results WHERE id = $1');
    });

    test('should handle non-existent result', async () => {
      // Mock empty database response for ownership check
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .delete('/api/results/999')
        .send({ user_id: 123 });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Simulation result not found');
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test('should handle database errors', async () => {
      // Mock database error
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .delete('/api/results/1')
        .send({ user_id: 123 });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Internal server error');
    });
  });
});