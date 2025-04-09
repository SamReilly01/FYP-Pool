const pool = require('../models/db');
const { Pool } = require('pg');

// Mock pg module
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('Database Module', () => {
  let originalEnv;
  
  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });

  test('should create a pool with the correct configuration', () => {
    expect(Pool).toHaveBeenCalledWith({
      connectionString: process.env.DATABASE_URL,
    });
  });

  test('pool should be exported correctly', () => {
    expect(pool).toBeDefined();
    expect(pool).toHaveProperty('query');
    expect(typeof pool.query).toBe('function');
  });

  test('should handle database queries', async () => {
    const mockResult = { rows: [{ id: 1, name: 'test' }] };
    pool.query.mockResolvedValueOnce(mockResult);

    const result = await pool.query('SELECT * FROM test');
    
    expect(result).toBe(mockResult);
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM test');
  });

  test('should handle database errors', async () => {
    const mockError = new Error('Database error');
    pool.query.mockRejectedValueOnce(mockError);

    await expect(pool.query('SELECT * FROM test')).rejects.toThrow('Database error');
  });
});