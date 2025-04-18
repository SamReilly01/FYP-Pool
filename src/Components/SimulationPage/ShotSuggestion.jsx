import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

// Icons
import TargetIcon from '@mui/icons-material/GpsFixed';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import LightbulbIcon from '@mui/icons-material/EmojiObjects';
import SportsIcon from '@mui/icons-material/Sports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Styled components
const SuggestionCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#f8f9fa',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  position: 'relative',
  overflow: 'visible'
}));

const SuggestionButton = styled(Button)(({ theme, color }) => ({
  backgroundColor: color || '#6930c3',
  color: 'white',
  borderRadius: theme.spacing(5),
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 'bold',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  marginRight: theme.spacing(1),
  '&:hover': {
    backgroundColor: color ? color : '#5e60ce',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
  },
}));

const LevelIcon = styled(Box)(({ theme, level }) => ({
  position: 'absolute',
  top: -10,
  right: 10,
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: level === 'beginner' ? '#ff9f1c' : 
                  level === 'expert' ? '#e63946' : 
                  '#6930c3',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
}));

// Main shot suggestion component
export default function ShotSuggestion({ 
  ballPositions, 
  playerLevel, 
  tableDimensions, 
  onApplySuggestion, 
  isSimulationStarted,
  gameState // Added gameState to know player's ball group
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeSuggestion, setActiveSuggestion] = useState(null);

  // Calculate shot suggestions when ball positions or game state changes
  useEffect(() => {
    if (!ballPositions || ballPositions.length === 0 || isSimulationStarted) {
      setSuggestions([]);
      return;
    }

    // Generate shot suggestions based on current table state and game state
    const newSuggestions = generateShotSuggestions(
      ballPositions, 
      playerLevel, 
      tableDimensions,
      gameState
    );
    
    setSuggestions(newSuggestions);
  }, [ballPositions, playerLevel, tableDimensions, isSimulationStarted, gameState]);

  // Refresh suggestions
  const handleRefreshSuggestions = () => {
    const newSuggestions = generateShotSuggestions(
      ballPositions, 
      playerLevel, 
      tableDimensions,
      gameState
    );
    setSuggestions(newSuggestions);
  };

  // Apply the selected suggestion
  const handleApplySuggestion = (suggestion) => {
    setActiveSuggestion(suggestion);
    if (onApplySuggestion) {
      onApplySuggestion(suggestion);
    }
  };

  // If no suggestions or simulation started, return empty
  if (isSimulationStarted || !showSuggestions || suggestions.length === 0) {
    return (
      <Collapse in={!isSimulationStarted && suggestions.length > 0}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Button 
            startIcon={<TargetIcon />}
            onClick={() => setShowSuggestions(true)}
            sx={{ color: '#6930c3' }}
          >
            Show Shot Suggestions
          </Button>
        </Box>
      </Collapse>
    );
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <TargetIcon sx={{ mr: 1, color: '#6930c3' }} />
          Shot Suggestions
          <Tooltip title="Suggestions based on your skill level. Higher skill levels offer more complex shots.">
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        <Box>
          <IconButton 
            size="small" 
            onClick={handleRefreshSuggestions}
            sx={{ mr: 1, color: '#6930c3' }}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => setShowSuggestions(false)}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {suggestions.map((suggestion, index) => (
        <SuggestionCard key={index}>
          <LevelIcon level={suggestion.level}>
            {suggestion.level === 'beginner' ? <LightbulbIcon fontSize="small" /> : 
             suggestion.level === 'expert' ? <EmojiEventsIcon fontSize="small" /> : 
             <SportsIcon fontSize="small" />}
          </LevelIcon>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            {suggestion.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {suggestion.description}
          </Typography>
          
          {suggestion.tips && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Tip:</strong> {suggestion.tips}
              </Typography>
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <SuggestionButton
              onClick={() => handleApplySuggestion(suggestion)}
              color={
                suggestion.level === 'beginner' ? '#ff9f1c' : 
                suggestion.level === 'expert' ? '#e63946' : 
                '#6930c3'
              }
            >
              Apply This Shot
            </SuggestionButton>
          </Box>
        </SuggestionCard>
      ))}
    </Box>
  );
}

// Improved function to generate shot suggestions based on ball positions, player level, and game state
function generateShotSuggestions(ballPositions, playerLevel, tableDimensions, gameState) {
  // Default suggestions if calculation fails
  const defaultSuggestions = [
    {
      name: "Direct Shot",
      description: "Aim directly at the nearest object ball",
      level: "beginner",
      angle: 0,
      power: 0.6,
      tips: "Keep your cue level and follow through smoothly"
    }
  ];

  try {
    // Find cue ball (white)
    const cueBall = ballPositions.find(ball => ball.color === "white" && !ball.pocketed);
    
    // If no cue ball, return default suggestions
    if (!cueBall) return defaultSuggestions;
    
    // Determine which balls the player should be targeting based on game state
    const validTargetBalls = determineValidTargetBalls(ballPositions, gameState);
    
    // If no valid target balls, return empty array or default
    if (validTargetBalls.length === 0) return defaultSuggestions;
    
    // Define table dimensions
    const TABLE_WIDTH = tableDimensions?.width || 800;
    const TABLE_HEIGHT = tableDimensions?.height || 400;
    const BALL_RADIUS = 14;
    
    // Define pocket positions
    const POCKET_POSITIONS = [
      { x: 25, y: 25 },                              // Top left
      { x: TABLE_WIDTH / 2, y: 20 },                 // Top middle
      { x: TABLE_WIDTH - 25, y: 25 },                // Top right
      { x: 25, y: TABLE_HEIGHT - 25 },               // Bottom left
      { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - 20 },  // Bottom middle
      { x: TABLE_WIDTH - 25, y: TABLE_HEIGHT - 25 }, // Bottom right
    ];
    
    // Array to hold all potential shots
    const potentialShots = [];
    
    // For each valid target ball, calculate possible shots to each pocket
    validTargetBalls.forEach(objectBall => {
      POCKET_POSITIONS.forEach(pocket => {
        // Calculate vector from object ball to pocket
        const objToPocketX = pocket.x - objectBall.x;
        const objToPocketY = pocket.y - objectBall.y;
        const objToPocketDist = Math.sqrt(objToPocketX * objToPocketX + objToPocketY * objToPocketY);
        
        // Normalise the vector
        const objToPocketNormX = objToPocketX / objToPocketDist;
        const objToPocketNormY = objToPocketY / objToPocketDist;
        
        // Calculate required position for cue ball to hit object ball correctly
        // (opposite direction from pocket, at 2 * ball radius distance)
        const requiredCueX = objectBall.x - objToPocketNormX * (BALL_RADIUS * 2);
        const requiredCueY = objectBall.y - objToPocketNormY * (BALL_RADIUS * 2);
        
        // Calculate distance from current cue position to required position
        const cueToPosX = requiredCueX - cueBall.x;
        const cueToPosY = requiredCueY - cueBall.y;
        const cueToPosDistance = Math.sqrt(cueToPosX * cueToPosX + cueToPosY * cueToPosY);
        
        // Calculate angle for the shot (in degrees)
        let angle = Math.atan2(cueToPosY, cueToPosX) * (180 / Math.PI);
        if (angle < 0) angle += 360; // Convert to 0-360 range
        
        // Check if path from object to pocket is clear
        const pathToPocketClear = isPathClear(objectBall, pocket, ballPositions);
        
        // Check if path from cue to object is clear
        const pathToBallClear = isPathClear(cueBall, { x: requiredCueX, y: requiredCueY }, ballPositions);
        
        // Only consider this a valid shot if both paths are reasonably clear
        if (pathToPocketClear && pathToBallClear) {
          // Calculate shot difficulty based on distances and angles
          const shotDifficulty = calculateShotDifficulty(
            cueToPosDistance, 
            objToPocketDist, 
            pathToPocketClear, 
            pathToBallClear
          );
          
          // Determine appropriate power based on distance
          const power = Math.min(0.5 + (cueToPosDistance / 500), 0.95);
          
          // Add shot to potential shots array
          potentialShots.push({
            objectBall,
            pocket,
            difficulty: shotDifficulty,
            angle,
            power,
            pathClear: pathToPocketClear,
            cuePathClear: pathToBallClear,
            requiredCuePos: { x: requiredCueX, y: requiredCueY },
            distance: cueToPosDistance
          });
        }
      });
    });
    
    // Sort shots by difficulty (easiest first)
    potentialShots.sort((a, b) => a.difficulty - b.difficulty);
    
    // If no potential shots were found, but we have valid target balls,
    // create at least one suggestion for each target ball
    if (potentialShots.length === 0 && validTargetBalls.length > 0) {
      validTargetBalls.forEach(targetBall => {
        // Find the closest pocket
        let closestPocket = POCKET_POSITIONS[0];
        let minDistance = Number.MAX_VALUE;
        
        POCKET_POSITIONS.forEach(pocket => {
          const dx = pocket.x - targetBall.x;
          const dy = pocket.y - targetBall.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < minDistance) {
            minDistance = distance;
            closestPocket = pocket;
          }
        });
        
        // Calculate basic shot parameters
        const objToPocketX = closestPocket.x - targetBall.x;
        const objToPocketY = closestPocket.y - targetBall.y;
        const objToPocketDist = Math.sqrt(objToPocketX * objToPocketX + objToPocketY * objToPocketY);
        
        // Normalise the vector
        const objToPocketNormX = objToPocketX / objToPocketDist;
        const objToPocketNormY = objToPocketY / objToPocketDist;
        
        // Calculate angle from cue ball to target ball
        const cueToBallX = targetBall.x - cueBall.x;
        const cueToBallY = targetBall.y - cueBall.y;
        const cueToBallDist = Math.sqrt(cueToBallX * cueToBallX + cueToBallY * cueToBallY);
        
        // Calculate angle for direct shot at the ball
        let angle = Math.atan2(cueToBallY, cueToBallX) * (180 / Math.PI);
        if (angle < 0) angle += 360; // Convert to 0-360 range
        
        // Add as challenging shot even if not ideal
        potentialShots.push({
          objectBall: targetBall,
          pocket: closestPocket,
          difficulty: 0.7, // Mark as a challenging shot
          angle: angle,
          power: 0.6, // Medium power
          pathClear: false, // Path may not be clear
          cuePathClear: true, // Direct path to the ball
          requiredCuePos: { x: cueBall.x, y: cueBall.y },
          distance: cueToBallDist
        });
      });
      
      // Re-sort after adding these fallback shots
      potentialShots.sort((a, b) => a.difficulty - b.difficulty);
    }
    
    // Filter shots based on player level
    let filteredShots = [];
    switch (playerLevel) {
      case 'beginner':
        // For beginners, only show easy direct shots
        filteredShots = potentialShots.filter(shot => 
          shot.difficulty < 0.4 && shot.pathClear && shot.cuePathClear
        ).slice(0, 2);
        break;
      case 'intermediate':
        // For intermediate, show medium difficulty shots
        filteredShots = potentialShots.filter(shot => 
          shot.difficulty < 0.7
        ).slice(0, 3);
        break;
      case 'expert':
        // For experts, include challenging shots
        filteredShots = potentialShots.slice(0, 4);
        break;
      default:
        filteredShots = potentialShots.filter(shot => shot.difficulty < 0.5).slice(0, 2);
    }
    
    // If we still have no filtered shots but have potentialShots,
    // include at least one regardless of difficulty
    if (filteredShots.length === 0 && potentialShots.length > 0) {
      filteredShots = [potentialShots[0]];
    }
    
    // Transform filtered shots into suggestion objects
    const suggestions = filteredShots.map(shot => {
      // Categorise shot complexity
      let complexity = 'simple';
      if (shot.difficulty > 0.6) complexity = 'challenging';
      else if (shot.difficulty > 0.3) complexity = 'moderate';
      
      // Set level requirement
      let level = 'beginner';
      if (shot.difficulty > 0.6) level = 'expert';
      else if (shot.difficulty > 0.3) level = 'intermediate';
      
      // Create suggestion name
      let name = `${complexity.charAt(0).toUpperCase() + complexity.slice(1)} Shot`;
      if (shot.objectBall.color !== 'black') {
        name += ` (${shot.objectBall.color.charAt(0).toUpperCase() + shot.objectBall.color.slice(1)}`;
        if (shot.objectBall.number) name += ` ${shot.objectBall.number}`;
        name += ')';
      } else {
        name += " (Black Ball)";
      }
      
      // Create suggestion description
      let description = `Aim ${Math.round(shot.angle)}° to hit the ${shot.objectBall.color} ball`;
      if (shot.objectBall.number) description += ` #${shot.objectBall.number}`;
      description += ` into the ${getPocketLocation(shot.pocket, TABLE_WIDTH, TABLE_HEIGHT)} pocket.`;
      
      // Add specific tips based on shot complexity and player level
      let tips = "";
      if (shot.difficulty > 0.6) {
        tips = "This is a challenging shot requiring precise aim and control. Focus on your stance and follow-through.";
      } else if (shot.difficulty > 0.3) {
        tips = "Take your time to line up this shot. Make sure your bridge hand is stable.";
      } else {
        tips = "Keep your cue level and follow through smoothly after making contact.";
      }
      
      // Add warning if path is not completely clear
      if (!shot.pathClear) {
        tips += " Caution: There are obstacles in the path to the pocket.";
      }
      
      return {
        name,
        description,
        tips,
        level,
        angle: shot.angle,
        power: shot.power,
        objectBall: shot.objectBall,
        pocket: shot.pocket,
        difficulty: shot.difficulty,
        requiredCuePos: shot.requiredCuePos
      };
    });
    
    // Return suggestions or default if none available
    return suggestions.length > 0 ? suggestions : defaultSuggestions;
  } catch (error) {
    console.error("Error generating shot suggestions:", error);
    return defaultSuggestions;
  }
}

// Helper function to determine which balls the player should target based on game state
function determineValidTargetBalls(ballPositions, gameState) {
  // Filter out pocketed balls
  const activeBalls = ballPositions.filter(ball => !ball.pocketed);
  
  // If game state is not provided or game hasn't started, allow all balls except black and white
  if (!gameState || !gameState.isGameStarted) {
    return activeBalls.filter(ball => ball.color !== "white" && ball.color !== "black");
  }
  
  // Get the current player
  const currentPlayer = gameState.currentPlayer || 1;
  
  // Check if ball groups have been assigned by examining both possible property names
  // Some parts of the code use playerBallGroups (from poolRulesService) and others use ballGroups
  const isBallGroupsAssigned = gameState.isBallGroupsAssigned || false;
  
  if (!isBallGroupsAssigned) {
    // Table is "open" - player can hit any colored ball except black
    return activeBalls.filter(ball => ball.color !== "white" && ball.color !== "black");
  }
  
  // Try to get the player's assigned ball color from either property
  let playerColor = null;
  
  // First check playerBallGroups (from poolRulesService)
  if (gameState.playerBallGroups && gameState.playerBallGroups[currentPlayer]) {
    playerColor = gameState.playerBallGroups[currentPlayer];
  }
  // Then check ballGroups (used in the UI components)
  else if (gameState.ballGroups && gameState.ballGroups[currentPlayer]) {
    playerColor = gameState.ballGroups[currentPlayer];
  }
  
  // If we still don't have a color, log the game state for debugging and return all colored balls
  if (!playerColor) {
    console.log("Warning: Could not determine player color from game state:", gameState);
    return activeBalls.filter(ball => ball.color !== "white" && ball.color !== "black");
  }
  
  // Count remaining balls of player's color
  const remainingBalls = activeBalls.filter(ball => ball.color === playerColor).length;
  
  // If player has cleared all their balls, they should target the black
  if (remainingBalls === 0) {
    return activeBalls.filter(ball => ball.color === "black");
  }
  
  // Otherwise, player should target their assigned color
  console.log(`Player ${currentPlayer} should target ${playerColor} balls`);
  return activeBalls.filter(ball => ball.color === playerColor);
}

// Helper function to check if path is clear between two points
function isPathClear(startPoint, endPoint, ballPositions) {
  // Skip balls that are at start or end points
  const otherBalls = ballPositions.filter(ball => 
    !ball.pocketed && 
    !((Math.abs(ball.x - startPoint.x) < 1 && Math.abs(ball.y - startPoint.y) < 1) || 
      (Math.abs(ball.x - endPoint.x) < 1 && Math.abs(ball.y - endPoint.y) < 1))
  );
  
  // If no other balls, path is clear
  if (otherBalls.length === 0) return true;
  
  // Calculate direction vector
  const dirX = endPoint.x - startPoint.x;
  const dirY = endPoint.y - startPoint.y;
  const length = Math.sqrt(dirX * dirX + dirY * dirY);
  
  // Normalise direction
  const normDirX = dirX / length;
  const normDirY = dirY / length;
  
  // For each ball, check if it's near the path
  for (const ball of otherBalls) {
    // Vector from start to ball
    const startToBallX = ball.x - startPoint.x;
    const startToBallY = ball.y - startPoint.y;
    
    // Project this vector onto the direction
    const projection = startToBallX * normDirX + startToBallY * normDirY;
    
    // Skip if ball is behind start point or beyond end point
    if (projection < 0 || projection > length) continue;
    
    // Calculate closest point on line to ball
    const closestX = startPoint.x + (normDirX * projection);
    const closestY = startPoint.y + (normDirY * projection);
    
    // Calculate distance from closest point to ball center
    const distX = closestX - ball.x;
    const distY = closestY - ball.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    // If distance is less than ball diameter, path is blocked
    if (distance < ball.radius || distance < 14) { // Use ball radius if available, otherwise default
      return false;
    }
  }
  
  return true;
}

// Helper function to calculate shot difficulty (0-1 scale)
function calculateShotDifficulty(cueDistance, pocketDistance, pathClear, cuePathClear) {
  // Base difficulty starts at 0.2
  let difficulty = 0.2;
  
  // Add difficulty based on distances
  difficulty += cueDistance / 800; // More distance = more difficult
  difficulty += pocketDistance / 1000; // Distance to pocket also adds difficulty
  
  // Add difficulty if paths are not clear
  if (!pathClear) difficulty += 0.3;
  if (!cuePathClear) difficulty += 0.2;
  
  // Ensure difficulty is within 0-1 range
  return Math.min(Math.max(difficulty, 0), 1);
}

// Helper function to get pocket location description
function getPocketLocation(pocket, tableWidth, tableHeight) {
  const midX = tableWidth / 2;
  const midY = tableHeight / 2;
  
  if (pocket.x < midX * 0.5) {
    return pocket.y < midY ? "top left" : "bottom left";
  } else if (pocket.x > tableWidth - midX * 0.5) {
    return pocket.y < midY ? "top right" : "bottom right";
  } else {
    return pocket.y < midY ? "top middle" : "bottom middle";
  }
}