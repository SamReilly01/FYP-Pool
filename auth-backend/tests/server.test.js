const path = require('path');

// Properly structured mock setup
const mockUse = jest.fn();
const mockGet = jest.fn();
const mockListen = jest.fn((port, callback) => {
  if (callback) callback();
  return { address: () => ({ port }), close: jest.fn() };
});

// Mock Express properly
jest.mock('express', () => {
  return function() {
    return {
      use: mockUse,
      get: mockGet,
      listen: mockListen
    };
  };
});

// Set up static middleware mock
const mockStatic = jest.fn(() => 'static-middleware');
jest.mock('express', () => {
  const actualExpress = jest.requireActual('express');
  const mockExpress = jest.fn(() => ({
    use: mockUse,
    get: mockGet,
    listen: mockListen
  }));
  mockExpress.json = jest.fn(() => 'json-middleware');
  mockExpress.static = mockStatic;
  return mockExpress;
});

jest.mock('cors', () => jest.fn(() => 'cors-middleware'));
jest.mock('body-parser', () => ({
  json: jest.fn(() => 'body-parser-middleware')
}));

jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock route modules
jest.mock('../routes/auth', () => 'auth-routes');
jest.mock('../routes/upload', () => 'upload-routes');
jest.mock('../routes/imageProcessing', () => 'image-processing-routes');
jest.mock('../routes/results', () => 'results-routes');

describe('Server Configuration', () => {
  let originalEnv;
  
  beforeEach(() => {
    // Save original environment variables
    originalEnv = process.env;
    process.env = { ...originalEnv };
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  test('should initialize express app', () => {
    // Import the server module after clearing mocks
    const server = require('../server');
    
    // Verify express was initialized
    const express = require('express');
    expect(express).toHaveBeenCalled();
  });

  test('should configure essential middleware', () => {
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Import the server module
    const server = require('../server');
    
    // Check middleware configuration
    expect(mockUse).toHaveBeenCalledWith('body-parser-middleware');
    expect(mockUse).toHaveBeenCalledWith('cors-middleware');
    expect(mockUse).toHaveBeenCalledWith('json-middleware');
  });

  test('should serve static files from uploads directory', () => {
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Import the server module
    const server = require('../server');
    
    // Check static file serving
    expect(mockStatic).toHaveBeenCalled();
    expect(mockUse).toHaveBeenCalledWith('/uploads', 'static-middleware');
  });

  test('should register all required API routes', () => {
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Import the server module
    const server = require('../server');
    
    // Check route registration
    expect(mockUse).toHaveBeenCalledWith('/api/auth', 'auth-routes');
    expect(mockUse).toHaveBeenCalledWith('/api', 'upload-routes');
    expect(mockUse).toHaveBeenCalledWith('/api/image', 'image-processing-routes');
    expect(mockUse).toHaveBeenCalledWith('/api/results', 'results-routes');
  });

  test('should define root route handler', () => {
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Import the server module
    const server = require('../server');
    
    // Check root route handler
    expect(mockGet).toHaveBeenCalledWith('/', expect.any(Function));
    
    // Get the root route handler function
    const rootRouteHandler = mockGet.mock.calls.find(call => call[0] === '/')[1];
    
    // Mock response object
    const mockResponse = {
      send: jest.fn()
    };
    
    // Call the handler
    rootRouteHandler({}, mockResponse);
    
    // Verify response
    expect(mockResponse.send).toHaveBeenCalled();
    expect(mockResponse.send.mock.calls[0][0]).toContain('Server is running');
  });

  test('should start server on configured port from environment variable', () => {
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Set PORT environment variable
    process.env.PORT = '4000';
    
    // Import the server module
    const server = require('../server');
    
    // Check server listening
    expect(mockListen).toHaveBeenCalledWith('4000', expect.any(Function));
  });

  test('should start server on default port if not configured', () => {
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Ensure PORT is not set
    delete process.env.PORT;
    
    // Import the server module
    const server = require('../server');
    
    // Check server listening
    expect(mockListen).toHaveBeenCalledWith(5000, expect.any(Function));
  });

  test('should load environment variables with dotenv', () => {
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Import the server module
    const server = require('../server');
    
    // Check dotenv.config was called
    const dotenv = require('dotenv');
    expect(dotenv.config).toHaveBeenCalled();
  });
});