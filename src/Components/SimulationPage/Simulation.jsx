import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import ShotSuggestion from './ShotSuggestion';
import AimAssistant from './AimAssistant';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// Icons
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BugReportIcon from '@mui/icons-material/BugReport';
import SpeedIcon from '@mui/icons-material/Speed';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import InfoIcon from '@mui/icons-material/Info';
import SportsIcon from '@mui/icons-material/Sports';
import AimIcon from '@mui/icons-material/GpsFixed';

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

// Styled components
const Header = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #5e60ce 0%, #6930c3 100%)',
  borderRadius: '0 0 30% 0',
  padding: theme.spacing(2, 4),
  color: 'white',
  position: 'relative',
  minHeight: '180px',
  display: 'flex',
  flexDirection: 'column',
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
  fontSize: '2.5rem',
  fontWeight: 'bold',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(1),
}));

const SubHeading = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  opacity: 0.8,
  marginBottom: theme.spacing(3),
  maxWidth: '500px',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: '#6930c3',
  marginBottom: theme.spacing(1),
}));

const CustomTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 'auto',
  '& .MuiTab-root': {
    minHeight: 'auto',
    padding: theme.spacing(1, 2),
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
}));

const CustomTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.85rem',
}));

// Physics constants for the simulation
const FRICTION = 0.98;
const RESTITUTION = 0.9; // Bouncing off walls
const TABLE_WIDTH = 800;
const TABLE_HEIGHT = 400;
const BALL_RADIUS = 14;
const POCKET_RADIUS = 25;
const POCKET_POSITIONS = [
  { x: 25, y: 25 },               // Top left
  { x: TABLE_WIDTH / 2, y: 20 },  // Top middle
  { x: TABLE_WIDTH - 25, y: 25 }, // Top right
  { x: 25, y: TABLE_HEIGHT - 25 },               // Bottom left
  { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - 20 },  // Bottom middle
  { x: TABLE_WIDTH - 25, y: TABLE_HEIGHT - 25 }, // Bottom right
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
  for (const pocket of POCKET_POSITIONS) {
    const dx = ball.x - pocket.x;
    const dy = ball.y - pocket.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < POCKET_RADIUS) {
      return true;
    }
  }
  return false;
}

export default function EnhancedSimulationPage() {
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

  // New state for shot suggestions and aiming
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [showShotLine, setShowShotLine] = useState(false);
  const [aimParameters, setAimParameters] = useState({ angle: 45, power: 0.5 });
  const [isManualAiming, setIsManualAiming] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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
          id: `ball_red_${i+1}`,
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
          id: `ball_yellow_${i+1}`,
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

    // Get player level from localStorage
    const storedLevel = localStorage.getItem('playerLevel') || 'intermediate';
    setPlayerLevel(storedLevel);

    fetchAndProcessImage();

    // Cleanup animation frame on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [retryCount]);

  // Handle image load
  const handleImageLoad = () => {
    if (imageRef.current && containerRef.current) {
      // Get the rendered dimensions
      const renderedWidth = imageRef.current.clientWidth;
      const renderedHeight = imageRef.current.clientHeight;
      
      // Log dimensions for debugging
      console.log("📏 Image natural dimensions:", imageRef.current.naturalWidth, imageRef.current.naturalHeight);
      console.log("📏 Container dimensions:", containerRef.current.clientWidth, containerRef.current.clientHeight);
      console.log("📏 Rendered image dimensions:", renderedWidth, renderedHeight);

      // Store the rendered image size
      setImageSize({
        width: containerRef.current.clientWidth,
        height: renderedHeight
      });

      console.log("📏 Image loaded - Set Dimensions:", containerRef.current.clientWidth, renderedHeight);
    }
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
    setShowShotLine(true);
    setIsManualAiming(true);

    // Cancel any active suggestion when manually aiming
    if (activeSuggestion) {
      setActiveSuggestion(null);
    }
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
    if (!simulationStarted || simulationPaused) return;

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

          // Update position - THIS ACTUALLY MOVES THE BALLS VISUALLY
          ball.x += ball.vx * delta;
          ball.y += ball.vy * delta;

          // Apply friction
          ball.vx *= FRICTION;
          ball.vy *= FRICTION;

          // Stop very slow balls
          if (Math.abs(ball.vx) < 0.01) ball.vx = 0;
          if (Math.abs(ball.vy) < 0.01) ball.vy = 0;

          // Check for wall collisions
          // Left wall
          if (ball.x < BALL_RADIUS) {
            ball.x = BALL_RADIUS;
            ball.vx = -ball.vx * RESTITUTION;
          }
          // Right wall
          if (ball.x > TABLE_WIDTH - BALL_RADIUS) {
            ball.x = TABLE_WIDTH - BALL_RADIUS;
            ball.vx = -ball.vx * RESTITUTION;
          }
          // Top wall
          if (ball.y < BALL_RADIUS) {
            ball.y = BALL_RADIUS;
            ball.vy = -ball.vy * RESTITUTION;
          }
          // Bottom wall
          if (ball.y > TABLE_HEIGHT - BALL_RADIUS) {
            ball.y = TABLE_HEIGHT - BALL_RADIUS;
            ball.vy = -ball.vy * RESTITUTION;
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
          setSimulationPaused(true);
          showNotification("All balls have stopped moving", "info");
          console.log("🛑 Simulation stopped - all balls at rest");
        }

        return updatedBalls;
      });

      // Continue animation if simulation is still running
      animationRef.current = requestAnimationFrame(updatePhysics);
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

  // Handle simulation start
  const handlePlaySimulation = () => {
    if (simulationPaused) {
      // Resume the simulation
      setSimulationPaused(false);
      lastTimeRef.current = performance.now();
      showNotification("Simulation resumed", "info");
    } else {
      // Start a new simulation
      startPoolSimulation();
    }
    console.log("🎮 Simulation started");
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
    setShowShotLine(false);
    setActiveSuggestion(null);
    setIsManualAiming(false);
    showNotification("Simulation reset", "info");
    console.log("🔄 Simulation reset");
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

  // Get active ball count (not pocketed)
  const activeBallCount = ballPositions.filter(ball => !ball.pocketed).length;

  return (
    <Box>
      <Header>
        <NavBar>
          <Logo>
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
          Your pool table image has been processed and is ready for simulation
        </SubHeading>
      </Header>

      <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={5000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{
              height: '100%',
              borderRadius: 4,
              bgcolor: '#f8f9fa',
              display: 'flex',
              flexDirection: 'column',
              p: 3
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Simulation View
                </Typography>
                {!loading && !error && (
                  <Button
                    size="small"
                    startIcon={<CameraAltIcon />}
                    onClick={handleReprocessImage}
                    sx={{ color: '#6930c3' }}
                  >
                    Reprocess Image
                  </Button>
                )}
              </Box>
              <Box sx={{
                flex: 1,
                bgcolor: '#e9ecef',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                minHeight: 500,
                position: 'relative',
                overflow: 'visible'
              }}>
                {loading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress sx={{ mb: 2, color: '#6930c3' }} />
                    <Typography>Processing your image...</Typography>
                  </Box>
                ) : error ? (
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
                    <ActionButton onClick={handleReprocessImage} color="#6930c3">
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
                      height: '400px', // Fixed height matching TABLE_HEIGHT
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      ref={imageRef}
                      src={processedImage}
                      alt="Processed Pool Table"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        opacity: simulationStarted ? 1 : 0.8
                      }}
                      onLoad={handleImageLoad}
                      onError={(e) => {
                        console.error("❌ Image failed to load:", e.target.src);
                        showNotification("Failed to load processed image", "error");
                      }}
                    />

                    {/* Render ball positions during simulation */}
                    {ballPositions.map((ball, index) => {
                      if (ball.pocketed) return null;

                      // Scale coordinates to match the rendered image size
                      const scaleX = imageSize.width / TABLE_WIDTH;
                      const scaleY = imageSize.height / TABLE_HEIGHT;

                      // These calculations position the balls correctly
                      const adjustX = ball.x * scaleX;
                      const adjustY = ball.y * scaleY;

                      // Ball shadow for better visuals
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
                            zIndex: 50, // Higher zIndex to ensure balls appear above the table
                            boxShadow: `0px 3px 6px ${shadowColor}, inset 0px -2px 4px rgba(0,0,0,0.2)`,
                            border: ball.color === 'white' ? '1px solid #ddd' : 'none',
                            transition: simulationStarted ? 'none' : 'left 0.05s linear, top 0.05s linear', // Remove transition during simulation for more accurate movement
                          }}
                        >
                          {(ball.color === 'red' || ball.color === 'yellow') && ball.number && (
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
                              color: ball.color === 'yellow' ? 'black' : 'red'
                            }}>
                              {ball.number}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Shot aiming line */}
                    {showShotLine && !simulationStarted && (
                      <svg
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          pointerEvents: 'none',
                          zIndex: 15,
                        }}
                      >
                        {/* Find the white ball for aiming */}
                        {(() => {
                          const cueBall = ballPositions.find(ball => ball.color === "white" && !ball.pocketed);
                          if (!cueBall) return null;

                          // Calculate scale factors
                          const scaleX = imageSize.width / TABLE_WIDTH;
                          const scaleY = imageSize.height / TABLE_HEIGHT;

                          // Calculate aim line end point
                          const aimLength = 200; // Length of aim line
                          const angle = aimParameters.angle;
                          const radians = angle * (Math.PI / 180);
                          const endX = cueBall.x + Math.cos(radians) * aimLength;
                          const endY = cueBall.y + Math.sin(radians) * aimLength;

                          return (
                            <>
                              {/* Cue line */}
                              <line
                                x1={cueBall.x * scaleX}
                                y1={cueBall.y * scaleY}
                                x2={endX * scaleX}
                                y2={endY * scaleY}
                                stroke={isManualAiming ? "#ff9f1c" : "#6930c3"}
                                strokeWidth="2"
                                strokeDasharray="5,5"
                              />

                              {/* Cue ball highlight */}
                              <circle
                                cx={cueBall.x * scaleX}
                                cy={cueBall.y * scaleY}
                                r={BALL_RADIUS * scaleX}
                                fill="none"
                                stroke="#ff9f1c"
                                strokeWidth="2"
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
                            </>
                          );
                        })()}
                      </svg>
                    )}

                    {/* Render ball trajectories if enabled */}
                    {showTrajectories && simulationStarted && ballPositions.map((ball, index) => {
                      if (!ball.trajectoryPoints || ball.trajectoryPoints.length < 2) return null;

                      const scaleX = imageSize.width / TABLE_WIDTH;
                      const scaleY = imageSize.height / TABLE_HEIGHT;

                      // Create SVG path from trajectory points
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
                          }}
                        >
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

                    {/* Render pocket positions for debugging */}
                    {showDebugInfo && POCKET_POSITIONS.map((pocket, index) => {
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

                    {/* Add table bounds outline in debug mode */}
                    {showDebugInfo && tableBounds && (
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
                  </div>
                ) : (
                  <Typography color="textSecondary">
                    No processed image available
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            {/* Simulation Controls Card */}
            <Card sx={{
              borderRadius: 4,
              bgcolor: '#f8f9fa',
              p: 2,
              mb: 2
            }}>
              <Typography variant="h6" gutterBottom>
                Simulation Controls
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <ActionButton
                      fullWidth
                      sx={{ mb: 1 }}
                      startIcon={<PlayArrowIcon />}
                      disabled={loading || error || !processedImage || (simulationStarted && !simulationPaused)}
                      onClick={handlePlaySimulation}
                      color={simulationPaused ? "#4a9c59" : undefined}
                    >
                      {simulationStarted ?
                        (simulationPaused ? 'Resume' : 'Running...') :
                        'Start Simulation'}
                    </ActionButton>
                  </Grid>
                  <Grid item xs={6}>
                    <ActionButton
                      fullWidth
                      size="small"
                      color="#4a5568"
                      startIcon={<RestartAltIcon />}
                      disabled={loading || error || !processedImage || (!simulationStarted && !simulationPaused)}
                      onClick={handleResetSimulation}
                    >
                      Reset
                    </ActionButton>
                  </Grid>
                  <Grid item xs={6}>
                    <ActionButton
                      fullWidth
                      size="small"
                      color="#5e60ce"
                      onClick={() => navigate('/results')}
                      disabled={loading || error || !processedImage}
                    >
                      Results
                    </ActionButton>
                  </Grid>
                </Grid>

                {/* Simulation speed control - more compact */}
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <SpeedIcon sx={{ color: '#6930c3', mr: 1, fontSize: '1rem' }} />
                  <Typography variant="body2" sx={{ mr: 2, minWidth: 90, fontSize: '0.85rem' }}>
                    Speed: {simulationSpeed}x
                  </Typography>
                  <Slider
                    value={simulationSpeed}
                    onChange={handleSpeedChange}
                    aria-labelledby="simulation-speed-slider"
                    min={0.1}
                    max={3}
                    step={0.1}
                    size="small"
                    sx={{
                      color: '#6930c3',
                      '& .MuiSlider-thumb': {
                        width: 14,
                        height: 14,
                      },
                    }}
                  />
                </Box>

                {/* Trajectory toggle - more compact */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={showTrajectories}
                      onChange={handleTrajectoryToggle}
                      color="secondary"
                      size="small"
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Show Trajectories</Typography>}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Card>

            {/* Tabbed Content for Aim Assistant and Ball Info */}
            {!simulationStarted && (
              <Card sx={{
                borderRadius: 4,
                bgcolor: '#f8f9fa',
                p: 2,
                mb: 2
              }}>
                <CustomTabs value={activeTab} onChange={handleTabChange} centered>
                  <CustomTab label={<Box sx={{ display: 'flex', alignItems: 'center' }}><AimIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} /> Aim Shot</Box>} />
                  <CustomTab label={<Box sx={{ display: 'flex', alignItems: 'center' }}><SportsIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} /> Ball Info</Box>} />
                </CustomTabs>

                {/* Tab 1: AimAssistant */}
                <TabPanel value={activeTab} index={0}>
                  <AimAssistant
                    ballPositions={ballPositions}
                    playerLevel={playerLevel}
                    onAimChange={handleAimChange}
                    onShoot={handleShoot}
                    isSimulationStarted={simulationStarted}
                    activeSuggestion={activeSuggestion}
                  />
                </TabPanel>

                {/* Tab 2: Ball Information */}
                <TabPanel value={activeTab} index={1}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {loading ? 'Detecting balls...' :
                      error ? 'Ball detection failed' :
                        `${activeBallCount} active ball(s), ${pocketedBalls.length} pocketed`}
                  </Typography>

                  {!loading && !error && ballPositions.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {['white', 'black', 'red', 'yellow'].map(color => {
                        const total = ballPositions.filter(ball => ball.color === color).length;
                        const active = ballPositions.filter(ball => ball.color === color && !ball.pocketed).length;
                        const pocketed = total - active;

                        if (total > 0) {
                          return (
                            <Box key={color} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: color === 'white' ? '#fff' :
                                    color === 'black' ? '#000' :
                                      color === 'red' ? '#ff0000' :
                                        '#ffcc00',
                                  border: '1px solid #888',
                                  mr: 1
                                }}
                              />
                              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                {`${color.charAt(0).toUpperCase() + color.slice(1)}: ${active} active${pocketed > 0 ? `, ${pocketed} pocketed` : ''}`}
                              </Typography>
                            </Box>
                          );
                        }
                        return null;
                      })}
                    </Box>
                  )}

                  {/* Pocketed balls list */}
                  {pocketedBalls.length > 0 && (
                    <Box sx={{ mt: 1.5, p: 1, bgcolor: '#f0f0f0', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, fontSize: '0.85rem' }}>
                        Recently Pocketed:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {pocketedBalls.slice(-5).map((ball, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: ball.color === 'white' ? '#fff' :
                                ball.color === 'black' ? '#000' :
                                  ball.color === 'red' ? '#ff0000' :
                                    '#ffcc00',
                              border: '1px solid #888',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0px 1px 3px rgba(0,0,0,0.2)'
                            }}
                          >
                            {(ball.color === 'red' || ball.color === 'yellow') && ball.number && (
                              <Typography sx={{
                                fontSize: '0.65rem',
                                color: ball.color === 'yellow' ? 'black' : 'white',
                                fontWeight: 'bold'
                              }}>
                                {ball.number}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Button
                    variant="text"
                    size="small"
                    startIcon={<BugReportIcon sx={{ fontSize: '0.8rem' }} />}
                    onClick={toggleDebugInfo}
                    sx={{ mt: 1.5, color: '#6930c3', fontSize: '0.75rem' }}
                  >
                    {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
                  </Button>

                  {showDebugInfo && !loading && (
                    <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f0f0f0', borderRadius: 1, fontSize: '0.7rem' }}>
                      <Typography variant="caption" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        Debug Info:
                      </Typography>
                      <Typography variant="caption" component="div">
                        Player Level: {playerLevel}
                      </Typography>
                      <Typography variant="caption" component="div">
                        Ball Count: {ballPositions.length}
                      </Typography>
                      <Typography variant="caption" component="div">
                        Simulation Step: {simulationStep}
                      </Typography>
                      {simulationParams && (
                        <Typography variant="caption" component="div">
                          Shot Precision: {simulationParams.shotPrecision.toFixed(2)},
                          Hit Strength: {simulationParams.hitStrength.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  )}
                </TabPanel>
              </Card>
            )}

            {/* Shot Suggestions Component with scrollable container */}
            {!simulationStarted && (
              <Card sx={{
                borderRadius: 4,
                bgcolor: '#f8f9fa',
                p: 2,
                maxHeight: '400px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="subtitle1" sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 'bold',
                  mb: 1,
                  px: 0.5
                }}>
                  <InfoIcon sx={{ mr: 0.5, color: '#6930c3', fontSize: '1rem' }} />
                  Shot Suggestions
                </Typography>

                <Box sx={{
                  overflowY: 'auto',
                  pr: 1,
                  flex: 1
                }}>
                  <ShotSuggestion
                    ballPositions={ballPositions}
                    playerLevel={playerLevel}
                    tableDimensions={{ width: TABLE_WIDTH, height: TABLE_HEIGHT }}
                    onApplySuggestion={handleApplySuggestion}
                    isSimulationStarted={simulationStarted}
                  />
                </Box>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}