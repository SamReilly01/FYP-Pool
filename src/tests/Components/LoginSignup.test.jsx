import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginSignup from '../../Components/LoginSignup/LoginSignup';
import { loginUser, registerUser } from '../../services/authService';

// Mock the auth service
jest.mock('../../services/authService', () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn()
}));

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('LoginSignup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    render(
      <BrowserRouter>
        <LoginSignup />
      </BrowserRouter>
    );
  });

  test('renders login form by default', () => {
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('switches to signup form when signup button is clicked', () => {
    // Click the Sign Up toggle button
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    
    // Check if title changed
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
  });

  test('calls loginUser and navigates on successful login', async () => {
    // Setup mock response
    loginUser.mockResolvedValue({ user_id: '123', token: 'fake-token' });
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    
    // Wait for the login to complete
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  test('displays error message on login failure', async () => {
    // Setup mock response for failure
    loginUser.mockRejectedValue({ error: 'Invalid credentials' });
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    
    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
    
    // Navigation should not have been called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('calls registerUser when signing up', async () => {
    // Setup mock response
    registerUser.mockResolvedValue({ user_id: '123' });
    
    // Switch to signup
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'newpass123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    
    // Wait for the registration to complete
    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith('new@example.com', 'newpass123');
    });
  });
});