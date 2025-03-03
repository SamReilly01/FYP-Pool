import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';

// Styled components - same as HomePage.jsx
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

export default function SimulationPage() {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  
  // Function to check active route
  const isActive = (route) => path === route;
  
  // State Variables
  const [processedImage, setProcessedImage] = useState(null);
  const [ballPositions, setBallPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const imageRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 800, height: 400 }); // Default table dimensions
  const [simulationStarted, setSimulationStarted] = useState(false);

  useEffect(() => {
    const fetchAndProcessImage = async () => {
      try {
        console.log("📡 Fetching latest uploaded image...");
        const response = await fetch('http://localhost:5000/api/image/latest');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch latest image.");
        }

        const imagePath = data.image_url;
        console.log("✅ Latest image fetched:", imagePath);

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

        // ✅ Ensure only the processed image is displayed
        const processedImagePath = `http://localhost:5000${result.transformed_image_url}`;
        setProcessedImage(processedImagePath);
        setBallPositions(result.ball_positions || []);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchAndProcessImage();
  }, []);

  // Capture image dimensions once it's loaded
  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.clientWidth,
        height: imageRef.current.clientHeight,
      });
      console.log("📏 Image loaded - Dimensions:", imageRef.current.clientWidth, imageRef.current.clientHeight);
    }
  };

  // Handle simulation start
  const handlePlaySimulation = () => {
    setSimulationStarted(true);
    // Add your simulation logic here
    console.log("🎮 Simulation started");
  };

  // Handle simulation reset
  const handleResetSimulation = () => {
    setSimulationStarted(false);
    // Reset simulation logic
    console.log("🔄 Simulation reset");
  };

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
              <Typography variant="h6" gutterBottom>
                Simulation View
              </Typography>
              <Box sx={{ 
                flex: 1,
                bgcolor: '#e9ecef',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                minHeight: 400,
                position: 'relative'
              }}>
                {loading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress sx={{ mb: 2, color: '#6930c3' }} />
                    <Typography>Processing your image...</Typography>
                  </Box>
                ) : error ? (
                  <Typography color="error">{error}</Typography>
                ) : processedImage ? (
                  <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                    <img
                      ref={imageRef}
                      key={processedImage}
                      src={processedImage}
                      alt="Processed Pool Table"
                      style={{ width: '100%', borderRadius: '8px' }}
                      onLoad={handleImageLoad}
                      onError={(e) => console.error("❌ Image failed to load:", e.target.src)}
                    />
                    
                    {ballPositions.map((ball, index) => {
                      // Scale ball display size based on image dimensions
                      const ballSize = Math.max(18, Math.min(imageSize.width, imageSize.height) / 22);
                      
                      // Color mapping for more vibrant balls
                      const ballColors = {
                        'white': '#ffffff',
                        'black': '#111111',
                        'red': '#ff0000',
                        'yellow': '#ffcc00'
                      };
                      
                      // Calculate position percentages based on the game table dimensions
                      // GAME_TABLE_WIDTH is 800, GAME_TABLE_HEIGHT is 400
                      const posX = (ball.x / 800) * 100; 
                      const posY = (ball.y / 400) * 100;
                      
                      // Add animation if simulation started
                      const animationStyle = simulationStarted ? {
                        animation: `ballMovement${index} 5s linear infinite`,
                        animationFillMode: 'forwards',
                      } : {};
                      
                      return (
                        <div
                          key={index}
                          style={{
                            position: 'absolute',
                            top: `${posY}%`,
                            left: `${posX}%`,
                            width: `${ballSize}px`,
                            height: `${ballSize}px`,
                            backgroundColor: ballColors[ball.color] || '#888',
                            borderRadius: '50%',
                            border: '2px solid #ffffff',
                            boxShadow: '0px 2px 4px rgba(0,0,0,0.4), inset 0px -2px 4px rgba(0,0,0,0.3)',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10,
                            transition: 'all 0.3s ease',
                            ...animationStyle
                          }}
                        >
                          {/* Ball number/identification */}
                          {ball.color !== 'white' && ball.color !== 'black' && (
                            <div style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: `${ballSize * 0.5}px`,
                              height: `${ballSize * 0.5}px`,
                              backgroundColor: '#ffffff',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: `${ballSize * 0.3}px`,
                              fontWeight: 'bold',
                              color: ball.color === 'yellow' ? '#000' : '#fff',
                            }}>
                              {ball.color === 'red' ? '1' : '2'}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
            <Card sx={{ 
              height: '100%',
              borderRadius: 4,
              bgcolor: '#f8f9fa',
              p: 3,
              mb: 4
            }}>
              <Typography variant="h6" gutterBottom>
                Simulation Controls
              </Typography>
              <Box sx={{ mt: 3 }}>
                <ActionButton 
                  fullWidth
                  sx={{ mb: 2 }}
                  disabled={simulationStarted || loading || error || !processedImage}
                  onClick={handlePlaySimulation}
                >
                  {simulationStarted ? 'Simulation Running...' : 'Play Simulation'}
                </ActionButton>
                <ActionButton 
                  fullWidth
                  sx={{ mb: 2 }}
                  color="#4a5568"
                  disabled={!simulationStarted || loading || error || !processedImage}
                  onClick={handleResetSimulation}
                >
                  Reset Simulation
                </ActionButton>
                <ActionButton 
                  fullWidth
                  color="#5e60ce"
                  onClick={() => navigate('/results')}
                  disabled={loading || error || !processedImage}
                >
                  View Results
                </ActionButton>
              </Box>
            </Card>
            
            <Card sx={{ 
              borderRadius: 4,
              bgcolor: '#f8f9fa',
              p: 3
            }}>
              <Typography variant="h6" gutterBottom>
                Ball Detection
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  {loading ? 'Detecting balls...' : 
                   error ? 'Ball detection failed' : 
                   `${ballPositions.length} ball(s) detected`}
                </Typography>
                {!loading && !error && (
                  <Box sx={{ mt: 2 }}>
                    {['white', 'black', 'red', 'yellow'].map(color => {
                      const count = ballPositions.filter(ball => ball.color === color).length;
                      if (count > 0) {
                        return (
                          <Box key={color} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box 
                              sx={{ 
                                width: 16, 
                                height: 16, 
                                borderRadius: '50%', 
                                backgroundColor: color === 'white' ? '#fff' : 
                                              color === 'black' ? '#000' : 
                                              color === 'red' ? '#ff0000' : 
                                              '#ffcc00',
                                border: '1px solid #888',
                                boxShadow: '0px 1px 2px rgba(0,0,0,0.3), inset 0px -1px 2px rgba(0,0,0,0.2)',
                                mr: 1
                              }} 
                            />
                            <Typography variant="body2">
                              {`${color.charAt(0).toUpperCase() + color.slice(1)}: ${count}`}
                            </Typography>
                          </Box>
                        );
                      }
                      return null;
                    })}
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}