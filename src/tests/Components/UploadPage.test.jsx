import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UploadPage from '../../Components/UploadPage/Upload';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-image-url');

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/upload' })
}));

// Mock fetch
global.fetch = jest.fn();

describe('UploadPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage for user_id
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user_id') return '123';
      return null;
    });
    
    // Mock successful fetch response
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        message: 'Image uploaded successfully',
        image_url: '/uploads/test-image.jpg',
        file_size: 50 * 1024,
        file_type: 'image/jpeg',
        player_level: 'intermediate'
      })
    });
    
    render(
      <BrowserRouter>
        <UploadPage />
      </BrowserRouter>
    );
  });

  test('renders upload page with title', () => {
    expect(screen.getByText(/Upload Pool Table Image/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag & Drop Image Here/i)).toBeInTheDocument();
  });

  test('displays empty preview initially', () => {
    expect(screen.getByText(/Preview will appear here/i)).toBeInTheDocument();
    
    // Proceed button should be disabled initially
    const proceedButton = screen.getByText(/Proceed to Simulation/i);
    expect(proceedButton).toBeDisabled();
  });

  test('updates preview when image is uploaded', () => {
    // Get the file input
    const fileInput = screen.getByLabelText(/browse files/i, { selector: 'input' });
    
    // Create a mock file
    const file = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
    
    // Upload the file
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // URL.createObjectURL should have been called
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    
    // Proceed button should be enabled now
    const proceedButton = screen.getByText(/Proceed to Simulation/i);
    expect(proceedButton).not.toBeDisabled();
  });

  test('shows level dialog when proceed button is clicked', () => {
    // Upload a file first
    const fileInput = screen.getByLabelText(/browse files/i, { selector: 'input' });
    const file = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Click proceed button
    const proceedButton = screen.getByText(/Proceed to Simulation/i);
    fireEvent.click(proceedButton);
    
    // Level dialog should be visible
    expect(screen.getByText(/What's your Pool Playing Level\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Beginner/i)).toBeInTheDocument();
    expect(screen.getByText(/Intermediate/i)).toBeInTheDocument();
    expect(screen.getByText(/Expert/i)).toBeInTheDocument();
  });

  test('uploads image and navigates after selecting level', async () => {
    // Upload a file first
    const fileInput = screen.getByLabelText(/browse files/i, { selector: 'input' });
    const file = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Click proceed button
    const proceedButton = screen.getByText(/Proceed to Simulation/i);
    fireEvent.click(proceedButton);
    
    // Select a level (expert) and confirm
    const expertCard = screen.getByText(/Expert/i).closest('[role="button"]');
    fireEvent.click(expertCard);
    
    // Click confirm button
    const confirmButton = screen.getByText(/Confirm & Continue/i);
    fireEvent.click(confirmButton);
    
    // Wait for fetch to be called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/image/upload',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
    
    // Should navigate to simulation page
    expect(mockNavigate).toHaveBeenCalledWith('/simulation');
    
    // Should store level in localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('playerLevel', 'expert');
  });
});