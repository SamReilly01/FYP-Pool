import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import CodeIcon from '@mui/icons-material/Code';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SportsIcon from '@mui/icons-material/Sports';
import SchoolIcon from '@mui/icons-material/School';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PersonIcon from '@mui/icons-material/Person';

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
  maxWidth: '600px',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(3),
  marginTop: theme.spacing(6),
  color: theme.palette.primary.main,
  borderBottom: `2px solid ${theme.palette.primary.main}`,
  paddingBottom: theme.spacing(1),
  display: 'inline-block',
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
  },
}));

const DeveloperCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  overflow: 'visible',
  position: 'relative',
  padding: theme.spacing(4, 3, 3),
  marginTop: theme.spacing(4),
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
}));

const DeveloperAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  position: 'absolute',
  top: -50,
  left: '50%',
  transform: 'translateX(-50%)',
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
}));

const SocialButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(1),
  borderRadius: '50%',
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: 'rgba(105, 48, 195, 0.08)',
  },
}));

export default function AboutPage() {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  
  // Function to check active route
  const isActive = (route) => path === route;

  // Features data
  const features = [
    {
      title: "Computer Vision",
      icon: <CameraAltIcon sx={{ fontSize: 40, color: "#6930c3" }} />,
      description: "Our advanced computer vision algorithms accurately detect and track pool balls from your photos, regardless of lighting conditions or angle."
    },
    {
      title: "Physics Simulation",
      icon: <SportsIcon sx={{ fontSize: 40, color: "#6930c3" }} />,
      description: "Realistic physics engine that models ball-to-ball collisions, cushion rebounds, and ball motion with high precision based on real-world pool dynamics."
    },
    {
      title: "AI Shot Suggestions",
      icon: <SchoolIcon sx={{ fontSize: 40, color: "#6930c3" }} />,
      description: "Smart suggestions for optimal shots based on your skill level, with personalised feedback to help improve your game over time."
    },
    {
      title: "Interactive Learning",
      icon: <CodeIcon sx={{ fontSize: 40, color: "#6930c3" }} />,
      description: "Experiment with different shots and techniques in a risk-free environment. Save your simulations to track progress and improvement."
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
          About Pool Game Simulation
        </MainHeading>
        <SubHeading variant="body1">
          Learn about this innovative pool game analysis tool and the technology behind it
        </SubHeading>
      </Header>
      
      <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
        {/* Mission Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
            Project Mission
          </Typography>
          <Typography variant="body1" paragraph align="center" sx={{ maxWidth: 900, mx: 'auto', mb: 3 }}>
            My Pool Game Simulation was created to help both casual players and professionals improve their game through technology. 
            By combining computer vision, physics simulation, and artificial intelligence, this tool analyses your 
            pool table setups and provides valuable insights into optimal shot selection and game strategy.
          </Typography>
          <Typography variant="body1" paragraph align="center" sx={{ maxWidth: 900, mx: 'auto' }}>
            Whether you're a beginner looking to learn the basics or an expert aiming to perfect your technique, 
            the goal is to enhance your understanding of pool game mechanics and help you become a better player.
          </Typography>
        </Box>
        
        {/* Key Features Section */}
        <SectionTitle>
          Key Technologies
        </SectionTitle>
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <FeatureCard>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" align="center" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" align="center">
                  {feature.description}
                </Typography>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
        
        {/* Technical Details */}
        <SectionTitle>
          How It Works
        </SectionTitle>
        <Box sx={{ mb: 8 }}>
          <Typography variant="body1" paragraph>
            The pool game simulation tool uses a sophisticated pipeline of computer vision and physics simulation:
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ borderLeft: '3px solid #6930c3', pl: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Image Processing</Typography>
                <Typography variant="body2" paragraph>
                  When you upload a photo of your pool table, our computer vision algorithms go to work:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Table boundary detection using contour analysis and geometric transformations
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Ball detection and classification through colour segmentation and Hough circle transforms
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Spatial mapping of ball positions relative to table boundaries for accurate simulation setup
                    </Typography>
                  </li>
                </ul>
              </Box>
              
              <Box sx={{ borderLeft: '3px solid #6930c3', pl: 3 }}>
                <Typography variant="h6" gutterBottom>Shot Analysis</Typography>
                <Typography variant="body2" paragraph>
                  Our AI evaluates possible shots based on:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Geometric analysis of ball positions and pocket locations
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Path clearance calculation to identify obstruction-free trajectories
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Player skill level to suggest appropriate difficulty shots
                    </Typography>
                  </li>
                </ul>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ borderLeft: '3px solid #6930c3', pl: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Physics Engine</Typography>
                <Typography variant="body2" paragraph>
                  Our custom-built physics engine simulates:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Accurate momentum transfer during ball collisions following conservation laws
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Realistic table friction effects and ball deceleration over time
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Cushion rebounds with appropriate angle changes and energy loss
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Pocket detection and ball removal physics
                    </Typography>
                  </li>
                </ul>
              </Box>
              
              <Box sx={{ borderLeft: '3px solid #6930c3', pl: 3 }}>
                <Typography variant="h6" gutterBottom>User Experience</Typography>
                <Typography variant="body2" paragraph>
                  The application features an intuitive interface that:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Allows simple image uploads from any device
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Provides interactive shot controls with real-time feedback
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Saves simulation results for review and comparison
                    </Typography>
                  </li>
                </ul>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* About the Developer Section */}
        <SectionTitle>
          About the Developer
        </SectionTitle>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={8}>
              <DeveloperCard>
                <DeveloperAvatar sx={{ bgcolor: '#6930c3' }}>
                  <PersonIcon sx={{ fontSize: 60 }} />
                </DeveloperAvatar>
                
                <Box sx={{ mt: 5, textAlign: 'center' }}>
                  <Typography variant="h5" gutterBottom>
                    Solo Developer Project
                  </Typography>
                  <Typography variant="body1" paragraph>
                    My Pool Game Simulation is a personal project that combines computer vision, 
                    physics simulation, and game development with a love for pool to create 
                    a practical tool that helps players visualise and improve their game.
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Skills utilised in this project include JavaScript/React for frontend development, Node.js for backend services, 
                    Python for computer vision algorithms, and physics modeling for realistic simulation.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                    <SocialButton aria-label="github">
                      <GitHubIcon />
                    </SocialButton>
                    <SocialButton aria-label="linkedin">
                      <LinkedInIcon />
                    </SocialButton>
                  </Box>
                </Box>
              </DeveloperCard>
            </Grid>
          </Grid>
        </Box>
        
        {/* Call to Action */}
        <Box sx={{ 
          bgcolor: 'rgba(105, 48, 195, 0.05)', 
          p: 5, 
          borderRadius: 4, 
          textAlign: 'center',
          mt: 8
        }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Improve Your Game?
          </Typography>
          <Typography variant="body1" paragraph sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
            Start using the pool game simulation tool to analyse your shots, improve your strategy, 
            and take your pool playing skills to the next level.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <ActionButton 
              color="#6930c3"
              onClick={() => navigate('/upload')}
              startIcon={<AddPhotoAlternateIcon />}
            >
              Upload an Image
            </ActionButton>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/help')}
              startIcon={<HelpIcon />}
              sx={{ borderRadius: 5, px: 4 }}
            >
              Learn How It Works
            </Button>
          </Box>
        </Box>
        
        {/* Copyright notice */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 Pool Game Simulation — All Rights Reserved
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}