import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SimulationPage from '../../Components/SimulationPage/Simulation';

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
  useLocation: () => ({ pathname: '/simulation' })
}));

// Mock fetch
global.fetch = jest.fn();

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn(cb => {
  setTimeout(cb, 0);
  return 123; // Return a fake request ID
});
global.cancelAnimationFrame = jest.fn();

// Mock performance.now
global.performance.now = jest.fn(() => Date.now());

describe('SimulationPage', () => {
  const mockLatestImage = {
    image_url: '/uploads/test-image.jpg',
    player_level: 'intermediate'
  };

  const mockProcessResult = {
    message: 'Image processed successfully',
    transformed_image_url: '/uploads/processed_test-image.jpg',
    ball_positions: [
      { color: "white", x: 200, y: 200, vx: 0, vy: 0 },
      { color: "black", x: 400, y: 200, vx: 0, vy: 0 },
      { color: "red", x: 600, y: 150, vx: 0, vy: 0, number: 1 }
    ],
    original_dimensions: { width: 800, height: 400 },
    table_bounds: { x: 0, y: 0, width: 800, height: 400 }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage values
    mockLocalStorage.getItem.mockImplementation((key) => {
      switch (key) {
        case 'user_id': return '123';
        case 'playerLevel': return 'intermediate';
        case 'directControlsGuideShown': return 'true'; // Prevent guide from showing in tests
        default: return null;
      }
    });
    
    // Mock fetch for latest image
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/image/latest')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLatestImage)
        });
      }
      if (url.includes('/api/image/process')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProcessResult)
        });
      }
      return Promise.reject(new Error('Unhandled fetch'));
    });

    // Mock Image
    const originalImage = global.Image;
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.onload && this.onload();
        }, 0);
      }
    };
    
    render(
      <BrowserRouter>
        <SimulationPage />
      </BrowserRouter>
    );
    
    // Restore original Image
    global.Image = originalImage;
  });

  test('renders simulation page title', () => {
    expect(screen.getByText(/Pool Game Simulation/i)).toBeInTheDocument();
  });

  test('loads and processes image on mount', async () => {
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/image/latest');
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/image/process'), expect.any(Object));
    });
  });

  test('displays ball information when loaded', async () => {
    await waitFor(() => {
      // We should have information about the balls
      expect(screen.getByText(/Intermediate Level/i)).toBeInTheDocument();
      
      // Look for start simulation button
      const startButtons = screen.getAllByText(/Start Simulation/i);
      expect(startButtons.length).toBeGreaterThan(0);
      expect(startButtons[0]).toBeInTheDocument();
    });
  });

  test('starts simulation when start button is clicked', async () => {
    await waitFor(() => {
      const startButtons = screen.getAllByText(/Start Simulation/i);
      expect(startButtons.length).toBeGreaterThan(0);
    });
    
    // Click the start simulation button
    const startButtons = screen.getAllByText(/Start Simulation/i);
    act(() => {
      fireEvent.click(startButtons[0]);
    });
    
    // Now should show Pause button
    await waitFor(() => {
      expect(screen.getByText(/Pause/i)).toBeInTheDocument();
    });
    
    // requestAnimationFrame should have been called
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  test('shows shot suggestions section', async () => {
    await waitFor(() => {
      const suggestionsHeaders = screen.getAllByText(/Shot Suggestions/i);
      expect(suggestionsHeaders.length).toBeGreaterThan(0);
      expect(suggestionsHeaders[0]).toBeInTheDocument();
    });
  });

  test('shows simulation controls', async () => {
    await waitFor(() => {
      expect(screen.getByText(/Trajectories/i)).toBeInTheDocument();
    });
  });
});