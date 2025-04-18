import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import SportsIcon from '@mui/icons-material/Sports';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import AdjustIcon from '@mui/icons-material/Adjust';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import LaunchIcon from '@mui/icons-material/Launch';
import SportsPoolIcon from '@mui/icons-material/SportsBar'; // Using SportsBar as a stand-in for pool
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import BugReportIcon from '@mui/icons-material/BugReport';

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
  fontSize: '1.2rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.primary.main,
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  '&::before': {
    display: 'none', // Removes the default divider
  },
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: 'rgba(105, 48, 195, 0.04)',
  borderRadius: theme.spacing(1, 1, 0, 0),
}));

const HelpCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
  },
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TipAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 'bold',
    minWidth: 100,
  },
  '& .Mui-selected': {
    color: theme.palette.primary.main,
  },
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
  },
}));

// StepCard 
const StepCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingLeft: theme.spacing(6), 
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(3), 
  background: 'rgba(105, 48, 195, 0.03)',
  border: '1px solid rgba(105, 48, 195, 0.1)',
  position: 'relative',
}));

// Step number
const StepNumber = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1), 
  left: theme.spacing(1), 
  width: theme.spacing(4),
  height: theme.spacing(4),
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
}));

export default function HelpPage() {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Function to check active route
  const isActive = (route) => path === route;
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
          Help & Support Center
        </MainHeading>
        <SubHeading variant="body1">
          Find answers to common questions, learn how to use our pool game simulation, and get the most out of your experience
        </SubHeading>
      </Header>
      
      <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
        {/* Quick Help Cards - Now with 4 cards including FAQs */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <HelpCard>
              <Box sx={{ bgcolor: '#6930c3', color: 'white', p: 2, display: 'flex', alignItems: 'center' }}>
                <SportsPoolIcon sx={{ fontSize: 28, mr: 1.5 }} />
                <Typography variant="h6">Getting Started</Typography>
              </Box>
              <CardContent>
                <Typography variant="body2" paragraph>
                  Learn the basics of how to use our pool game simulation tool to analyse and improve your game.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth
                  onClick={() => setTabValue(0)}
                  sx={{ borderRadius: 2 }}
                >
                  View Guide
                </Button>
              </CardContent>
            </HelpCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <HelpCard>
              <Box sx={{ bgcolor: '#8e44ad', color: 'white', p: 2, display: 'flex', alignItems: 'center' }}>
                <QuestionAnswerIcon sx={{ fontSize: 28, mr: 1.5 }} />
                <Typography variant="h6">FAQs</Typography>
              </Box>
              <CardContent>
                <Typography variant="body2" paragraph>
                  Find answers to commonly asked questions about our pool simulation features and capabilities.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth
                  onClick={() => setTabValue(1)}
                  sx={{ borderRadius: 2 }}
                >
                  View FAQs
                </Button>
              </CardContent>
            </HelpCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <HelpCard>
              <Box sx={{ bgcolor: '#ff9f1c', color: 'white', p: 2, display: 'flex', alignItems: 'center' }}>
                <TipsAndUpdatesIcon sx={{ fontSize: 28, mr: 1.5 }} />
                <Typography variant="h6">Tips & Tricks</Typography>
              </Box>
              <CardContent>
                <Typography variant="body2" paragraph>
                  Discover advanced techniques and tips to get the most accurate analysis and simulations.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth
                  onClick={() => setTabValue(2)}
                  sx={{ borderRadius: 2 }}
                >
                  View Tips
                </Button>
              </CardContent>
            </HelpCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <HelpCard>
              <Box sx={{ bgcolor: '#4caf50', color: 'white', p: 2, display: 'flex', alignItems: 'center' }}>
                <BugReportIcon sx={{ fontSize: 28, mr: 1.5 }} />
                <Typography variant="h6">Troubleshooting</Typography>
              </Box>
              <CardContent>
                <Typography variant="body2" paragraph>
                  Solutions to common issues with image uploads, simulation performance, and more.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth
                  onClick={() => setTabValue(3)}
                  sx={{ borderRadius: 2 }}
                >
                  View Solutions
                </Button>
              </CardContent>
            </HelpCard>
          </Grid>
        </Grid>
        
        {/* Tabs for different help sections */}
        <Box sx={{ width: '100%' }}>
          <StyledTabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
          >
            <Tab label="How It Works" icon={<InfoIcon />} iconPosition="start" />
            <Tab label="FAQs" icon={<QuestionAnswerIcon />} iconPosition="start" />
            <Tab label="Tips & Best Practices" icon={<LightbulbIcon />} iconPosition="start" />
            <Tab label="Troubleshooting" icon={<BugReportIcon />} iconPosition="start" />
          </StyledTabs>
          
          {/* How It Works Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              <SectionTitle sx={{ mb: 3 }}>
                <InfoIcon sx={{ mr: 1 }} /> How Pool Game Simulation Works
              </SectionTitle>
              
              <Typography variant="body1" paragraph>
                Our pool game simulation uses advanced computer vision and physics engines to analyse pool table images, 
                detect balls, and provide realistic simulations of shots. Here's the step-by-step process:
              </Typography>
              
              <StepCard elevation={0}>
                <StepNumber>1</StepNumber>
                <Typography variant="h6" gutterBottom>Upload an Image</Typography>
                <Typography variant="body2" paragraph>
                  Take a photo of your pool table setup or upload an existing image. For best results, ensure the entire table 
                  is visible, well-lit, and photographed from directly above.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddPhotoAlternateIcon />}
                  size="small"
                  onClick={() => navigate('/upload')}
                  sx={{ mt: 1 }}
                >
                  Go to Upload Page
                </Button>
              </StepCard>
              
              <StepCard elevation={0}>
                <StepNumber>2</StepNumber>
                <Typography variant="h6" gutterBottom>Image Processing</Typography>
                <Typography variant="body2" paragraph>
                  Our system analyses your image to identify the table boundaries and detect all balls. We use advanced computer 
                  vision algorithms to recognise different ball colours and their positions on the table.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                  <ImageSearchIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    The system can handle various lighting conditions and table colours, but clear images 
                    will always produce the best results.
                  </Typography>
                </Box>
              </StepCard>
              
              <StepCard elevation={0}>
                <StepNumber>3</StepNumber>
                <Typography variant="h6" gutterBottom>Simulation Setup</Typography>
                <Typography variant="body2" paragraph>
                  After processing, you'll see a virtual representation of your pool table. Our system recommends 
                  possible shots based on your selected skill level.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                  <AdjustIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    You can manually aim shots or apply suggested shots from our AI assistant.
                  </Typography>
                </Box>
              </StepCard>
              
              <StepCard elevation={0}>
                <StepNumber>4</StepNumber>
                <Typography variant="h6" gutterBottom>Run the Simulation</Typography>
                <Typography variant="body2" paragraph>
                  Start the simulation to see how your shot would play out in reality. Our physics engine 
                  accurately models ball collisions, friction, and pocketing.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                  <PlayArrowIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Adjust simulation speed or enable trajectory tracking to visualise the full path of each ball.
                  </Typography>
                </Box>
              </StepCard>
              
              <StepCard elevation={0}>
                <StepNumber>5</StepNumber>
                <Typography variant="h6" gutterBottom>Save and Review Results</Typography>
                <Typography variant="body2" paragraph>
                  Save your simulations to review them later or compare different approaches. Track your progress 
                  and improvement over time.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FileDownloadDoneIcon />}
                  size="small"
                  onClick={() => navigate('/results')}
                  sx={{ mt: 1 }}
                >
                  View Results Page
                </Button>
              </StepCard>
              
              <TipAlert severity="info" icon={<TipsAndUpdatesIcon />}>
                <Typography variant="body2">
                  <strong>Pro Tip:</strong> Set your player level in the settings to get shot suggestions appropriate for your skill level. 
                  Beginners will receive simpler shots, while experts will see more complex shot options.
                </Typography>
              </TipAlert>
            </Box>
          </TabPanel>
          
          {/* FAQs Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              <SectionTitle>
                <QuestionAnswerIcon sx={{ mr: 1 }} /> Frequently Asked Questions
              </SectionTitle>
              
              <StyledAccordion>
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">What types of pool games does the system support?</Typography>
                </StyledAccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    Currently, our system supports standard 8-ball and 9-ball pool setups. The system can recognise and 
                    simulate games with red and yellow balls, black balls, and white cue balls. Support for additional 
                    game types will be added in future updates.
                  </Typography>
                </AccordionDetails>
              </StyledAccordion>
              
              <StyledAccordion>
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">How accurate is the ball detection?</Typography>
                </StyledAccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    Our ball detection system has been trained on thousands of pool table images and achieves over 95% 
                    accuracy under good lighting conditions. For optimal results, take photos in well-lit environments 
                    without shadows across the table, and ensure the entire table is visible in the frame.
                  </Typography>
                  <Typography variant="body2">
                    If some balls aren't detected properly, the system will add "synthetic" balls to complete the setup. 
                    You'll receive a notification when this happens.
                  </Typography>
                </AccordionDetails>
              </StyledAccordion>
              
              <StyledAccordion>
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">What camera angles work best for uploading images?</Typography>
                </StyledAccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    For the most accurate results, take photos from directly above the table (birds-eye view). If that's 
                    not possible, try to capture the image from a position that shows the entire table with minimal 
                    perspective distortion.
                  </Typography>
                  <Typography variant="body2">
                    Our system can handle some angle distortion, but extreme angles may affect the accuracy of ball 
                    positioning and shot predictions.
                  </Typography>
                </AccordionDetails>
              </StyledAccordion>
              
              <StyledAccordion>
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Is my data saved securely?</Typography>
                </StyledAccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    Yes, we take data security seriously. Your uploaded images and simulation results are stored securely 
                    and associated only with your account. You can delete your data at any time from the Settings page.
                  </Typography>
                  <Typography variant="body2">
                    We do not share your images or results with third parties, and they are used solely for providing 
                    the simulation service to you.
                  </Typography>
                </AccordionDetails>
              </StyledAccordion>
              
              <StyledAccordion>
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Can I use the app offline?</Typography>
                </StyledAccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    Currently, the app requires an internet connection to process images and run simulations, as these 
                    operations are performed on our servers. We're working on an offline mode for basic simulations 
                    in a future update.
                  </Typography>
                </AccordionDetails>
              </StyledAccordion>
              
              <StyledAccordion>
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">How do I change my skill level?</Typography>
                </StyledAccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    You can change your skill level in two ways:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><ArrowRightIcon /></ListItemIcon>
                      <ListItemText 
                        primary="When uploading a new image, you'll be prompted to select your skill level." 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ArrowRightIcon /></ListItemIcon>
                      <ListItemText 
                        primary="You can also change your default skill level on the Settings page under 'Player Settings'." 
                      />
                    </ListItem>
                  </List>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => navigate('/settings')}
                    sx={{ mt: 1 }}
                  >
                    Go to Settings
                  </Button>
                </AccordionDetails>
              </StyledAccordion>
              
              <StyledAccordion>
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">How accurate is the physics simulation?</Typography>
                </StyledAccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    Our physics engine models real-world pool dynamics including:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Ball-to-ball collisions with accurate momentum transfer" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Realistic table friction and ball deceleration" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Cushion rebounds with appropriate angle changes" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Pocket detection and ball removal" />
                    </ListItem>
                  </List>
                  <Typography variant="body2" paragraph>
                    You can adjust physics settings in the Settings page to match different table conditions.
                  </Typography>
                </AccordionDetails>
              </StyledAccordion>
              
              <StyledAccordion>
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Can I simulate spin on the ball?</Typography>
                </StyledAccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    Currently, our simulation supports basic shot mechanics without spin effects. We're working on adding 
                    advanced spin controls in a future update to simulate draw, follow, and side spin. Stay tuned!
                  </Typography>
                </AccordionDetails>
              </StyledAccordion>
            </Box>
          </TabPanel>
          
          {/* Tips & Best Practices Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              <SectionTitle>
                <LightbulbIcon sx={{ mr: 1 }} /> Tips & Best Practices
              </SectionTitle>
              
              <Typography variant="body1" paragraph>
                Get the most out of our pool game simulation with these helpful tips and best practices.
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <TipAlert severity="success" icon={<CameraAltIcon />}>
                    <Typography variant="subtitle2" gutterBottom>Taking the Perfect Table Photo</Typography>
                    <Typography variant="body2">
                      • Position directly above the table if possible<br />
                      • Ensure all balls are visible and not obstructed<br />
                      • Use good lighting without harsh shadows<br />
                      • Avoid glare on the table surface<br />
                      • Include all table boundaries in the frame
                    </Typography>
                  </TipAlert>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TipAlert severity="success" icon={<SportsIcon />}>
                    <Typography variant="subtitle2" gutterBottom>Getting Accurate Simulations</Typography>
                    <Typography variant="body2">
                      • Set your correct skill level for appropriate suggestions<br />
                      • Adjust physics settings to match your table's conditions<br />
                      • Try multiple shot angles for the same position<br />
                      • Use the slow-motion feature to study ball paths<br />
                      • Enable trajectory view to see full ball paths
                    </Typography>
                  </TipAlert>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 4 }} />
              
              <SectionTitle>
                <PhotoLibraryIcon sx={{ mr: 1 }} /> Image Capture Tips
              </SectionTitle>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Use your phone's main camera rather than the selfie camera" 
                        secondary="Main cameras usually have better resolution and image quality"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Clean your table and balls before taking photos" 
                        secondary="Dust and marks can interfere with ball detection"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Take photos in landscape orientation" 
                        secondary="This captures the entire table better for rectangular pool tables"
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText 
                        primary="Avoid taking photos in very low light" 
                        secondary="Dark images make ball detection difficult and less accurate"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText 
                        primary="Don't use flash directly on the table" 
                        secondary="This creates glare and reflections that interfere with detection"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText 
                        primary="Avoid extreme angles when photographing the table" 
                        secondary="Steep angles distort ball positions and make accurate detection harder"
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 4 }} />
              
              <SectionTitle>
                <SportsIcon sx={{ mr: 1 }} /> Game Strategy Tips
              </SectionTitle>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <StyledAccordion>
                    <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">Beginner Strategies</Typography>
                    </StyledAccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><LightbulbIcon color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="Focus on making clean hits" 
                            secondary="Accuracy is more important than power for beginners"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><LightbulbIcon color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="Plan where the cue ball will go after contact" 
                            secondary="Position play is essential even for simple shots"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><LightbulbIcon color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="Use the 'Ghost Ball' method for aiming" 
                            secondary="Visualise where the cue ball needs to be to hit the object ball in your desired direction"
                          />
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </StyledAccordion>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledAccordion>
                    <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">Advanced Techniques</Typography>
                    </StyledAccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><LightbulbIcon color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="Study multiple-ball collision paths" 
                            secondary="Our simulation accurately shows how energy transfers between balls"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><LightbulbIcon color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="Use the trajectory visualisation for planning complex shots" 
                            secondary="Seeing the full path helps understand table geometry"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><LightbulbIcon color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="Compare different approaches to the same shot" 
                            secondary="Save multiple simulations to analyse the most effective strategy"
                          />
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </StyledAccordion>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
          
          {/* Troubleshooting Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              <SectionTitle>
                <BugReportIcon sx={{ mr: 1 }} /> Common Issues & Solutions
              </SectionTitle>
              
              <Typography variant="body1" paragraph>
                Experiencing problems with the pool game simulation? Find solutions to common issues below.
              </Typography>
              
              <StyledAccordion>
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Image Upload Problems</Typography>
                </StyledAccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText
                        primary="Image fails to upload"
                        secondary="Make sure your image is under 10MB in size and in a supported format (JPG, PNG, HEIC)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText
                        primary="Upload seems stuck"
                        secondary="Check your internet connection and try again. If problems persist, try a smaller image file"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText
                        primary="Browser crashes during upload"
                        secondary="This may happen with very large images. Try compressing your image before uploading"
                      />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </StyledAccordion>
              
              <StyledAccordion>
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Ball Detection Issues</Typography>
                </StyledAccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText
                        primary="Not all balls are detected"
                        secondary="Try a better-lit photo with clearer contrast between balls and table"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText
                        primary="Balls are placed incorrectly in the simulation"
                        secondary="This can happen with extreme camera angles. Take a photo from directly above the table if possible"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText
                        primary="Ball colors are incorrectly identified"
                        secondary="Ensure good lighting without color casts, and try the 'Reprocess Image' button in the simulation view"
                      />
                    </ListItem>
                  </List>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CameraAltIcon />}
                    size="small"
                    onClick={() => navigate('/upload')}
                    sx={{ mt: 2 }}
                  >
                    Upload a New Image
                  </Button>
                </AccordionDetails>
              </StyledAccordion>
              
              <StyledAccordion>
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Simulation Performance Problems</Typography>
                </StyledAccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText
                        primary="Simulation runs slowly or stutters"
                        secondary="Try reducing the simulation speed in the controls, or close other browser tabs to free up resources"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText
                        primary="Balls move unrealistically"
                        secondary="Check your physics settings in the Settings page and adjust table friction and ball restitution"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText
                        primary="Shot suggestions don't appear"
                        secondary="Ensure you have at least one object ball and the cue ball properly detected on the table"
                      />
                    </ListItem>
                  </List>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<SettingsIcon />}
                    size="small"
                    onClick={() => navigate('/settings')}
                    sx={{ mt: 2 }}
                  >
                    Adjust Settings
                  </Button>
                </AccordionDetails>
              </StyledAccordion>
              
              <StyledAccordion>
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Account & Saving Issues</Typography>
                </StyledAccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText
                        primary="Cannot save simulation results"
                        secondary="You must be logged in to save results. Check that you're logged in and try again"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText
                        primary="Saved simulations don't appear in results"
                        secondary="Try refreshing the page. If they still don't appear, make sure you're logged in with the same account"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                      <ListItemText
                        primary="Settings aren't saved between sessions"
                        secondary="Settings are stored in your browser's local storage. Make sure you're not in private/incognito mode"
                      />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </StyledAccordion>
              
              <Box sx={{ mt: 4 }}>
                <TipAlert severity="warning">
                  <Typography variant="subtitle2" gutterBottom>Still Having Problems?</Typography>
                  <Typography variant="body2" paragraph>
                    If you're still experiencing issues that aren't covered here, try the following:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><ArrowRightIcon /></ListItemIcon>
                      <ListItemText primary="Clear your browser cache and reload the application" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ArrowRightIcon /></ListItemIcon>
                      <ListItemText primary="Try a different web browser (Chrome, Firefox, or Edge are recommended)" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ArrowRightIcon /></ListItemIcon>
                      <ListItemText primary="Check if your browser is up to date" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ArrowRightIcon /></ListItemIcon>
                      <ListItemText primary="Disable browser extensions that might interfere with the application" />
                    </ListItem>
                  </List>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    If none of these solutions work, please contact our support team for assistance.
                  </Typography>
                </TipAlert>
              </Box>
            </Box>
          </TabPanel>
        </Box>
        
        {/* Additional Help Resources */}
        <Box sx={{ mt: 6, mb: 3 }}>
          <Divider sx={{ mb: 4 }} />
          <Typography variant="h5" align="center" gutterBottom>
            Additional Resources
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountCircleIcon sx={{ fontSize: 32, color: '#6930c3', mr: 1.5 }} />
                    <Typography variant="h6">Account Management</Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    Manage your profile, change your password, or update your email address in the Settings page.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => navigate('/settings')}
                    sx={{ borderRadius: 2 }}
                  >
                    Account Settings
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FormatListBulletedIcon sx={{ fontSize: 32, color: '#6930c3', mr: 1.5 }} />
                    <Typography variant="h6">View Your Results</Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    Access your saved simulations, replay them, or delete old ones from your Results page.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => navigate('/results')}
                    sx={{ borderRadius: 2 }}
                  >
                    Results Page
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InfoIcon sx={{ fontSize: 32, color: '#6930c3', mr: 1.5 }} />
                    <Typography variant="h6">About Pool Simulation</Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    Learn more about the technology behind our pool simulation and the team that developed it.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => navigate('/about')}
                    sx={{ borderRadius: 2 }}
                  >
                    About Page
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        {/* Feedback Section */}
        <Box sx={{ mt: 4, bgcolor: 'rgba(105, 48, 195, 0.05)', p: 4, borderRadius: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Have Suggestions to Improve Our Help Center?
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            We're always looking to improve our documentation and make our app easier to use.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <ActionButton color="#6930c3">
              Send Feedback
            </ActionButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}