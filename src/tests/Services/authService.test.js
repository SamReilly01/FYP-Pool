import { registerUser, loginUser, updateUserEmail, updateUserPassword, logout, getCurrentUser } from '../../services/authService';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('loginUser', () => {
    test('stores user data in localStorage on successful login', async () => {
      // Mock successful login response
      axios.post.mockResolvedValueOnce({
        data: {
          user_id: '123',
          email: 'test@example.com',
          token: 'fake-token',
          message: 'Login successful'
        }
      });
      
      // Call login function
      const result = await loginUser('test@example.com', 'password123');
      
      // Verify axios was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/login',
        { email: 'test@example.com', password: 'password123' }
      );
      
      // Verify localStorage was updated
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_id', '123');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
      
      // Verify return value
      expect(result).toEqual({
        user_id: '123',
        email: 'test@example.com',
        token: 'fake-token',
        message: 'Login successful'
      });
    });
    
    test('throws error on failed login', async () => {
      // Mock failed login response
      axios.post.mockRejectedValueOnce({
        response: {
          data: { error: 'Invalid credentials' }
        }
      });
      
      // Call should throw error
      await expect(loginUser('wrong@example.com', 'wrongpass')).rejects.toEqual({
        error: 'Invalid credentials'
      });
      
      // Verify localStorage was not updated
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });
  
  describe('registerUser', () => {
    test('stores user data in localStorage on successful registration', async () => {
      // Mock successful registration response
      axios.post.mockResolvedValueOnce({
        data: {
          user_id: '123',
          email: 'new@example.com',
          message: 'Registration successful'
        }
      });
      
      // Call register function
      const result = await registerUser('new@example.com', 'newpass123');
      
      // Verify axios was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/register',
        { email: 'new@example.com', password: 'newpass123' }
      );
      
      // Verify localStorage was updated
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_id', '123');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('userEmail', 'new@example.com');
      
      // Verify return value
      expect(result).toEqual({
        user_id: '123',
        email: 'new@example.com',
        message: 'Registration successful'
      });
    });
    
    test('throws error on failed registration', async () => {
      // Mock failed registration response
      axios.post.mockRejectedValueOnce({
        response: {
          data: { error: 'Email already exists' }
        }
      });
      
      // Call should throw error
      await expect(registerUser('existing@example.com', 'password')).rejects.toEqual({
        error: 'Email already exists'
      });
      
      // Verify localStorage was not updated
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });
  
  describe('updateUserEmail', () => {
    test('updates email successfully', async () => {
      // Mock localStorage for user_id and token
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'user_id') return '123';
        if (key === 'token') return 'fake-token';
        return null;
      });
      
      // Mock successful update response
      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          email: 'updated@example.com'
        }
      });
      
      // Call update email function
      const result = await updateUserEmail('updated@example.com');
      
      // Verify axios was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/update-email',
        { user_id: '123', new_email: 'updated@example.com' },
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer fake-token'
          }
        })
      );
      
      // Verify localStorage was updated
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('userEmail', 'updated@example.com');
      
      // Verify return value
      expect(result).toEqual({
        success: true,
        email: 'updated@example.com'
      });
    });
    
    test('throws error when not logged in', async () => {
      // Mock empty localStorage
      mockLocalStorage.getItem.mockReturnValue(null);
      
      // Call should throw error
      await expect(updateUserEmail('new@example.com')).rejects.toEqual({
        error: 'You must be logged in to change your email.'
      });
      
      // Verify axios was not called
      expect(axios.post).not.toHaveBeenCalled();
    });
  });
  
  describe('updateUserPassword', () => {
    test('updates password successfully', async () => {
      // Mock localStorage for user_id and token
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'user_id') return '123';
        if (key === 'token') return 'fake-token';
        return null;
      });
      
      // Mock successful update response
      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Password updated successfully'
        }
      });
      
      // Call update password function
      const result = await updateUserPassword('oldpass', 'newpass');
      
      // Verify axios was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/update-password',
        { 
          user_id: '123', 
          current_password: 'oldpass', 
          new_password: 'newpass' 
        },
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer fake-token'
          }
        })
      );
      
      // Verify return value
      expect(result).toEqual({
        success: true,
        message: 'Password updated successfully'
      });
    });
  });
  
  describe('logout', () => {
    test('removes user data from localStorage', () => {
      // Call logout function
      logout();
      
      // Verify localStorage items were removed
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_id');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('userEmail');
    });
  });
  
  describe('getCurrentUser', () => {
    test('returns user data from localStorage', () => {
      // Mock localStorage values
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'user_id') return '123';
        if (key === 'userEmail') return 'test@example.com';
        if (key === 'token') return 'fake-token';
        return null;
      });
      
      // Call getCurrentUser function
      const user = getCurrentUser();
      
      // Verify returned user object
      expect(user).toEqual({
        user_id: '123',
        email: 'test@example.com',
        token: 'fake-token'
      });
    });
  });
});