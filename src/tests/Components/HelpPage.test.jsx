import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HelpPage from '../../Components/HelpPage/Help';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/help' })
}));

describe('HelpPage', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <HelpPage />
      </BrowserRouter>
    );
  });

  test('renders page title correctly', () => {
    expect(screen.getByText(/Help & Support Center/i)).toBeInTheDocument();
  });

  test('displays quick help cards', () => {
    expect(screen.getByText(/Getting Started/i)).toBeInTheDocument();
    expect(screen.getByText(/FAQs/i)).toBeInTheDocument();
    expect(screen.getByText(/Tips & Tricks/i)).toBeInTheDocument();
    expect(screen.getByText(/Troubleshooting/i)).toBeInTheDocument();
  });

  test('changes tab content when tab is clicked', () => {
    // Initially "How It Works" tab should be active
    expect(screen.getByText(/How Pool Game Simulation Works/i)).toBeInTheDocument();
    
    // Click on FAQs tab
    fireEvent.click(screen.getByRole('tab', { name: /FAQs/i }));
    
    // Check if FAQs content is visible
    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
  });

  test('navigates to settings page when link is clicked', () => {
    // Find and click the link to settings page
    const settingsLink = screen.getAllByText(/Account Settings/i)[0];
    fireEvent.click(settingsLink);
    
    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });
});