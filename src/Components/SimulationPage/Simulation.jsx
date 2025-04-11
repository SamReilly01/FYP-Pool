import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Slider from '@mui/material/Slider';
import { styled, alpha } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';

// Icons
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PauseIcon from '@mui/icons-material/Pause';
import BugReportIcon from '@mui/icons-material/BugReport';
import SpeedIcon from '@mui/icons-material/Speed';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import InfoIcon from '@mui/icons-material/Info';
import SportsIcon from '@mui/icons-material/Sports';
import AimIcon from '@mui/icons-material/GpsFixed';
import SaveIcon from '@mui/icons-material/Save';
import FlagIcon from '@mui/icons-material/Flag';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import SportsBilliards from '@mui/icons-material/SportsEsports';
import CloseIcon from '@mui/icons-material/Close';

// Import components
import ShotSuggestion from './ShotSuggestion';
import AimAssistant from './AimAssistant';

// Interactive Pool Controls Component
const InteractivePoolControls = ({
  ballPositions,
  setAimParameters,
  aimParameters,
  setShowShotLine,
  showShotLine,
  imageSize,
  containerRef,
  onShoot,
  isSimulationStarted,
  isSimulationPaused,
  setIsManualAiming,
  setActiveSuggestion
}) => {
  const [isDraggingCue, setIsDraggingCue] = useState(false);
  const [isDraggingPower, setIsDraggingPower] = useState(false);
  const [startAngle, setStartAngle] = useState(null);
  const powerMeterRef = useRef(null);

  // Find the white cue ball
  const cueBall = ballPositions.find(ball => ball.color === 'white' && !ball.pocketed);

  // Get table dimensions
  const scaleX = imageSize.width / TABLE_WIDTH;
  const scaleY = imageSize.height / TABLE_HEIGHT;

  // Convert table coordinates to screen coordinates
  const getScreenCoords = (tableX, tableY) => ({
    x: tableX * scaleX,
    y: tableY * scaleY
  });

  // Convert screen coordinates to table coordinates
  const getTableCoords = (screenX, screenY) => ({
    x: screenX / scaleX,
    y: screenY / scaleY
  });

  // Calculate angle between two points
  const calculateAngle = (centerX, centerY, pointX, pointY) => {
    const dx = pointX - centerX;
    const dy = pointY - centerY;
    // Calculate angle in radians and convert to degrees
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    // Convert to 0-360 range
    if (angle < 0) angle += 360;
    return angle;
  };


  // Handle mouse/touch down on cue ball
  const handleCueBallDown = (e) => {
    if (isSimulationStarted && !isSimulationPaused) return;

    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();

    // Get mouse/touch position relative to container
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate position relative to container
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    // Get cue ball screen coordinates
    const ballPos = getScreenCoords(cueBall.x, cueBall.y);

    // Calculate initial angle
    const initialAngle = calculateAngle(ballPos.x, ballPos.y, mouseX, mouseY);
    setStartAngle(initialAngle);

    // Update aim parameters with initial angle
    setAimParameters(prev => ({
      ...prev,
      angle: initialAngle
    }));

    // Show the shot line
    setShowShotLine(true);
    setIsManualAiming(true);
    setActiveSuggestion(null);

    // Start dragging
    setIsDraggingCue(true);

    // Add document-level event listeners
    document.addEventListener('mousemove', handleCueMove);
    document.addEventListener('touchmove', handleCueMove, { passive: false });
    document.addEventListener('mouseup', handleCueUp);
    document.addEventListener('touchend', handleCueUp);
  };

  // Handle mouse/touch move while dragging cue
  const handleCueMove = (e) => {
    if (!isDraggingCue) return;

    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();

    // Get mouse/touch position
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate position relative to container
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    // Get cue ball screen coordinates
    const ballPos = getScreenCoords(cueBall.x, cueBall.y);

    // Calculate new angle
    const newAngle = calculateAngle(ballPos.x, ballPos.y, mouseX, mouseY);

    // Update aim parameters
    setAimParameters(prev => ({
      ...prev,
      angle: newAngle
    }));
  };

  // Handle mouse/touch up after dragging cue
  const handleCueUp = () => {
    if (!isDraggingCue) return;

    setIsDraggingCue(false);

    // Remove document-level event listeners
    document.removeEventListener('mousemove', handleCueMove);
    document.removeEventListener('touchmove', handleCueMove);
    document.removeEventListener('mouseup', handleCueUp);
    document.removeEventListener('touchend', handleCueUp);
  };

  // Handle mouse/touch down on power meter
  const handlePowerDown = (e) => {
    if (isSimulationStarted && !isSimulationPaused) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDraggingPower(true);
    updatePowerFromPosition(e);

    // Add document-level event listeners
    document.addEventListener('mousemove', handlePowerMove);
    document.addEventListener('touchmove', handlePowerMove, { passive: false });
    document.addEventListener('mouseup', handlePowerUp);
    document.addEventListener('touchend', handlePowerUp);
  };

  // Handle mouse/touch move while dragging power meter
  const handlePowerMove = (e) => {
    if (!isDraggingPower) return;

    e.preventDefault();
    updatePowerFromPosition(e);
  };

  // Handle mouse/touch up after dragging power meter
  const handlePowerUp = () => {
    setIsDraggingPower(false);

    // Remove document-level event listeners
    document.removeEventListener('mousemove', handlePowerMove);
    document.removeEventListener('touchmove', handlePowerMove);
    document.removeEventListener('mouseup', handlePowerUp);
    document.removeEventListener('touchend', handlePowerUp);
  };

  // Update power based on mouse/touch position
  const updatePowerFromPosition = (e) => {
    if (!powerMeterRef.current) return;

    // Get power meter element position
    const rect = powerMeterRef.current.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate relative position (0 at bottom, 1 at top)
    const relativePosition = 1 - (clientY - rect.top) / rect.height;

    // Clamp power between 0.1 and 1
    const newPower = Math.max(0.1, Math.min(1, relativePosition));

    // Update aim parameters
    setAimParameters(prev => ({
      ...prev,
      power: newPower
    }));
  };

  // Handle take shot
  const handleTakeShot = () => {
    if (onShoot) {
      onShoot(aimParameters);
    }
  };

  // If simulation is running, don't render interactive controls
  if (isSimulationStarted && !isSimulationPaused) return null;
  if (!cueBall) return null;

  // Get cue ball position in screen coordinates
  const ballScreenPos = getScreenCoords(cueBall.x, cueBall.y);

  return (
    <>
      {/* Interactive area for cue ball */}
      <div
        style={{
          position: 'absolute',
          top: ballScreenPos.y - 40,
          left: ballScreenPos.x - 40,
          width: 80,
          height: 80,
          borderRadius: '50%',
          cursor: 'grab',
          zIndex: 200,
          opacity: 0.2,  // Make slightly visible for better UX
          backgroundColor: '#fff',
          border: '2px solid rgba(105, 48, 195, 0.5)',
        }}
        onMouseDown={handleCueBallDown}
        onTouchStart={handleCueBallDown}
      />

      {/* Interactive power meter */}
      <div
        ref={powerMeterRef}
        style={{
          position: 'absolute',
          left: '-50px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '30px',
          height: '260px',
          backgroundColor: '#333',
          borderRadius: '15px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          border: '2px solid #222',
          overflow: 'hidden',
          cursor: isDraggingPower ? 'grabbing' : 'grab',
          zIndex: 1000, // Increased z-index to ensure visibility
          display: (!isSimulationStarted || isSimulationPaused) && cueBall ? 'block' : 'none',
        }}
        onMouseDown={handlePowerDown}
        onTouchStart={handlePowerDown}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: `${aimParameters.power * 100}%`,
            background: aimParameters.power > 0.7 ?
              'linear-gradient(to top, #e63946, #ff9f1c)' :
              'linear-gradient(to top, #4cc9f0, #4361ee)',
            transition: isDraggingPower ? 'none' : 'height 0.2s ease-out',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '10px',
            height: '240px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
            borderRadius: '5px',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            left: '0',
            width: '100%',
            textAlign: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: '#222',
            padding: '4px 0',
            borderRadius: '10px 10px 0 0',
            pointerEvents: 'none',
          }}
        >
          POWER
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '-25px',
            left: '0',
            width: '100%',
            textAlign: 'center',
            color: 'white',
            fontSize: '11px',
            backgroundColor: '#222',
            padding: '2px 0',
            borderRadius: '0 0 10px 10px',
            pointerEvents: 'none',
          }}
        >
          {Math.round(aimParameters.power * 100)}%
        </div>
      </div>

      {/* Shoot button */}
      <button
        style={{
          position: 'absolute',
          right: '0px',
          bottom: '0px',
          backgroundColor: '#6930c3',
          color: 'white',
          borderRadius: '25px',
          padding: '12px 25px',
          border: 'none',
          fontWeight: 'bold',
          fontSize: '16px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          zIndex: 100,
          //display: (!isSimulationStarted || isSimulationPaused) && cueBall && showShotLine ? 'block' : 'none',
        }}
        onClick={handleTakeShot}
      >
        Take Shot
      </button>
    </>
  );
};

// TabPanel component for tabbed interface
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// ===== Enhanced Styled Components =====

const Header = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #5e60ce 0%, #6930c3 100%)',
  borderRadius: '0 0 20px 20px',
  padding: theme.spacing(2, 3),
  color: 'white',
  position: 'relative',
  minHeight: '140px',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
}));

const NavBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.5rem',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
}));

const NavLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
}));

const NavLink = styled(Button)(({ theme, active }) => ({
  color: 'white',
  fontWeight: active ? 'bold' : 'normal',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const ActionButton = styled(Button)(({ theme, color }) => ({
  backgroundColor: color || '#ff9f1c',
  color: 'white',
  borderRadius: theme.spacing(5),
  padding: theme.spacing(1, 4),
  textTransform: 'none',
  fontWeight: 'bold',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    backgroundColor: color ? color : '#f2a365',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const MainHeading = styled(Typography)(({ theme }) => ({
  fontSize: '2.2rem',
  fontWeight: 'bold',
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(1),
}));

const SubHeading = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  opacity: 0.8,
  marginBottom: theme.spacing(2),
  maxWidth: '500px',
}));

// Enhanced card styles
const SimulationCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
  },
}));

const SimulationCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  padding: theme.spacing(2, 3),
}));

// UPDATED: Changed overflow to 'visible'
const SimulationView = styled(Box)(({ theme }) => ({
  flex: 1,
  position: 'relative',
  padding: theme.spacing(2),
  backgroundColor: '#f8f9fa',
  borderRadius: theme.spacing(1),
  overflow: 'visible', // Changed from 'hidden' to 'visible' to ensure elements can extend outside
  minHeight: 500,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

// Enhanced and simplified controls card
const ControlsCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.06)',
  overflow: 'hidden',
}));

// Clean tab styles
const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: '48px',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
  '& .MuiTab-root': {
    minHeight: '48px',
    padding: theme.spacing(1.5, 2),
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    fontSize: '1.1rem',
  },
}));

// New ball visualization component
const BallVisualization = styled(Box)(({ theme, color }) => ({
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: color === 'white' ? '#fff' :
    color === 'black' ? '#000' :
      color === 'red' ? '#f44336' :
        '#ffeb3b',
  border: color === 'white' ? '1px solid #ddd' : 'none',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: color === 'white' || color === 'yellow' ? '#000' : '#fff',
  fontWeight: 'bold',
  fontSize: '0.75rem',
}));

// Improved save button
const SaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#4caf50',
  color: 'white',
  borderRadius: theme.spacing(5),
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 'bold',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    backgroundColor: '#388e3c',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
  },
}));

// Physics constants for the simulation
const FRICTION = 0.98;
const RESTITUTION = 0.9; // Bouncing off walls
const TABLE_WIDTH = 800;
const TABLE_HEIGHT = 400;
const BALL_RADIUS = 14;
const POCKET_RADIUS = 25;
const RAIL_THICKNESS = 30;
const POCKET_POSITIONS = [
  { x: RAIL_THICKNESS, y: RAIL_THICKNESS },                     // Top left
  { x: TABLE_WIDTH / 2, y: RAIL_THICKNESS / 2 },                  // Top middle
  { x: TABLE_WIDTH - RAIL_THICKNESS, y: RAIL_THICKNESS },       // Top right
  { x: RAIL_THICKNESS, y: TABLE_HEIGHT - RAIL_THICKNESS },              // Bottom left
  { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - RAIL_THICKNESS / 2 },           // Bottom middle
  { x: TABLE_WIDTH - RAIL_THICKNESS, y: TABLE_HEIGHT - RAIL_THICKNESS }, // Bottom right
];

// Collisions between balls
function checkCollision(ball1, ball2) {
  const dx = ball1.x - ball2.x;
  const dy = ball1.y - ball2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < (BALL_RADIUS * 2);
}

// Handle ball collision physics
function resolveCollision(ball1, ball2) {
  const dx = ball2.x - ball1.x;
  const dy = ball2.y - ball1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // If balls are overlapping, move them apart
  if (distance < BALL_RADIUS * 2) {
    const overlap = (BALL_RADIUS * 2) - distance;
    const moveX = (dx / distance) * (overlap / 2);
    const moveY = (dy / distance) * (overlap / 2);

    // Move balls apart
    ball1.x -= moveX;
    ball1.y -= moveY;
    ball2.x += moveX;
    ball2.y += moveY;

    // Calculate normalized collision vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Calculate relative velocity
    const vrx = ball2.vx - ball1.vx;
    const vry = ball2.vy - ball1.vy;

    // Calculate the dot product (impulse scalar)
    const dotProduct = nx * vrx + ny * vry;

    // Only apply impulse if balls are moving toward each other
    if (dotProduct > 0) return;

    // Calculate impulse scalar
    const impulse = -(1 + RESTITUTION) * dotProduct;

    // Calculate mass (assuming all balls have same mass)
    const mass1 = 1;
    const mass2 = 1;
    const impulseFactor = impulse / (mass1 + mass2);

    // Apply impulse
    ball1.vx -= impulseFactor * mass2 * nx;
    ball1.vy -= impulseFactor * mass2 * ny;
    ball2.vx += impulseFactor * mass1 * nx;
    ball2.vy += impulseFactor * mass1 * ny;
  }
}

// Check if ball is in pocket
function isInPocket(ball) {
  let nearPocket = false;
  for (const pocket of POCKET_POSITIONS) {
    const dx = ball.x - pocket.x;
    const dy = ball.y - pocket.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Increase the effective pocket size to make it easier to pocket balls
    // A ball is considered pocketed when it significantly overlaps with the pocket
    if (distance < POCKET_RADIUS + BALL_RADIUS / 2) {
      return true;
    }
  }
  return false;
}

// Add these default dimensions
const DEFAULT_TABLE_WIDTH = 800;
const DEFAULT_TABLE_HEIGHT = 400;

// Standalone power control component for backup
const StandalonePowerControl = ({ onPowerChange, initialPower = 0.5, disabled = false }) => {
  const [power, setPower] = useState(initialPower);
  const powerBarRef = useRef(null);

  const handlePowerChange = (e) => {
    if (disabled) return;

    const rect = powerBarRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const barHeight = rect.height;

    // Calculate power (0 at bottom, 1 at top)
    const newPower = Math.max(0.1, Math.min(1, 1 - (clickY / barHeight)));
    setPower(newPower);

    // Notify parent component
    if (onPowerChange) {
      onPowerChange(newPower);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        left: '625px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        display: disabled ? 'none' : 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)'
      }}
    >
      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
        POWER
      </Typography>

      <Box
        ref={powerBarRef}
        sx={{
          width: '30px',
          height: '200px',
          backgroundColor: '#333',
          borderRadius: '15px',
          border: '2px solid #222',
          overflow: 'hidden',
          position: 'relative',
          cursor: disabled ? 'default' : 'pointer'
        }}
        onClick={handlePowerChange}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: `${power * 100}%`,
            background: power > 0.7 ?
              'linear-gradient(to top, #e63946, #ff9f1c)' :
              'linear-gradient(to top, #4cc9f0, #4361ee)',
            transition: 'height 0.2s ease-out'
          }}
        />
      </Box>

      <Typography variant="caption" sx={{ color: 'white', mt: 1 }}>
        {Math.round(power * 100)}%
      </Typography>
    </Box>
  );
};

export default function EnhancedSimulationPage() {
  // States, refs, and navigate
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  // Function to check active route
  const isActive = (route) => path === route;

  // State Variables
  const [processedImage, setProcessedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [originalImageSize, setOriginalImageSize] = useState(null);
  const [ballPositions, setBallPositions] = useState([]);
  const [pocketedBalls, setPocketedBalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [simulationPaused, setSimulationPaused] = useState(false);
  const [showShotLine, setShowShotLine] = useState(false);
  const [tableBounds, setTableBounds] = useState(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [initialBallPositions, setInitialBallPositions] = useState([]);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [showTrajectories, setShowTrajectories] = useState(false);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [playerLevel, setPlayerLevel] = useState('intermediate');
  const [retryCount, setRetryCount] = useState(0);

  // New state for replaying simulations
  const [isReplay, setIsReplay] = useState(false);
  const [replayData, setReplayData] = useState(null);

  // New state for shot suggestions and aiming
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [aimParameters, setAimParameters] = useState({ angle: 45, power: 0.5 });
  const [isManualAiming, setIsManualAiming] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // New state variables for saving results
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [simulationName, setSimulationName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // State for expanded info
  const [showHelp, setShowHelp] = useState(false);

  // State for direct controls mode
  const [useDirectControls, setUseDirectControls] = useState(true);

  // State for direct controls guide
  const [showDirectControlsGuide, setShowDirectControlsGuide] = useState(true);

  // Get user_id from localStorage
  const user_id = localStorage.getItem('user_id');

  // Effect for showing direct controls guide
  useEffect(() => {
    // Only show the guide if direct controls are enabled and we're not in a simulation
    if (useDirectControls && !simulationStarted && !localStorage.getItem('directControlsGuideShown')) {
      setShowDirectControlsGuide(true);

      // Set a timer to hide the guide after 8 seconds
      const timer = setTimeout(() => {
        setShowDirectControlsGuide(false);
        localStorage.setItem('directControlsGuideShown', 'true');
      }, 8000);

      return () => clearTimeout(timer);
    } else {
      setShowDirectControlsGuide(false);
    }
  }, [useDirectControls, simulationStarted]);

  // Calculate ball counts by color
  const ballCounts = {
    white: ballPositions.filter(ball => ball.color === 'white' && !ball.pocketed).length,
    red: ballPositions.filter(ball => ball.color === 'red' && !ball.pocketed).length,
    yellow: ballPositions.filter(ball => ball.color === 'yellow' && !ball.pocketed).length,
    black: ballPositions.filter(ball => ball.color === 'black' && !ball.pocketed).length,
  };

  // Debug logging for aim parameters
  useEffect(() => {
    console.log("Aim Parameters:", aimParameters);
    console.log("Show Shot Line:", showShotLine);
  }, [aimParameters, showShotLine]);

  // Show notification
  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    // Check for replay data in localStorage
    const replaySimulation = localStorage.getItem('replaySimulation');

    if (replaySimulation) {
      try {
        // Parse the replay data
        const parsedReplay = JSON.parse(replaySimulation);
        setReplayData(parsedReplay);
        setIsReplay(true);

        // Remove from localStorage
        localStorage.removeItem('replaySimulation');

        // Load the replay data
        loadReplayData(parsedReplay);
      } catch (error) {
        console.error('Error loading replay data:', error);
        // Fall back to normal image loading
        fetchAndProcessImage();
      }
    } else {
      // Normal case - fetch and process a new image
      fetchAndProcessImage();
    }

    // Cleanup animation frame on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [retryCount]);

  // New function to load replay data
  const loadReplayData = (replay) => {
    try {
      setLoading(true);

      // Extract the simulation data
      const simulationName = replay.simulation_name;
      const image_url = replay.image_url;
      let ball_positions, initial_positions, pocketed_balls;

      // Parse JSON strings if needed
      if (typeof replay.ball_positions === 'string') {
        ball_positions = JSON.parse(replay.ball_positions);
      } else {
        ball_positions = replay.ball_positions;
      }

      if (typeof replay.initial_positions === 'string') {
        initial_positions = JSON.parse(replay.initial_positions);
      } else {
        initial_positions = replay.initial_positions;
      }

      if (typeof replay.pocketed_balls === 'string') {
        pocketed_balls = JSON.parse(replay.pocketed_balls);
      } else {
        pocketed_balls = replay.pocketed_balls || [];
      }

      // Set player level
      setPlayerLevel(replay.player_level || 'intermediate');

      // Set image URL
      setProcessedImage(image_url);

      // Initialize ball positions and other states
      setBallPositions(initial_positions);
      setInitialBallPositions(initial_positions);
      setPocketedBalls(pocketed_balls);

      // Show notification
      showNotification(`Loaded simulation "${simulationName}"`, 'info');

      setLoading(false);
    } catch (error) {
      console.error('Error loading replay data:', error);
      showNotification('Error loading replay data. Starting new simulation.', 'error');
      fetchAndProcessImage();
    }
  };

  const fetchAndProcessImage = async () => {
    try {
      console.log("📡 Fetching latest uploaded image...");
      const response = await fetch('http://localhost:5000/api/image/latest');

      if (!response.ok) {
        throw new Error("Failed to fetch latest image. Please upload a new image.");
      }

      const data = await response.json();
      const imagePath = data.image_url;
      console.log("✅ Latest image fetched:", imagePath);

      // Store original image path
      const originalImagePath = `http://localhost:5000${imagePath}`;
      setOriginalImage(originalImagePath);

      console.log("🚀 Sending image for processing:", imagePath);
      const processResponse = await fetch('http://localhost:5000/api/image/process', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_path: imagePath }),
      });

      const result = await processResponse.json();

      if (!processResponse.ok) {
        throw new Error(result.error || "Failed to process image.");
      }

      console.log("✅ Processed image result:", result);

      // Check if there was an error in the result
      if (result.error) {
        throw new Error(result.error);
      }

      // Store original image dimensions if provided by the backend
      if (result.original_dimensions) {
        setOriginalImageSize(result.original_dimensions);
        console.log("📏 Original dimensions:", result.original_dimensions);
      }

      // Store table bounds if provided by the backend
      if (result.table_bounds) {
        setTableBounds(result.table_bounds);
        console.log("🎯 Table bounds:", result.table_bounds);
      }

      const processedImagePath = `http://localhost:5000${result.transformed_image_url}`;
      setProcessedImage(processedImagePath);

      // Verify ball positions
      if (!result.ball_positions || result.ball_positions.length === 0) {
        console.warn("⚠️ No ball positions found in the response");
        showNotification("No pool balls detected in the image. Please try with a clearer image.", "warning");

        // Create default ball positions
        const defaultBalls = createDefaultBallPositions();
        setBallPositions(defaultBalls);
        setInitialBallPositions(JSON.parse(JSON.stringify(defaultBalls)));
      } else {
        console.log("🎱 Ball positions:", result.ball_positions);

        // Add physics properties to the balls and assign unique IDs
        const enhancedBallPositions = result.ball_positions.map((ball, index) => ({
          ...ball,
          id: `ball_${index}`, // Add unique ID for each ball
          vx: 0,               // Initial x velocity
          vy: 0,               // Initial y velocity
          mass: 1,             // All balls have same mass
          pocketed: false,
          trajectoryPoints: []
        }));

        // Verify we have at least one of each required ball color
        const colorCounts = countBallsByColor(enhancedBallPositions);

        let message = null;
        if (colorCounts.white < 1) {
          message = "White ball not detected clearly. A synthetic white ball has been added";
        } else if (colorCounts.black < 1) {
          message = "Black ball not detected clearly. A synthetic black ball has been added";
        }

        if (message) {
          showNotification(message, "info");
        }

        setBallPositions(enhancedBallPositions);
        setInitialBallPositions(JSON.parse(JSON.stringify(enhancedBallPositions)));
      }

      setLoading(false);
    } catch (error) {
      console.error("❌ Error:", error);

      if (retryCount < 2) {
        // Try again after short delay
        showNotification("Image processing failed. Retrying...", "warning");
        setRetryCount(retryCount + 1);
        setTimeout(() => {
          fetchAndProcessImage();
        }, 1500);
      } else {
        setError(error.message);
        showNotification("Failed to process image: " + error.message, "error");

        // Create default ball positions as fallback
        const defaultBalls = createDefaultBallPositions();
        setBallPositions(defaultBalls);
        setInitialBallPositions(JSON.parse(JSON.stringify(defaultBalls)));
        setLoading(false);
      }
    }
  };

  // Helper function to count balls by color
  const countBallsByColor = (balls) => {
    const counts = {
      red: 0,
      yellow: 0,
      white: 0,
      black: 0
    };

    balls.forEach(ball => {
      if (counts.hasOwnProperty(ball.color)) {
        counts[ball.color]++;
      }
    });

    return counts;
  };

  // Create default ball positions for fallback
  const createDefaultBallPositions = () => {
    const defaultBalls = [];

    // White cue ball
    defaultBalls.push({
      id: "ball_white",
      color: "white",
      x: TABLE_WIDTH * 0.25,
      y: TABLE_HEIGHT / 2,
      vx: 0,
      vy: 0,
      pocketed: false,
      trajectoryPoints: []
    });

    // Black 8-ball
    defaultBalls.push({
      id: "ball_black",
      color: "black",
      x: TABLE_WIDTH * 0.5,
      y: TABLE_HEIGHT / 2,
      vx: 0,
      vy: 0,
      pocketed: false,
      trajectoryPoints: []
    });

    // Red balls (triangle formation)
    for (let i = 0; i < 7; i++) {
      const row = Math.floor(Math.sqrt(2 * i));
      const col = i - (row * (row + 1)) / 2;
      const x = TABLE_WIDTH * 0.75 + row * BALL_RADIUS * 2;
      const y = TABLE_HEIGHT / 2 - (row * BALL_RADIUS) + (col * BALL_RADIUS * 2);

      defaultBalls.push({
        id: `ball_red_${i + 1}`,
        color: "red",
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        number: i + 1,
        pocketed: false,
        trajectoryPoints: []
      });
    }

    // Yellow balls (scattered)
    for (let i = 0; i < 7; i++) {
      const angle = (i * Math.PI * 2) / 7;
      const r = TABLE_WIDTH * 0.15;
      const x = TABLE_WIDTH * 0.6 + r * Math.cos(angle);
      const y = TABLE_HEIGHT / 2 + r * Math.sin(angle);

      defaultBalls.push({
        id: `ball_yellow_${i + 1}`,
        color: "yellow",
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        number: i + 1,
        pocketed: false,
        trajectoryPoints: []
      });
    }

    return defaultBalls;
  };

  // Modify the handleImageLoad function
  const handleImageLoad = () => {
    if (imageRef.current && containerRef.current) {
      try {
        // Get the natural dimensions
        const naturalWidth = imageRef.current.naturalWidth;
        const naturalHeight = imageRef.current.naturalHeight;

        if (!naturalWidth || !naturalHeight) {
          throw new Error('Image dimensions not available');
        }

        // Calculate aspect ratio
        const aspectRatio = naturalWidth / naturalHeight;

        // Get container width
        const containerWidth = containerRef.current.clientWidth;

        // Calculate height maintaining aspect ratio
        const calculatedHeight = containerWidth / aspectRatio;

        // Set dimensions
        setImageSize({
          width: containerWidth,
          height: calculatedHeight
        });

        console.log("📏 Image loaded successfully with dimensions:", containerWidth, calculatedHeight);
      } catch (error) {
        console.warn("⚠️ Error loading image, using default dimensions");
        setImageSize({
          width: DEFAULT_TABLE_WIDTH,
          height: DEFAULT_TABLE_HEIGHT
        });
        showNotification("Using default table dimensions", "warning");
      }
    }
  };

  // Add an error handler for the image
  const handleImageError = () => {
    console.error("❌ Failed to load image");
    setImageSize({
      width: DEFAULT_TABLE_WIDTH,
      height: DEFAULT_TABLE_HEIGHT
    });
    showNotification("Failed to load table image, using default dimensions", "error");
  };

  // Function to get simulation parameters based on player level
  const getSimulationParameters = () => {
    // Always use consistent rendering parameters regardless of player level
    const renderingParams = {
      shotPrecision: 0.85,   // Normal precision
      hitStrength: 0.9,      // Normal strength
      helpEnabled: true,     // Show some helpers
      shotSuggestions: true, // Show shot suggestions
      showTrajectories: true // Show trajectories when enabled
    };

    // Then apply gameplay difficulty based on player level
    switch (playerLevel) {
      case 'beginner':
        return {
          ...renderingParams,
          shotPrecision: 0.7,    // More forgiving shots
          hitStrength: 0.8,      // Medium strength
        };
      case 'expert':
        return {
          ...renderingParams,
          shotPrecision: 0.95,   // Very precise shots
          hitStrength: 1.0,      // Full strength
        };
      case 'intermediate':
      default:
        return renderingParams;
    }
  };

  const simulationParams = getSimulationParameters();

  // Handler for applying shot suggestion
  const handleApplySuggestion = (suggestion) => {
    setActiveSuggestion(suggestion);
    setShowShotLine(true);
    setAimParameters({
      angle: suggestion.angle,
      power: suggestion.power
    });

    // Set active tab to Aim Shot when a suggestion is applied
    setActiveTab(0);

    // Show a notification
    showNotification(`Shot suggestion applied: ${suggestion.name}`, "info");
  };

  // Handler for aim changes from AimAssistant
  const handleAimChange = (aimParams) => {
    setAimParameters(aimParams);
    setShowShotLine(true); // This line is crucial
    setIsManualAiming(true);

    // Cancel any active suggestion when manually aiming
    if (activeSuggestion) {
      setActiveSuggestion(null);
    }
  };

  // Function to handle dragging on the power meter directly
  const handlePowerMeterDrag = (newPowerValue) => {
    setAimParameters(prev => ({
      ...prev,
      power: newPowerValue
    }));

    // Ensure shot line is visible
    setShowShotLine(true);
  };

  // Handler for taking a shot
  const handleShoot = (aimParams) => {
    if (simulationStarted) return;

    // Apply the aim parameters to the white cue ball
    setBallPositions(prevBalls => {
      return prevBalls.map(ball => {
        if (ball.color === "white") {
          // Calculate velocity based on aim angle and power
          const radians = aimParams.angle * (Math.PI / 180);
          const speed = aimParams.power * 15; // Scale power to a reasonable velocity

          return {
            ...ball,
            vx: Math.cos(radians) * speed,
            vy: Math.sin(radians) * speed,
          };
        }
        return ball;
      });
    });

    // Start the simulation
    setSimulationStarted(true);
    setSimulationPaused(false);
    lastTimeRef.current = performance.now();

    // Reset the aiming state
    setShowShotLine(false);
    setIsManualAiming(false);
    setActiveSuggestion(null);

    showNotification("Shot taken!", "success");
  };

  // Handle opening save dialog
  const handleOpenSaveDialog = () => {
    // Generate a default name with timestamp
    const timestamp = new Date().toLocaleString().replace(/[/,:\s]/g, '-');
    setSimulationName(`Pool Simulation ${timestamp}`);
    setSaveDialogOpen(true);
  };

  // Handle saving simulation results
  const handleSaveSimulation = async () => {
    if (!user_id) {
      showNotification('You must be logged in to save results', 'error');
      return;
    }

    try {
      setIsSaving(true);

      // Prepare data to save
      const resultsData = {
        user_id: user_id,
        simulation_name: simulationName,
        image_url: processedImage,
        // Convert objects to strings properly to avoid JSON syntax errors
        ball_positions: JSON.stringify(ballPositions),
        initial_positions: JSON.stringify(initialBallPositions),
        pocketed_balls: JSON.stringify(pocketedBalls),
        player_level: playerLevel
      };

      // Call the API to save results
      const response = await fetch('http://localhost:5000/api/results/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultsData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save simulation results');
      }

      const data = await response.json();

      // Close dialog and show success message
      setSaveDialogOpen(false);
      showNotification('Simulation saved successfully!', 'success');

      // Store the simulation ID in localStorage
      localStorage.setItem('lastSavedSimulationId', data.simulation_id);

    } catch (error) {
      console.error('Error saving simulation:', error);
      showNotification(`Error: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Set initial velocities for simulation
  const startPoolSimulation = () => {
    setBallPositions(prevBalls => {
      // Find the white ball (cue ball)
      const cueBall = prevBalls.find(ball => ball.color === "white");

      if (!cueBall) {
        showNotification("White cue ball not found!", "error");
        return prevBalls;
      }

      // Set a realistic initial velocity for the cue ball only
      return prevBalls.map(ball => {
        if (ball.color === "white") {
          // Calculate angle based on player level
          const baseAngle = 45;  // Aim toward the cluster
          const precision = simulationParams.shotPrecision;

          // Add randomness based on skill level
          const maxDeviation = 20 * (1 - precision); // Lower precision = more deviation
          const randomAngle = baseAngle + (Math.random() * 2 - 1) * maxDeviation;
          const radians = randomAngle * (Math.PI / 180);

          // Use player level to determine hit strength
          const baseSpeed = 10;
          const randomSpeed = Math.random() * 2; // Random speed between 0-2
          const hitStrengthMultiplier = simulationParams.hitStrength;
          const speed = (baseSpeed + randomSpeed) * hitStrengthMultiplier;

          return {
            ...ball,
            vx: Math.cos(radians) * speed,
            vy: Math.sin(radians) * speed,
          };
        }
        return ball;
      });
    });

    setPocketedBalls([]); // Reset pocketed balls
    setSimulationStep(0);
    setSimulationStarted(true);
    setSimulationPaused(false);
    lastTimeRef.current = performance.now();

    showNotification("Simulation started!", "success");
  };

  // Animation loop for simulation
  useEffect(() => {
    // Only run animation when simulation is active
    if (!simulationStarted) return;
    if (simulationPaused) return;

    const updatePhysics = (timestamp) => {
      // Calculate time delta (with speed adjustment)
      const delta = (timestamp - lastTimeRef.current) * (simulationSpeed * 0.06);
      lastTimeRef.current = timestamp;

      setSimulationStep(prevStep => prevStep + 1);

      setBallPositions(prevBalls => {
        // Create a copy of the current balls
        const updatedBalls = JSON.parse(JSON.stringify(prevBalls));

        // First update positions based on velocity
        for (let i = 0; i < updatedBalls.length; i++) {
          const ball = updatedBalls[i];

          // Skip already pocketed balls
          if (ball.pocketed) continue;

          // Update position
          ball.x += ball.vx * delta;
          ball.y += ball.vy * delta;

          // Apply friction
          ball.vx *= FRICTION;
          ball.vy *= FRICTION;

          // Stop very slow balls
          if (Math.abs(ball.vx) < 0.01) ball.vx = 0;
          if (Math.abs(ball.vy) < 0.01) ball.vy = 0;

          // Before checking wall collisions, see if the ball is near a pocket
          let nearPocket = false;

          // Check if ball is near any pocket
          for (const pocket of POCKET_POSITIONS) {
            const dx = ball.x - pocket.x;
            const dy = ball.y - pocket.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If ball is close to a pocket, don't apply wall collision
            // This allows the ball to pass through the wall at pocket locations
            if (distance < POCKET_RADIUS * 1.5) {
              nearPocket = true;
              break;
            }
          }

          // Only apply wall collisions if the ball is NOT near a pocket
          if (!nearPocket) {
            // Left wall (with rail thickness)
            if (ball.x < BALL_RADIUS + RAIL_THICKNESS) {
              ball.x = BALL_RADIUS + RAIL_THICKNESS;
              ball.vx = -ball.vx * RESTITUTION;
            }
            // Right wall (with rail thickness)
            if (ball.x > TABLE_WIDTH - BALL_RADIUS - RAIL_THICKNESS) {
              ball.x = TABLE_WIDTH - BALL_RADIUS - RAIL_THICKNESS;
              ball.vx = -ball.vx * RESTITUTION;
            }
            // Top wall (with rail thickness)
            if (ball.y < BALL_RADIUS + RAIL_THICKNESS) {
              ball.y = BALL_RADIUS + RAIL_THICKNESS;
              ball.vy = -ball.vy * RESTITUTION;
            }
            // Bottom wall (with rail thickness)
            if (ball.y > TABLE_HEIGHT - BALL_RADIUS - RAIL_THICKNESS) {
              ball.y = TABLE_HEIGHT - BALL_RADIUS - RAIL_THICKNESS;
              ball.vy = -ball.vy * RESTITUTION;
            }
          }

          // Check if ball is in a pocket
          if (isInPocket(ball)) {
            ball.pocketed = true;
            setPocketedBalls(prev => {
              const existingBall = prev.find(b =>
                b.color === ball.color && b.number === ball.number
              );

              if (existingBall) {
                return prev;
              }

              return [...prev, ball];
            });
          }

          // Track trajectory if needed
          if (showTrajectories && (ball.vx !== 0 || ball.vy !== 0)) {
            if (!ball.trajectoryPoints) {
              ball.trajectoryPoints = [];
            }

            // Only add a point every few frames to avoid too many points
            if (simulationStep % 5 === 0) {
              ball.trajectoryPoints.push({ x: ball.x, y: ball.y });

              // Keep only the last 20 points
              if (ball.trajectoryPoints.length > 20) {
                ball.trajectoryPoints.shift();
              }
            }
          }
        }

        // Check for ball-ball collisions
        for (let i = 0; i < updatedBalls.length; i++) {
          for (let j = i + 1; j < updatedBalls.length; j++) {
            // Skip pocketed balls
            if (updatedBalls[i].pocketed || updatedBalls[j].pocketed) continue;

            if (checkCollision(updatedBalls[i], updatedBalls[j])) {
              resolveCollision(updatedBalls[i], updatedBalls[j]);
            }
          }
        }

        // Check if all balls have stopped
        const allStopped = updatedBalls.every(
          ball => (ball.pocketed || (Math.abs(ball.vx) < 0.01 && Math.abs(ball.vy) < 0.01))
        );

        if (allStopped) {
          // Schedule this state update for after the frame to avoid state updates inside render
          setTimeout(() => {
            setSimulationPaused(true);
            showNotification("All balls have stopped moving", "info");
          }, 0);
        }

        return updatedBalls;
      });

      // Continue animation if simulation is still running
      if (simulationStarted && !simulationPaused) {
        animationRef.current = requestAnimationFrame(updatePhysics);
      }
    };

    // Start the animation
    animationRef.current = requestAnimationFrame(updatePhysics);

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulationStarted, simulationPaused, simulationSpeed, showTrajectories]);

  // Updated handlePlaySimulation function
  const handlePlaySimulation = () => {
    if (simulationPaused) {
      // If balls have stopped, prep for a new shot instead of resuming physics
      const allStopped = ballPositions.every(
        ball => (ball.pocketed || (Math.abs(ball.vx) < 0.01 && Math.abs(ball.vy) < 0.01))
      );

      if (allStopped) {
        // Reset to allow a new shot
        setSimulationStarted(false);
        setSimulationPaused(false);

        // Clear any existing ball velocities
        setBallPositions(prevBalls => {
          return prevBalls.map(ball => {
            if (!ball.pocketed) {
              return {
                ...ball,
                vx: 0,
                vy: 0,
                trajectoryPoints: []
              };
            }
            return ball;
          });
        });

        // Show notification
        showNotification("Ready for a new shot", "info");

        // Make sure the shot line is hidden and the aim UI is reset
        setShowShotLine(false);
        setIsManualAiming(false);
        setActiveSuggestion(null);

        // Set the active tab back to the aiming tab to help the user
        setActiveTab(0);
      } else {
        // Resume the simulation
        setSimulationPaused(false);
        lastTimeRef.current = performance.now();

        // Restart the animation frame
        const updatePhysics = (timestamp) => {
          const delta = (timestamp - lastTimeRef.current) * (simulationSpeed * 0.06);
          lastTimeRef.current = timestamp;

          setSimulationStep(prevStep => prevStep + 1);

          // Update ball positions (simplified for brevity)
          setBallPositions(prevBalls => {
            // Create a copy of the current balls
            const updatedBalls = JSON.parse(JSON.stringify(prevBalls));

            // Physics updates would go here

            return updatedBalls;
          });

          // Continue animation if not paused
          if (simulationStarted && !simulationPaused) {
            animationRef.current = requestAnimationFrame(updatePhysics);
          }
        };

        // Start the animation loop
        animationRef.current = requestAnimationFrame(updatePhysics);
        showNotification("Simulation resumed", "info");
      }
    } else {
      // Start a new simulation
      startPoolSimulation();
    }
  };

  // Handle simulation reset
  const handleResetSimulation = () => {
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setSimulationStarted(false);
    setSimulationPaused(false);
    setSimulationStep(0);
    setPocketedBalls([]);
    setBallPositions(JSON.parse(JSON.stringify(initialBallPositions)));

    // Reset shot line and aiming state
    setShowShotLine(false);
    setActiveSuggestion(null);
    setIsManualAiming(false);

    showNotification("Simulation reset", "info");
  };

  // Try reprocessing the image
  const handleReprocessImage = () => {
    setLoading(true);
    setRetryCount(0);
    showNotification("Reprocessing image...", "info");
  };

  // Toggle debug info
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  // Handle simulation speed change
  const handleSpeedChange = (event, newValue) => {
    setSimulationSpeed(newValue);
  };

  // Toggle trajectory visibility
  const handleTrajectoryToggle = (event) => {
    setShowTrajectories(event.target.checked);
  };

  // Toggle help panel
  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  // Get active ball count (not pocketed)
  const activeBallCount = ballPositions.filter(ball => !ball.pocketed).length;

  // Get level icon based on player level
  const getLevelIcon = (level) => {
    switch (level) {
      case 'beginner':
        return <EmojiObjectsIcon fontSize="small" />;
      case 'expert':
        return <EmojiEventsIcon fontSize="small" />;
      default:
        return <SportsIcon fontSize="small" />;
    }
  }; return (
    <Box>
      <Header>
        <NavBar>
          <Logo>
            <SportsBilliards sx={{ mr: 1 }} />
            Pool Game Simulation
          </Logo>
          <NavLinks>
            <NavLink active={isActive('/home')} onClick={() => navigate('/home')}>Home</NavLink>
            <NavLink active={isActive('/upload')} onClick={() => navigate('/upload')}>Upload</NavLink>
            <NavLink active={isActive('/simulation')} onClick={() => navigate('/simulation')}>Simulation</NavLink>
            <NavLink active={isActive('/results')} onClick={() => navigate('/results')}>Results</NavLink>
            <NavLink active={isActive('/settings')} onClick={() => navigate('/settings')}>Settings</NavLink>
            <NavLink active={isActive('/help')} onClick={() => navigate('/help')}>Help</NavLink>
            <NavLink active={isActive('/about')} onClick={() => navigate('/about')}>About</NavLink>
          </NavLinks>
          <ActionButton onClick={() => navigate('/')}>Logout</ActionButton>
        </NavBar>
        <MainHeading variant="h1">
          Pool Game Simulation
        </MainHeading>
        <SubHeading variant="body1">
          Analyze and improve your pool game with realistic physics simulation
        </SubHeading>
      </Header>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 6 }}>
        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={5000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {notification.message}
          </Alert>
        </Snackbar>

        {/* Ball Status Indicators */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Chip
            icon={<SportsIcon />}
            label={`${playerLevel.charAt(0).toUpperCase() + playerLevel.slice(1)} Level`}
            color="primary"
            sx={{ px: 1 }}
          />

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {['white', 'red', 'yellow', 'black'].map(color => (
              ballCounts[color] > 0 && (
                <Chip
                  key={color}
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: color === 'white' ? '#ffffff' :
                          color === 'red' ? '#f44336' :
                            color === 'black' ? '#000000' :
                              '#ffeb3b',
                        color: color === 'white' || color === 'yellow' ? '#000' : '#fff'
                      }}
                    >
                      {ballCounts[color]}
                    </Avatar>
                  }
                  label={`${color.charAt(0).toUpperCase() + color.slice(1)}`}
                  variant="outlined"
                  size="small"
                />
              )
            ))}
          </Box>

          {pocketedBalls.length > 0 && (
            <Chip
              icon={<FlagIcon />}
              label={`${pocketedBalls.length} Pocketed`}
              color="success"
              variant="outlined"
            />
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Main Simulation Area */}
          <Grid item xs={12} md={8}>
            <SimulationCard>
              <SimulationCardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <SportsIcon sx={{ mr: 1, color: '#6930c3' }} />
                      Simulation View
                    </Typography>
                    <Box>
                      {!loading && !error && !simulationStarted && (
                        <Tooltip title="Reprocess image">
                          <IconButton
                            size="small"
                            onClick={handleReprocessImage}
                            sx={{ color: '#6930c3' }}
                          >
                            <CameraAltIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={showHelp ? "Hide help" : "Show help"}>
                        <IconButton
                          size="small"
                          onClick={toggleHelp}
                          sx={{ color: showHelp ? '#f44336' : '#6930c3' }}
                        >
                          <HelpOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                }
              />
              <CardContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Help Panel - Collapsible */}
                <Collapse in={showHelp} timeout="auto">
                  <Box sx={{ p: 2, bgcolor: alpha('#6930c3', 0.05), borderBottom: `1px solid ${alpha('#6930c3', 0.1)}` }}>
                    <Typography variant="subtitle2" gutterBottom>Quick Help:</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PlayArrowIcon fontSize="small" sx={{ mr: 1, color: '#6930c3' }} />
                          <Typography variant="body2">Press <b>Start Simulation</b> to begin playing</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AimIcon fontSize="small" sx={{ mr: 1, color: '#6930c3' }} />
                          <Typography variant="body2">Click and drag around the white ball to aim</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TrackChangesIcon fontSize="small" sx={{ mr: 1, color: '#6930c3' }} />
                          <Typography variant="body2">Check <b>Shot Suggestions</b> for optimal shots</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SaveIcon fontSize="small" sx={{ mr: 1, color: '#4caf50' }} />
                          <Typography variant="body2">Save your simulation to view in Results later</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>

                <SimulationView>
                  {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <CircularProgress sx={{ mb: 2, color: '#6930c3' }} />
                      <Typography>Processing your image...</Typography>
                    </Box>
                  ) : error ? (
                    <Box sx={{ textAlign: 'center', p: 3 }}>
                      <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
                      <ActionButton onClick={handleReprocessImage}>
                        Try Again
                      </ActionButton>
                    </Box>
                  ) : processedImage ? (
                    <div
                      ref={containerRef}
                      style={{
                        position: 'relative',
                        display: 'block',
                        width: '100%',
                        height: '400px',
                        overflow: 'visible' // Changed from 'hidden' to 'visible'
                      }}
                    >
                      <img
                        ref={imageRef}
                        src={processedImage}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        alt="Pool Table"
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxWidth: imageSize.width,
                          maxHeight: imageSize.height
                        }}
                      />

                      {/* Render pool balls */}
                      {ballPositions.map((ball, index) => {
                        if (ball.pocketed) return null;

                        // Scale coordinates to match the rendered image size
                        const scaleX = imageSize.width / TABLE_WIDTH;
                        const scaleY = imageSize.height / TABLE_HEIGHT;
                        const adjustX = ball.x * scaleX;
                        const adjustY = ball.y * scaleY;
                        const shadowColor = 'rgba(0,0,0,0.3)';

                        return (
                          <div
                            key={`ball-${index}`}
                            style={{
                              position: 'absolute',
                              top: `${adjustY}px`,
                              left: `${adjustX}px`,
                              width: `${BALL_RADIUS * 2 * scaleX}px`,
                              height: `${BALL_RADIUS * 2 * scaleY}px`,
                              backgroundColor: ball.color === 'white' ? '#fff' :
                                ball.color === 'black' ? '#000' :
                                  ball.color === 'red' ? '#ff0000' :
                                    '#ffcc00',
                              borderRadius: '50%',
                              transform: 'translate(-50%, -50%)',
                              zIndex: 50,
                              boxShadow: `0px 3px 6px ${shadowColor}, inset 0px -2px 4px rgba(0,0,0,0.2)`,
                              border: ball.color === 'white' ? '1px solid #ddd' : 'none',
                              transition: simulationStarted ? 'none' : 'left 0.05s linear, top 0.05s linear',
                            }}
                          >
                            {(ball.color === 'red' || ball.color === 'yellow' || ball.color === 'black') && ball.number && (
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '50%',
                                height: '50%',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: `${Math.max(8 * scaleX, 8)}px`,
                                fontWeight: 'bold',
                                color: ball.color === 'yellow' ? 'black' :
                                  ball.color === 'black' ? 'white' : 'red'
                              }}>
                                {ball.number}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Pool Cue Visualization - Enhanced */}
                      {showShotLine && !simulationStarted && (() => {
                        const cueBall = ballPositions.find(ball => ball.color === "white" && !ball.pocketed);
                        if (!cueBall) return null;

                        const scaleX = imageSize.width / TABLE_WIDTH;
                        const scaleY = imageSize.height / TABLE_HEIGHT;

                        // Calculate cue start and end positions based on angle
                        const angle = aimParameters.angle;
                        const radians = angle * (Math.PI / 180);

                        // The cue ball position
                        const cueBallX = cueBall.x * scaleX;
                        const cueBallY = cueBall.y * scaleY;

                        // NEW: Calculate extended cue length that always goes beyond viewport
                        const maxDimension = Math.max(imageSize.width, imageSize.height) * 1.5;
                        const cueLength = maxDimension; // Make cue long enough to always extend beyond the viewport
                        const aimLength = 180; // Length of the aiming line

                        // Position the cue behind the ball (opposite direction of shot)
                        const cueEndX = cueBallX - Math.cos(radians) * cueLength;
                        const cueEndY = cueBallY - Math.sin(radians) * cueLength;

                        // Calculate the aiming line end point (in front of the ball)
                        const aimEndX = cueBallX + Math.cos(radians) * aimLength;
                        const aimEndY = cueBallY + Math.sin(radians) * aimLength;

                        // Calculate thickness based on power
                        const cueThickness = 6 + (aimParameters.power * 3);

                        return (
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              pointerEvents: 'none',
                              zIndex: 25, // Above balls
                              overflow: 'visible', // NEW: Allow the cue to extend beyond the container
                            }}
                          >
                            <svg
                              width="100%"
                              height="100%"
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                overflow: 'visible' // NEW: Enable overflow to show cue outside the SVG bounds
                              }}
                            >
                              <defs>
                                <linearGradient id="cueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" style={{ stopColor: '#8B4513' }} />
                                  <stop offset="30%" style={{ stopColor: '#A0522D' }} />
                                  <stop offset="90%" style={{ stopColor: '#CD853F' }} />
                                  <stop offset="100%" style={{ stopColor: '#DEB887' }} />
                                </linearGradient>
                                <filter id="cueShadow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
                                </filter>
                              </defs>

                              {/* Aiming line */}
                              <line
                                x1={cueBallX}
                                y1={cueBallY}
                                x2={aimEndX}
                                y2={aimEndY}
                                stroke={isManualAiming ? "#ff9f1c" : "#6930c3"}
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                strokeOpacity="0.8"
                              />

                              {/* Cue ball highlight */}
                              <circle
                                cx={cueBallX}
                                cy={cueBallY}
                                r={BALL_RADIUS * scaleX + 2}
                                fill="none"
                                stroke="#ff9f1c"
                                strokeWidth="2"
                                strokeOpacity="0.8"
                              />

                              {/* Pool cue */}
                              <line
                                x1={cueBallX}
                                y1={cueBallY}
                                x2={cueEndX}
                                y2={cueEndY}
                                stroke="url(#cueGradient)"
                                strokeWidth={cueThickness}
                                strokeLinecap="round"
                                filter="url(#cueShadow)"
                              />

                              {/* Cue tip */}
                              <circle
                                cx={cueBallX - Math.cos(radians) * (BALL_RADIUS * scaleX + 2)}
                                cy={cueBallY - Math.sin(radians) * (BALL_RADIUS * scaleY + 2)}
                                r={cueThickness / 1.5}
                                fill="#333"
                                stroke="#555"
                                strokeWidth="1"
                              />

                              {/* Show object ball and pocket if suggestion is active */}
                              {activeSuggestion && (
                                <>
                                  {/* Path from object ball to pocket */}
                                  <line
                                    x1={activeSuggestion.objectBall.x * scaleX}
                                    y1={activeSuggestion.objectBall.y * scaleY}
                                    x2={activeSuggestion.pocket.x * scaleX}
                                    y2={activeSuggestion.pocket.y * scaleY}
                                    stroke="#6930c3"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                    strokeOpacity="0.7"
                                  />

                                  {/* Target circles */}
                                  <circle
                                    cx={activeSuggestion.objectBall.x * scaleX}
                                    cy={activeSuggestion.objectBall.y * scaleY}
                                    r="10"
                                    fill="none"
                                    stroke="#6930c3"
                                    strokeWidth="2"
                                  />

                                  <circle
                                    cx={activeSuggestion.pocket.x * scaleX}
                                    cy={activeSuggestion.pocket.y * scaleY}
                                    r="10"
                                    fill="none"
                                    stroke="#ff9f1c"
                                    strokeWidth="2"
                                  />
                                </>
                              )}
                            </svg>
                          </div>
                        );
                      })()}

                      {/* Render ball trajectories */}
                      {showTrajectories && simulationStarted && ballPositions.map((ball, index) => {
                        if (!ball.trajectoryPoints || ball.trajectoryPoints.length < 2) return null;

                        const scaleX = imageSize.width / TABLE_WIDTH;
                        const scaleY = imageSize.height / TABLE_HEIGHT;
                        let pathData = `M ${ball.trajectoryPoints[0].x * scaleX} ${ball.trajectoryPoints[0].y * scaleY}`;

                        ball.trajectoryPoints.forEach((point, i) => {
                          if (i > 0) {
                            pathData += ` L ${point.x * scaleX} ${point.y * scaleY}`;
                          }
                        });

                        return (
                          <svg
                            key={`trajectory-${index}`}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              pointerEvents: 'none',
                              zIndex: 5,
                            }} >
                            <path
                              d={pathData}
                              stroke={ball.color === 'white' ? '#888' :
                                ball.color === 'black' ? '#555' :
                                  ball.color === 'red' ? '#ff6666' :
                                    '#ffdd66'}
                              strokeWidth="2"
                              fill="none"
                              strokeDasharray="3,3"
                              opacity="0.7"
                            />
                          </svg>
                        );
                      })}

                      {/* Interactive Controls */}
                      {useDirectControls && (
                        <InteractivePoolControls
                          ballPositions={ballPositions}
                          setAimParameters={setAimParameters}
                          aimParameters={aimParameters}
                          setShowShotLine={setShowShotLine}
                          showShotLine={showShotLine}
                          imageSize={imageSize}
                          containerRef={containerRef}
                          onShoot={handleShoot}
                          isSimulationStarted={simulationStarted}
                          isSimulationPaused={simulationPaused}
                          setIsManualAiming={setIsManualAiming}
                          setActiveSuggestion={setActiveSuggestion}
                        />
                      )}

                      {/* Direct Controls Guide */}
                      {showDirectControlsGuide && !simulationStarted && (
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          zIndex: 300,
                          pointerEvents: 'none',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          <Paper sx={{
                            p: 3,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                            maxWidth: '80%',
                            position: 'relative',
                          }}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#6930c3', fontWeight: 'bold' }}>
                              New Direct Controls Enabled!
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#6930c3' }}>1</Avatar>
                                <Typography variant="body1">
                                  Click and drag around the white ball to aim
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#e63946' }}>2</Avatar>
                                <Typography variant="body1">
                                  Adjust shot power using the vertical meter on the left
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#4caf50' }}>3</Avatar>
                                <Typography variant="body1">
                                  Click "Take Shot" to execute your play
                                </Typography>
                              </Box>
                            </Box>

                            <IconButton
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                color: '#6930c3',
                                pointerEvents: 'auto'
                              }}
                              onClick={() => {
                                setShowDirectControlsGuide(false);
                                localStorage.setItem('directControlsGuideShown', 'true');
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Paper>
                        </Box>
                      )}

                      {/* Debug elements - only visible when debug mode is enabled */}
                      {showDebugInfo && (
                        <>
                          {/* Pocket positions */}
                          {POCKET_POSITIONS.map((pocket, index) => {
                            const scaleX = imageSize.width / TABLE_WIDTH;
                            const scaleY = imageSize.height / TABLE_HEIGHT;

                            return (
                              <div
                                key={`pocket-${index}`}
                                style={{
                                  position: 'absolute',
                                  top: `${pocket.y * scaleY}px`,
                                  left: `${pocket.x * scaleX}px`,
                                  width: `${POCKET_RADIUS * 2 * scaleX}px`,
                                  height: `${POCKET_RADIUS * 2 * scaleY}px`,
                                  border: '1px dashed red',
                                  borderRadius: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  zIndex: 1,
                                  pointerEvents: 'none',
                                }}
                              />
                            );
                          })}

                          {/* Table bounds outline */}
                          {tableBounds && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: '2px dashed #6930c3',
                                zIndex: 1,
                                pointerEvents: 'none',
                              }}
                            />
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <Typography color="textSecondary">
                      No processed image available
                    </Typography>
                  )}
                </SimulationView>

                {/* Simulation controls toolbar */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderTop: '1px solid rgba(0,0,0,0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      color={simulationPaused ? "success" : simulationStarted ? "warning" : "primary"}
                      startIcon={
                        simulationStarted ?
                          (simulationPaused ? <PlayArrowIcon /> : <PauseIcon />) :
                          <PlayArrowIcon />
                      }
                      onClick={handlePlaySimulation}
                      disabled={loading || error || !processedImage}
                      sx={{
                        borderRadius: 4,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        mr: 1
                      }}
                    >
                      {simulationStarted ?
                        (simulationPaused ? 'Resume' : 'Pause') :
                        'Start Simulation'}
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<RestartAltIcon />}
                      onClick={handleResetSimulation}
                      disabled={loading || error || !processedImage || (!simulationStarted && !simulationPaused)}
                      sx={{ borderRadius: 4, mr: 1 }}
                    >
                      Reset
                    </Button>
                  </Box>

                  <Tooltip title="Toggle ball trajectories">
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={showTrajectories}
                          onChange={handleTrajectoryToggle}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <VisibilityIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                          Trajectories
                        </Typography>
                      }
                      sx={{ ml: 0 }}
                    />
                  </Tooltip>
                </Box>
              </CardContent>
            </SimulationCard>
          </Grid>

          {/* Controls and Information Area */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              {/* Main Controls Card */}
              <Grid item xs={12}>
                <ControlsCard>
                  <CardContent sx={{ p: 0 }}>
                    {/* Tab navigation for controls */}
                    <StyledTabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                      <StyledTab
                        label="Aim Shot"
                        icon={<AimIcon />}
                        disabled={simulationStarted && !simulationPaused}
                      />
                      <StyledTab
                        label="Ball Info"
                        icon={<SportsIcon />}
                      />
                      <StyledTab
                        label="Settings"
                        icon={<SpeedIcon />}
                      />
                    </StyledTabs>

                    {/* Tab 1: AimAssistant - Now only shown if not using direct controls */}
                    <TabPanel value={activeTab} index={0}>
                      {!useDirectControls ? (
                        <AimAssistant
                          ballPositions={ballPositions}
                          playerLevel={playerLevel}
                          onAimChange={handleAimChange}
                          onShoot={handleShoot}
                          isSimulationStarted={simulationStarted}
                          activeSuggestion={activeSuggestion}
                        />
                      ) : (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="subtitle1" sx={{ mb: 2 }}>Direct Controls Enabled</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Click and drag around the white ball to aim. Use the power meter on the left to adjust shot power.
                          </Typography>
                          <Button
                            variant="outlined"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={() => setUseDirectControls(false)}
                          >
                            Switch to Classic Controls
                          </Button>
                        </Box>
                      )}
                    </TabPanel>

                    {/* Tab 2: Ball Information */}
                    <TabPanel value={activeTab} index={1}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <SportsIcon sx={{ mr: 1, color: '#6930c3', fontSize: '1.1rem' }} />
                          Ball Status
                        </Typography>

                        <Box sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                          justifyContent: 'center',
                          mb: 3,
                          mt: 2
                        }}>
                          {['white', 'red', 'yellow', 'black'].map(color => {
                            const active = ballPositions.filter(ball => ball.color === color && !ball.pocketed).length;
                            const pocketed = ballPositions.filter(ball => ball.color === color && ball.pocketed).length;
                            const total = active + pocketed;

                            if (total === 0) return null;

                            return (
                              <Paper
                                key={color}
                                sx={{
                                  p: 1.5,
                                  flex: '1 0 45%',
                                  minWidth: '120px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  borderRadius: 2,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                }}
                              >
                                <BallVisualization color={color}>
                                  {(color === 'red' || color === 'yellow') && "1"}
                                </BallVisualization>
                                <Typography variant="subtitle2" sx={{ mt: 1, textTransform: 'capitalize' }}>
                                  {color} Balls
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {active} active, {pocketed} pocketed
                                </Typography>
                              </Paper>
                            );
                          })}
                        </Box>

                        {/* Pocketed balls section */}
                        {pocketedBalls.length > 0 && (
                          <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" gutterBottom>
                              Recently Pocketed:
                            </Typography>
                            <Box sx={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 1,
                              justifyContent: 'center',
                              my: 1
                            }}>
                              {pocketedBalls.slice(-8).map((ball, idx) => (
                                <BallVisualization key={idx} color={ball.color}>
                                  {(ball.color === 'red' || ball.color === 'yellow') && ball.number && ball.number}
                                </BallVisualization>
                              ))}
                            </Box>
                          </>
                        )}

                        {/* Debug toggle */}
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                          <Button
                            variant="text"
                            size="small"
                            startIcon={<BugReportIcon />}
                            onClick={toggleDebugInfo}
                            sx={{ color: showDebugInfo ? '#f44336' : '#6930c3' }}
                          >
                            {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
                          </Button>
                        </Box>

                        {/* Debug information section */}
                        {showDebugInfo && (
                          <Paper sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: alpha('#6930c3', 0.03),
                            border: `1px solid ${alpha('#6930c3', 0.1)}`,
                            borderRadius: 2
                          }}>
                            <Typography variant="subtitle2" gutterBottom>Debug Info:</Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              Player Level: {playerLevel}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              Balls: {ballPositions.length} total, {activeBallCount} active
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              Simulation Step: {simulationStep}
                            </Typography>
                            {simulationParams && (
                              <Typography variant="body2">
                                Shot Precision: {simulationParams.shotPrecision.toFixed(2)}
                              </Typography>
                            )}
                          </Paper>
                        )}
                      </Box>
                    </TabPanel>

                    {/* Tab 3: Simulation Settings */}
                    <TabPanel value={activeTab} index={2}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <SpeedIcon sx={{ mr: 1, color: '#6930c3', fontSize: '1.1rem' }} />
                          Simulation Settings
                        </Typography>

                        {/* Simulation speed control */}
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" gutterBottom>
                            Simulation Speed: {simulationSpeed.toFixed(1)}x
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ minWidth: 40 }}>Slow</Typography>
                            <Slider
                              value={simulationSpeed}
                              onChange={handleSpeedChange}
                              step={0.1}
                              min={0.1}
                              max={3}
                              marks
                              sx={{ mx: 2 }}
                            />
                            <Typography variant="caption" sx={{ minWidth: 40 }}>Fast</Typography>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Other simulation options */}
                        <FormControlLabel
                          control={
                            <Switch
                              checked={showTrajectories}
                              onChange={handleTrajectoryToggle}
                              color="primary"
                            />
                          }
                          label="Show Ball Trajectories"
                          sx={{ mb: 1.5, display: 'block' }}
                        />

                        <FormControlLabel
                          control={
                            <Switch
                              checked={useDirectControls}
                              onChange={(e) => setUseDirectControls(e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Use Direct On-Table Controls"
                          sx={{ mb: 1.5, display: 'block' }}
                        />

                        {/* Save button */}
                        <SaveButton
                          fullWidth
                          startIcon={<SaveIcon />}
                          onClick={handleOpenSaveDialog}
                          disabled={loading || !processedImage || (!simulationStarted && !simulationPaused && pocketedBalls.length === 0)}
                          sx={{ mt: 2 }}
                        >
                          Save Simulation
                        </SaveButton>
                      </Box>
                    </TabPanel>
                  </CardContent>
                </ControlsCard>
              </Grid>

              {/* Shot Suggestions Card - Only show when not actively simulating */}
              {(!simulationStarted || simulationPaused) && (
                <Grid item xs={12}>
                  <ControlsCard sx={{ maxHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <TrackChangesIcon sx={{ mr: 1, color: '#6930c3' }} />
                          Shot Suggestions
                        </Typography>
                      </Box>

                      <Box sx={{
                        flex: 1,
                        overflowY: 'auto',
                        px: 2,
                        py: 1.5,
                        '&::-webkit-scrollbar': {
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: '#f1f1f1',
                          borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#c1c1c1',
                          borderRadius: '10px',
                        },
                      }}>
                        <ShotSuggestion
                          ballPositions={ballPositions}
                          playerLevel={playerLevel}
                          tableDimensions={{ width: TABLE_WIDTH, height: TABLE_HEIGHT }}
                          onApplySuggestion={handleApplySuggestion}
                          isSimulationStarted={simulationStarted && !simulationPaused}
                        />
                      </Box>
                    </CardContent>
                  </ControlsCard>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Save Simulation Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{
          bgcolor: alpha('#6930c3', 0.05),
          borderBottom: `1px solid ${alpha('#6930c3', 0.1)}`
        }}>
          Save Simulation Results
        </DialogTitle>
        <DialogContent sx={{ pt: 3, minWidth: '400px' }}>
          <DialogContentText sx={{ mb: 2 }}>
            Enter a name for this simulation to help you identify it later.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Simulation Name"
            type="text"
            fullWidth
            variant="outlined"
            value={simulationName}
            onChange={(e) => setSimulationName(e.target.value)}
            disabled={isSaving}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setSaveDialogOpen(false)}
            disabled={isSaving}
            sx={{ borderRadius: 4 }}
          >
            Cancel
          </Button>
          <SaveButton
            onClick={handleSaveSimulation}
            disabled={isSaving || !simulationName.trim()}
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ borderRadius: 4 }}
          >
            {isSaving ? 'Saving...' : 'Save Results'}
          </SaveButton>
        </DialogActions>
      </Dialog>

      {/* Standalone Power Control - always visible backup */}
      {useDirectControls && !simulationStarted && (
        <StandalonePowerControl
          onPowerChange={(newPower) => setAimParameters(prev => ({ ...prev, power: newPower }))}
          initialPower={aimParameters.power}
          disabled={simulationStarted && !simulationPaused}
        />
      )}
    </Box>
  );
}