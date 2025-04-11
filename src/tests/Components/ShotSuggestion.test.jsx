import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ShotSuggestion from '../../Components/SimulationPage/ShotSuggestion';

describe('ShotSuggestion', () => {
  // Mock props
  const mockBallPositions = [
    { color: 'white', x: 100, y: 100, pocketed: false },
    { color: 'black', x: 300, y: 200, pocketed: false },
    { color: 'red', x: 200, y: 150, pocketed: false, number: 1 },
    { color: 'yellow', x: 400, y: 250, pocketed: false, number: 2 }
  ];
  
  const mockTableDimensions = { width: 800, height: 400 };
  const mockOnApplySuggestion = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders shot suggestions when provided with ball positions', () => {
    render(
      <ShotSuggestion
        ballPositions={mockBallPositions}
        playerLevel="intermediate"
        tableDimensions={mockTableDimensions}
        onApplySuggestion={mockOnApplySuggestion}
        isSimulationStarted={false}
      />
    );
    
    // Title should be visible
    expect(screen.getByText(/Shot Suggestions/i)).toBeInTheDocument();
    
    // At least one suggestion should be generated
    expect(screen.getByText(/Apply This Shot/i)).toBeInTheDocument();
  });

  test('does not render when simulation is started', () => {
    const { container } = render(
      <ShotSuggestion
        ballPositions={mockBallPositions}
        playerLevel="intermediate"
        tableDimensions={mockTableDimensions}
        onApplySuggestion={mockOnApplySuggestion}
        isSimulationStarted={true}
      />
    );
    
    // Component should not render content when simulation is started
    expect(container.firstChild).toBeNull();
  });

  test('calls onApplySuggestion when a shot is applied', () => {
    render(
      <ShotSuggestion
        ballPositions={mockBallPositions}
        playerLevel="intermediate"
        tableDimensions={mockTableDimensions}
        onApplySuggestion={mockOnApplySuggestion}
        isSimulationStarted={false}
      />
    );
    
    // Click on "Apply This Shot" button
    const applyButton = screen.getByText(/Apply This Shot/i);
    fireEvent.click(applyButton);
    
    // Check that the callback was called
    expect(mockOnApplySuggestion).toHaveBeenCalled();
  });

  test('shows different suggestions based on player level', () => {
    // First render with beginner level
    const { rerender } = render(
      <ShotSuggestion
        ballPositions={mockBallPositions}
        playerLevel="beginner"
        tableDimensions={mockTableDimensions}
        onApplySuggestion={mockOnApplySuggestion}
        isSimulationStarted={false}
      />
    );
    
    // Store beginner suggestions
    const beginnerSuggestions = document.body.textContent;
    
    // Re-render with expert level
    rerender(
      <ShotSuggestion
        ballPositions={mockBallPositions}
        playerLevel="expert"
        tableDimensions={mockTableDimensions}
        onApplySuggestion={mockOnApplySuggestion}
        isSimulationStarted={false}
      />
    );
    
    // Expert suggestions should be different from beginner suggestions
    const expertSuggestions = document.body.textContent;
    
    // Content should be different between levels
    // (This is a simple check - in reality, the differences might be more subtle)
    expect(beginnerSuggestions).not.toEqual(expertSuggestions);
  });

  test('shows no suggestions when no valid shots are available', () => {
    // All balls are pocketed
    const allPocketedBalls = mockBallPositions.map(ball => ({
      ...ball,
      pocketed: true
    }));
    
    render(
      <ShotSuggestion
        ballPositions={allPocketedBalls}
        playerLevel="intermediate"
        tableDimensions={mockTableDimensions}
        onApplySuggestion={mockOnApplySuggestion}
        isSimulationStarted={false}
      />
    );
    
    // Should find no "Apply This Shot" buttons
    expect(screen.queryByText(/Apply This Shot/i)).not.toBeInTheDocument();
  });

  test('refreshes suggestions when refresh button is clicked', () => {
    render(
      <ShotSuggestion
        ballPositions={mockBallPositions}
        playerLevel="intermediate"
        tableDimensions={mockTableDimensions}
        onApplySuggestion={mockOnApplySuggestion}
        isSimulationStarted={false}
      />
    );
    
    // Find and click the refresh button (usually an icon button)
    const refreshButton = screen.getByRole('button', { name: '' }); // Icon buttons often have empty accessible names
    fireEvent.click(refreshButton);
    
    // Since we can't really test randomness in suggestions easily,
    // we just verify the component doesn't crash on refresh
    expect(screen.getByText(/Shot Suggestions/i)).toBeInTheDocument();
  });
});