const request = require('supertest');
const express = require('express');
const path = require('path');

// Mock the required modules
jest.mock('express', () => {
  const expressApp = {
    use: jest.fn(),
    get: jest.fn(),
    listen: jest.fn((port, callback) => {
      callback();
      return {
        address: () => ({ port }),
        close: jest.fn()
      };
    })
  };
  const mockExpress = jest.fn(() => expressApp);
  mockExpress.json = jest.fn(() => 'json-middleware');
  mockExpress.static = jest.fn(() => 'static-middleware');
  return mockExpress;
});

jest.mock('cors', () => jest.fn(() => 'cors-middleware'));
jest.mock('body-parser', () => ({
  json: jest.fn(() => 'body-parser-middleware')
}));

jest.mock('dotenv', () => ({
  config: jest.fn()
}));

jest.mock('../routes/auth', () => 'auth-routes');
jest.mock('../routes/upload', () => 'upload-routes');
jest.mock('../routes/imageProcessing', () => 'image-processing-routes');
jest.mock('../routes/results', () => 'results-routes');

describe('Server', () => {
  let server;
  let expressApp;
  
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    
    // Reset the mocked express app before importing server
    expressApp = express();

    // Import the server module
    server = require('../server');
  });

  test('should initialize express app correctly', () => {
    expect(express).toHaveBeenCalled();
  });

  test('should configure middleware correctly', () => {
    expect(expressApp.use).toHaveBeenCalledWith('body-parser-middleware');
    expect(expressApp.use).toHaveBeenCalledWith('cors-middleware');
    expect(expressApp.use).toHaveBeenCalledWith('json-middleware');
    expect(expressApp.use).toHaveBeenCalledWith('/uploads', 'static-middleware');
  });

  test('should register routes correctly', () => {
    expect(expressApp.use).toHaveBeenCalledWith('/api/auth', 'auth-routes');
    expect(expressApp.use).toHaveBeenCalledWith('/api', 'upload-routes');
    expect(expressApp.use).toHaveBeenCalledWith('/api/image', 'image-processing-routes');
    expect(expressApp.use).toHaveBeenCalledWith('/api/results', 'results-routes');
  });

  test('should define root route handler', () => {
    expect(expressApp.get).toHaveBeenCalledWith('/', expect.any(Function));
  });

  test('should start server on configured port', () => {
    // Set PORT in process.env
    process.env.PORT = '5000';
    
    // Re-import server to use updated env
    jest.resetModules();
    server = require('../server');
    
    expect(expressApp.listen).toHaveBeenCalledWith('5000', expect.any(Function));
  });

  test('should start server on default port if not configured', () => {
    // Remove PORT from process.env
    delete process.env.PORT;
    
    // Re-import server
    jest.resetModules();
    server = require('../server');
    
    expect(expressApp.listen).toHaveBeenCalledWith(5000, expect.any(Function));
  });
});