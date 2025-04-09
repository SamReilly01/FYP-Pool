import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';

// Icons
import AimIcon from '@mui/icons-material/GpsFixed';
import PowerIcon from '@mui/icons-material/Speed';
import AdjustIcon from '@mui/icons-material/Adjust';
import StraightIcon from '@mui/icons-material/Straighten';

// Styled components
const AimContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: '#f0f0f0',
  position: 'relative',
}));

const AimButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#6930c3',
  color: 'white',
  borderRadius: theme.spacing(5),
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#5e60ce',
  },
}));

const PowerSlider = styled(Slider)(({ theme }) => ({
  color: '#e63946',
  height: 8,
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&::before': {
      display: 'none',
    },
  },
}));

const AngleSlider = styled(Slider)(({ theme }) => ({
  color: '#6930c3',
  height: 8,
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&::before': {
      display: 'none',
    },
  },
}));

const LevelChip = styled(Chip)(({ theme, level }) => ({
  backgroundColor: level === 'beginner' ? '#ff9f1c' : 
                  level === 'expert' ? '#e63946' : 
                  '#6930c3',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '0.75rem',
  height: 24
}));

// New component for the power cue indicator
const PowerCueContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '-60px',
  transform: 'translateY(-50%)',
  width: '40px',
  height: '300px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
}));

const PowerCue = styled(Box)(({ theme, power }) => ({
  width: '20px',
  height: '250px',
  backgroundColor: '#444',
  borderRadius: '10px',
  position: 'relative',
  overflow: 'hidden',
  border: '2px solid #222',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
}));

const PowerIndicator = styled(Box)(({ theme, power, isPowerful }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  height: `${power}%`,
  background: isPowerful ? 
    'linear-gradient(to top, #e63946, #ff9f1c)' : 
    'linear-gradient(to top, #4cc9f0, #4361ee)',
  transition: 'height 0.2s ease-out',
}));

export default function AimAssistant({ 
  ballPositions, 
  playerLevel,
  onAimChange,
  onShoot,
  isSimulationStarted,
  activeSuggestion
}) {
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);
  const [isAiming, setIsAiming] = useState(false);
  const [canShoot, setCanShoot] = useState(false);
  const [showPowerCue, setShowPowerCue] = useState(false);
  
  // Update aim when active suggestion changes
  useEffect(() => {
    if (activeSuggestion) {
      // Convert suggestion parameters to our slider values
      setAngle(activeSuggestion.angle);
      setPower(activeSuggestion.power * 100);
      setIsAiming(true);
    }
  }, [activeSuggestion]);
  
  // Check if we can shoot (need white ball and at least one object ball)
  useEffect(() => {
    if (!ballPositions || isSimulationStarted) {
      setCanShoot(false);
      return;
    }
    
    const whiteBall = ballPositions.find(ball => ball.color === "white" && !ball.pocketed);
    const objectBalls = ballPositions.filter(ball => ball.color !== "white" && !ball.pocketed);
    
    setCanShoot(!!whiteBall && objectBalls.length > 0);
  }, [ballPositions, isSimulationStarted]);

  // Control power cue visibility
  useEffect(() => {
    setShowPowerCue(isAiming);
  }, [isAiming]);
  
  // Handle angle change
  const handleAngleChange = (event, newValue) => {
    setAngle(newValue);
    if (onAimChange) {
      onAimChange({
        angle: newValue,
        power: power / 100 // Convert to 0-1 scale
      });
    }
  };
  
  // Handle power change
  const handlePowerChange = (event, newValue) => {
    setPower(newValue);
    if (onAimChange) {
      onAimChange({
        angle,
        power: newValue / 100 // Convert to 0-1 scale
      });
    }
  };
  
  // Toggle aiming mode
  const toggleAiming = () => {
    setIsAiming(!isAiming);
    if (!isAiming && onAimChange) {
      onAimChange({
        angle,
        power: power / 100
      });
    }
  };
  
  // Handle shoot action
  const handleShoot = () => {
    if (onShoot) {
      onShoot({
        angle,
        power: power / 100
      });
    }
    setIsAiming(false);
  };
  
  // Get helper text based on player level
  const getHelperText = () => {
    switch(playerLevel) {
      case 'beginner':
        return "Aim directly at the ball you want to hit. Use medium power for a controlled shot.";
      case 'expert':
        return "Consider using side spin for positional play. Vary power based on next position.";
      case 'intermediate':
      default:
        return "Focus on a clean hit. Plan where the white will go after contact.";
    }
  };
  
  // Helper function to get difficulty level text for current settings
  const getDifficultyLevel = () => {
    const powerFactor = power / 100;
    
    // More complex shots use precise angles and higher power
    if (powerFactor > 0.8) {
      return "expert";
    } else if (powerFactor > 0.6) {
      return "intermediate";
    } else {
      return "beginner";
    }
  };
  
  // Is power in the "powerful" range (for visual indication)
  const isPowerfulShot = power > 70;
  
  if (isSimulationStarted) {
    return null;
  }

  // Render the power cue outside the main container
  const renderPowerCue = () => {
    if (!showPowerCue) return null;
    
    return (
      <PowerCueContainer>
        <Typography variant="caption" sx={{ color: '#555', mb: 1, fontWeight: 'bold' }}>
          POWER
        </Typography>
        <PowerCue>
          <PowerIndicator power={power} isPowerful={isPowerfulShot} />
        </PowerCue>
        <Typography variant="caption" sx={{ color: '#e63946', mt: 1, fontWeight: 'bold' }}>
          {power}%
        </Typography>
      </PowerCueContainer>
    );
  };
  
  return (
    <Box sx={{ position: 'relative' }}>
      {renderPowerCue()}
      
      <AimContainer>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <AimIcon sx={{ mr: 1, color: '#6930c3' }} />
            Shot Controls
          </Typography>
          <LevelChip 
            label={`${playerLevel.charAt(0).toUpperCase() + playerLevel.slice(1)} Level`} 
            level={playerLevel} 
            size="small"
          />
        </Box>
        
        {isAiming ? (
          <>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AdjustIcon sx={{ color: '#6930c3', mr: 1 }} />
                <Typography variant="body2" sx={{ mr: 1 }}>Angle: {Math.round(angle)}°</Typography>
                <Tooltip title="Change the angle of your shot">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    (0-360°)
                  </Typography>
                </Tooltip>
              </Box>
              <AngleSlider
                value={angle}
                onChange={handleAngleChange}
                aria-label="Shot angle"
                min={0}
                max={360}
                sx={{ mt: 1 }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PowerIcon sx={{ color: '#e63946', mr: 1 }} />
                <Typography variant="body2" sx={{ mr: 1 }}>Power: {power}%</Typography>
                <LevelChip 
                  label={getDifficultyLevel().charAt(0).toUpperCase() + getDifficultyLevel().slice(1)} 
                  level={getDifficultyLevel()} 
                  size="small"
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <PowerSlider
                value={power}
                onChange={handlePowerChange}
                aria-label="Shot power"
                min={10}
                max={100}
                sx={{ mt: 1 }}
              />
            </Box>
            
            <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary' }}>
              {getHelperText()}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={toggleAiming}
                sx={{ borderRadius: 20, borderColor: '#6930c3', color: '#6930c3' }}
              >
                Cancel
              </Button>
              <AimButton onClick={handleShoot}>
                Take Shot
              </AimButton>
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <AimButton
              onClick={toggleAiming}
              disabled={!canShoot}
              startIcon={<AimIcon />}
            >
              Aim Shot
            </AimButton>
          </Box>
        )}
      </AimContainer>
    </Box>
  );
}