const { Pool } = require('pg');

// Mock pg module
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
    on: jest.fn()
  };
  
  return { 
    Pool: jest.fn(() => mockPool)
  };
});

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('Database Module', () => {
  let originalEnv;
  let pool;
  
  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
    
    jest.clearAllMocks();
    
    // Import pool after setting up mocks and environment
    pool = require('../models/db');
  });
  
  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  test('should create a pool with the correct configuration', () => {
    // Verify Pool constructor was called with the right options
    expect(Pool).toHaveBeenCalledWith({
      connectionString: 'postgresql://test:test@localhost:5432/test_db',
    });
  });

  test('pool should be exported correctly', () => {
    expect(pool).toBeDefined();
    expect(pool).toHaveProperty('query');
    expect(typeof pool.query).toBe('function');
  });

  test('should handle successful database queries', async () => {
    const mockResult = { rows: [{ id: 1, name: 'test' }] };
    pool.query.mockResolvedValueOnce(mockResult);

    const result = await pool.query('SELECT * FROM test');
    
    expect(result).toBe(mockResult);
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM test');
  });

  test('should handle database query with parameters', async () => {
    const mockResult = { rows: [{ id: 1, name: 'test' }] };
    pool.query.mockResolvedValueOnce(mockResult);

    const params = [1, 'test'];
    const result = await pool.query('SELECT * FROM test WHERE id = $1 AND name = $2', params);
    
    expect(result).toBe(mockResult);
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM test WHERE id = $1 AND name = $2', 
      params
    );
  });

  test('should handle database query errors', async () => {
    const mockError = new Error('Database error');
    pool.query.mockRejectedValueOnce(mockError);

    await expect(pool.query('SELECT * FROM test')).rejects.toThrow('Database error');
  });

  test('should use environment variable for connection string', () => {
    jest.resetModules();
    
    // Clear the previous mock
    jest.unmock('pg');
    
    // Create a fresh mock
    jest.mock('pg', () => {
      const mockPool = {
        query: jest.fn(),
        connect: jest.fn(),
        end: jest.fn(),
        on: jest.fn()
      };
      
      return { 
        Pool: jest.fn(() => mockPool)
      };
    });
    
    // Set a different connection string
    const testUrl = 'postgresql://different:user@otherhost:5432/other_db';
    process.env.DATABASE_URL = testUrl;
    
    // Re-require the module to test with new env var
    const freshPool = require('../models/db');
    
    // Verify Pool was constructed correctly
    expect(Pool).toHaveBeenCalledWith({
      connectionString: testUrl,
    });
  });
});