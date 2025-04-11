import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../Components/HomePage/HomePage';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/home' })
}));

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock user email in localStorage
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'userEmail') return 'test@example.com';
      return null;
    });
    
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
  });

  test('renders welcome message with username', () => {
    expect(screen.getByText(/Welcome, Test!/i)).toBeInTheDocument();
  });

  test('displays service cards', () => {
    expect(screen.getByText(/Upload Image/i)).toBeInTheDocument();
    expect(screen.getByText(/Run Simulation/i)).toBeInTheDocument();
    expect(screen.getByText(/View Results/i)).toBeInTheDocument();
  });

  test('displays additional feature cards', () => {
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Help Center/i)).toBeInTheDocument();
    expect(screen.getByText(/About Us/i)).toBeInTheDocument();
  });

  test('navigates to upload page when "Upload Now" button is clicked', () => {
    fireEvent.click(screen.getByText(/Upload Now/i));
    expect(mockNavigate).toHaveBeenCalledWith('/upload');
  });

  test('navigates to feature page when card is clicked', () => {
    // Find and click the Upload Image learn more button
    const learnMoreButtons = screen.getAllByText(/Learn More/i);
    fireEvent.click(learnMoreButtons[0]); // First button for Upload
    
    // Check navigation to upload page
    expect(mockNavigate).toHaveBeenCalled();
  });
});