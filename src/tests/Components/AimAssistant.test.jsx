import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AimAssistant from '../../Components/SimulationPage/AimAssistant';

describe('AimAssistant', () => {
  const ballPositions = [
    { color: 'white', x: 100, y: 100, pocketed: false },
    { color: 'red', x: 200, y: 200, pocketed: false, number: 1 }
  ];
  
  const mockOnAimChange = jest.fn();
  const mockOnShoot = jest.fn();

  test('renders aiming button when not aiming', () => {
    render(
      <AimAssistant
        ballPositions={ballPositions}
        playerLevel="intermediate"
        onAimChange={mockOnAimChange}
        onShoot={mockOnShoot}
        isSimulationStarted={false}
        activeSuggestion={null}
      />
    );
    
    expect(screen.getByText(/Aim Shot/i)).toBeInTheDocument();
  });

  test('shows aiming controls when aiming button is clicked', () => {
    render(
      <AimAssistant
        ballPositions={ballPositions}
        playerLevel="intermediate"
        onAimChange={mockOnAimChange}
        onShoot={mockOnShoot}
        isSimulationStarted={false}
        activeSuggestion={null}
      />
    );
    
    // Click on Aim Shot button
    fireEvent.click(screen.getByText(/Aim Shot/i));
    
    // Check if angle and power controls are visible
    expect(screen.getByText(/Angle:/i)).toBeInTheDocument();
    expect(screen.getByText(/Power:/i)).toBeInTheDocument();
    expect(screen.getByText(/Take Shot/i)).toBeInTheDocument();
  });

  test('calls onShoot when take shot button is clicked', () => {
    render(
      <AimAssistant
        ballPositions={ballPositions}
        playerLevel="intermediate"
        onAimChange={mockOnAimChange}
        onShoot={mockOnShoot}
        isSimulationStarted={false}
        activeSuggestion={null}
      />
    );
    
    // Click on Aim Shot button
    fireEvent.click(screen.getByText(/Aim Shot/i));
    
    // Click on Take Shot button
    fireEvent.click(screen.getByText(/Take Shot/i));
    
    // Verify onShoot was called
    expect(mockOnShoot).toHaveBeenCalled();
  });

  test('does not render when simulation is started', () => {
    const { container } = render(
      <AimAssistant
        ballPositions={ballPositions}
        playerLevel="intermediate"
        onAimChange={mockOnAimChange}
        onShoot={mockOnShoot}
        isSimulationStarted={true}
        activeSuggestion={null}
      />
    );
    
    // Component should not render any content
    expect(container).toBeEmptyDOMElement();
  });
});