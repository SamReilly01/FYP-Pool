// tests/setup.js
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.PORT = '5000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Global beforeAll and afterAll hooks can be added here