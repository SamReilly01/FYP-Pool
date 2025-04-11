import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResultsPage from '../../Components/ResultsPage/Results';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/results' })
}));

// Mock fetch
global.fetch = jest.fn();

describe('ResultsPage', () => {
  const mockSimulations = [
    {
      id: 1,
      user_id: 123,
      simulation_name: 'Test Simulation 1',
      created_at: new Date().toISOString(),
      image_url: '/uploads/test-image-1.jpg',
      ball_positions: JSON.stringify([{ color: 'white', x: 100, y: 100 }]),
      initial_positions: JSON.stringify([{ color: 'white', x: 90, y: 90 }]),
      pocketed_balls: JSON.stringify([{ color: 'red', number: 1 }]),
      player_level: 'intermediate'
    },
    {
      id: 2,
      user_id: 123,
      simulation_name: 'Test Simulation 2',
      created_at: new Date().toISOString(),
      image_url: '/uploads/test-image-2.jpg',
      ball_positions: JSON.stringify([{ color: 'white', x: 150, y: 150 }]),
      initial_positions: JSON.stringify([{ color: 'white', x: 140, y: 140 }]),
      pocketed_balls: JSON.stringify([]),
      player_level: 'beginner'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock user_id in localStorage
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user_id') return '123';
      return null;
    });
    
    // Mock successful fetch
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        count: mockSimulations.length,
        data: mockSimulations
      })
    });
    
    render(
      <BrowserRouter>
        <ResultsPage />
      </BrowserRouter>
    );
  });

  test('renders page title', async () => {
    expect(screen.getByText(/Your Simulation Results/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  test('displays simulation cards when data is loaded', async () => {
    await waitFor(() => {
      expect(screen.getByText(/Test Simulation 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Simulation 2/i)).toBeInTheDocument();
    });
  });

  test('opens simulation details when details button is clicked', async () => {
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Test Simulation 1/i)).toBeInTheDocument();
    });
    
    // Click the details button for first simulation
    const detailsButtons = screen.getAllByText(/Details/i);
    fireEvent.click(detailsButtons[0]);
    
    // Check that the dialog opened
    expect(screen.getByText(/Simulation Details/i)).toBeInTheDocument();
  });

  test('calls navigate when replay button is clicked', async () => {
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Test Simulation 1/i)).toBeInTheDocument();
    });
    
    // Click the replay button for first simulation
    const replayButtons = screen.getAllByText(/Replay Simulation/i);
    fireEvent.click(replayButtons[0]);
    
    // Check navigation to simulation page
    expect(mockNavigate).toHaveBeenCalledWith('/simulation');
    
    // Check localStorage was updated with replay data
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  test('shows confirmation dialog when delete button is clicked', async () => {
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Test Simulation 1/i)).toBeInTheDocument();
    });
    
    // Click the delete button for first simulation
    const deleteButtons = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);
    
    // Check that confirmation dialog is shown
    expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();
  });
});