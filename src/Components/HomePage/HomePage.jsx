import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CodeIcon from '@mui/icons-material/Code';
import MobileScreenShareIcon from '@mui/icons-material/MobileScreenShare';

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

const SectionHeading = styled(Typography)(({ theme }) => ({
  fontSize: '1.8rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(3),
}));

const FeatureCard = styled(Card)(({ theme, bgcolor }) => ({
  height: '100%',
  backgroundColor: bgcolor || '#f2a365',
  color: 'white',
  borderRadius: theme.spacing(2),
  textAlign: 'center',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '50%',
  width: 60,
  height: 60,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(2),
}));

export default function HomePage() {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  
  // Function to check active route
  const isActive = (route) => path === route;
  
  // Extract username from email on component mount
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      // Extract the part before @
      const name = email.split('@')[0];
      // Capitalize the first letter
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      setUserName(formattedName);
    }
  }, []);

  // Features for the main cards
  const featureCards = [
    {
      title: 'Upload Image',
      description: 'Take a picture or upload an existing image of your pool table',
      icon: <CameraAltIcon fontSize="large" />,
      color: '#f2a365',
      route: '/upload'
    },
    {
      title: 'Run Simulation',
      description: 'Watch as we process your image and create a 3D simulation environment',
      icon: <CodeIcon fontSize="large" />,
      color: '#16e5d8',
      route: '/simulation'
    },
    {
      title: 'View Results',
      description: 'Play the simulation and see calculated angles and trajectories',
      icon: <MobileScreenShareIcon fontSize="large" />,
      color: '#6930c3',
      route: '/results'
    }
  ];

  // Settings, Help, and About features for the bottom section
  const additionalFeatures = [
    {
      title: 'Settings',
      description: 'Customize your experience and account preferences',
      icon: <SettingsIcon fontSize="large" />,
      color: '#3a86ff',
      route: '/settings'
    },
    {
      title: 'Help Center',
      description: 'Find answers to common questions and learn how to use the app',
      icon: <HelpIcon fontSize="large" />,
      color: '#e93e60',
      route: '/help'
    },
    {
      title: 'About Us',
      description: 'Learn about our team and the technology behind the simulation',
      icon: <InfoIcon fontSize="large" />,
      color: '#6930c3',
      route: '/about'
    }
  ];

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
          {userName ? `Welcome, ${userName}!` : 'Provide You the Best Pool Game Service'}
        </MainHeading>
        <SubHeading variant="body1">
          Upload your pool table images and let our AI analyze the best shots for you. You can trust us!
        </SubHeading>
        <ActionButton 
          variant="contained"
          sx={{ mt: 2, alignSelf: 'flex-start' }}
          onClick={() => navigate('/upload')}
        >
          Upload Now
        </ActionButton>
      </Header>
      
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <SectionTitle variant="subtitle1">OUR SERVICES</SectionTitle>
          <SectionHeading variant="h2">We Provide Best Quality Service</SectionHeading>
          <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Our pool game simulation offers state-of-the-art image recognition, physics engine, and easy-to-use interface
            to help improve your game. Perfect for players of all levels.
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {featureCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard bgcolor={card.color}>
                <CardContent sx={{ p: 3 }}>
                  <FeatureIcon>
                    {card.icon}
                  </FeatureIcon>
                  <Typography variant="h6" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
                    {card.description}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate(card.route)}
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)'
                      }
                    }}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
        
        {/* Second row for Settings, Help, and About */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {additionalFeatures.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard bgcolor={card.color}>
                <CardContent sx={{ p: 3 }}>
                  <FeatureIcon>
                    {card.icon}
                  </FeatureIcon>
                  <Typography variant="h6" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
                    {card.description}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate(card.route)}
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)'
                      }
                    }}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}