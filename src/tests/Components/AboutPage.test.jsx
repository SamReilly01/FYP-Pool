import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AboutPage from '../../Components/AboutPage/About';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/about' })
}));

describe('AboutPage', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    );
  });

  test('renders page title correctly', () => {
    expect(screen.getByText(/About Our Pool Game Simulation/i)).toBeInTheDocument();
  });

  test('displays mission section', () => {
    expect(screen.getByText(/Our Mission/i)).toBeInTheDocument();
    expect(screen.getByText(/We created Pool Game Simulation to help/i)).toBeInTheDocument();
  });

  test('displays key technologies section', () => {
    expect(screen.getByText(/Key Technologies/i)).toBeInTheDocument();
    expect(screen.getByText(/Computer Vision/i)).toBeInTheDocument();
    expect(screen.getByText(/Physics Simulation/i)).toBeInTheDocument();
  });

  test('displays team members section', () => {
    expect(screen.getByText(/Meet Our Team/i)).toBeInTheDocument();
    // Check for at least one team member
    expect(screen.getByText(/Alex Chen/i)).toBeInTheDocument();
  });

  test('navigates when upload button is clicked', () => {
    const uploadButton = screen.getByText(/Upload an Image/i);
    fireEvent.click(uploadButton);
    expect(mockNavigate).toHaveBeenCalledWith('/upload');
  });
});