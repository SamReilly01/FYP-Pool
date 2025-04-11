import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SettingsPage from '../../Components/SettingsPage/Settings';
import { updateUserEmail, updateUserPassword } from '../../services/authService';

// Mock the color mode context
jest.mock('../../ThemeContext', () => ({
  ColorModeContext: {
    Consumer: ({ children }) => children({ toggleColorMode: jest.fn() }),
  }
}));

// Mock the auth service
jest.mock('../../services/authService', () => ({
  getCurrentUser: jest.fn().mockReturnValue({ user_id: '123', email: 'test@example.com' }),
  updateUserEmail: jest.fn(),
  updateUserPassword: jest.fn()
}));

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/settings' })
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock useTheme hook
jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  useTheme: () => ({
    palette: {
      mode: 'light',
      primary: { main: '#6930c3' },
      background: { default: '#f5f5f5', paper: '#ffffff' },
      text: { primary: '#333333', secondary: '#666666' }
    }
  }),
  alpha: jest.requireActual('@mui/material/styles').alpha,
  styled: jest.requireActual('@mui/material/styles').styled
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage getItem implementation
    mockLocalStorage.getItem.mockImplementation((key) => {
      switch (key) {
        case 'user_id': return '123';
        case 'playerLevel': return 'intermediate';
        case 'defaultSimulationSpeed': return '1.0';
        case 'showTrajectories': return 'true';
        case 'showShotSuggestions': return 'true';
        case 'enableSounds': return 'true';
        case 'tableFriction': return '0.98';
        case 'ballRestitution': return '0.9';
        case 'darkMode': return 'false';
        default: return null;
      }
    });
    
    render(
      <BrowserRouter>
        <SettingsPage />
      </BrowserRouter>
    );
  });

  test('renders settings page with tabs', () => {
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Game Settings/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Physics Settings/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Appearance/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Account/i })).toBeInTheDocument();
  });

  test('displays player settings in game settings tab', () => {
    // Game settings tab should be active by default
    expect(screen.getByText(/Player Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Player Skill Level/i)).toBeInTheDocument();
  });

  test('changes tab when tab is clicked', () => {
    // Click on Physics Settings tab
    fireEvent.click(screen.getByRole('tab', { name: /Physics Settings/i }));
    
    // Check if physics settings are visible
    expect(screen.getByText(/Table Physics/i)).toBeInTheDocument();
    expect(screen.getByText(/Table Friction/i)).toBeInTheDocument();
    expect(screen.getByText(/Ball Restitution/i)).toBeInTheDocument();
  });

  test('displays account information in account tab', () => {
    // Click on Account tab
    fireEvent.click(screen.getByRole('tab', { name: /Account/i }));
    
    // Check if account info is visible
    expect(screen.getByText(/Account Information/i)).toBeInTheDocument();
    
    // Email field should contain user's email
    const emailField = screen.getByLabelText(/Email Address/i);
    expect(emailField.value).toBe('test@example.com');
  });

  test('updates email when Update button is clicked', async () => {
    // Setup mock response
    updateUserEmail.mockResolvedValue({ success: true });
    
    // Click on Account tab
    fireEvent.click(screen.getByRole('tab', { name: /Account/i }));
    
    // Change email in the input
    const emailField = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailField, { target: { value: 'new@example.com' } });
    
    // Click the update button
    const updateButton = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(updateButton);
    
    // Wait for the update to complete
    await waitFor(() => {
      expect(updateUserEmail).toHaveBeenCalledWith('new@example.com');
    });
  });

  test('saves settings when Save Settings button is clicked', () => {
    // Find and click the save settings button
    const saveButton = screen.getByRole('button', { name: /Save Settings/i });
    fireEvent.click(saveButton);
    
    // Check if localStorage was updated
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('playerLevel', 'intermediate');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('showTrajectories', 'true');
    // ...other settings
  });
});