import React, { useState, useEffect, useContext } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { styled, useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Slider from '@mui/material/Slider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { ColorModeContext } from '../../ThemeContext';
import Avatar from '@mui/material/Avatar';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import TuneIcon from '@mui/icons-material/Tune';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SpeedIcon from '@mui/icons-material/Speed';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import InfoIcon from '@mui/icons-material/Info';
import SportsIcon from '@mui/icons-material/Sports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PaletteIcon from '@mui/icons-material/Palette';
import NightlightIcon from '@mui/icons-material/Nightlight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

// Styled components with theme-aware styles
const Header = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(90deg, #7e57c2 0%, #5e35b1 100%)'
    : 'linear-gradient(90deg, #5e60ce 0%, #6930c3 100%)',
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
  backgroundColor: color || (theme.palette.mode === 'dark' ? '#ffb74d' : '#ff9f1c'),
  color: theme.palette.mode === 'dark' ? '#000000' : 'white',
  borderRadius: theme.spacing(5),
  padding: theme.spacing(1, 4),
  textTransform: 'none',
  fontWeight: 'bold',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
    : '0 4px 20px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    backgroundColor: color 
      ? color 
      : theme.palette.mode === 'dark' 
        ? '#f57c00'
        : '#f2a365',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 6px 25px rgba(0, 0, 0, 0.4)'
      : '0 6px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const MainHeading = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(1),
  color: 'white',
}));

const SubHeading = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  opacity: 0.8,
  marginBottom: theme.spacing(3),
  maxWidth: '500px',
  color: 'white',
}));

const SettingCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 15px rgba(0, 0, 0, 0.3)'
    : '0 4px 15px rgba(0, 0, 0, 0.05)',
  height: '100%',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 6px 20px rgba(0, 0, 0, 0.4)'
      : '0 6px 20px rgba(0, 0, 0, 0.1)',
  }
}));

const SettingCardTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.mode === 'dark' ? '#9575cd' : '#6930c3',
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 'bold',
    '&.Mui-selected': {
      color: theme.palette.mode === 'dark' ? '#9575cd' : '#6930c3',
    },
  },
}));

// Styled DarkMode toggle group
const DarkModeToggleGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
  borderRadius: theme.spacing(5),
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
  maxWidth: 320,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
}));

const DarkModeToggleButton = styled(Box)(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(4),
  backgroundColor: active 
    ? theme.palette.mode === 'dark' 
      ? 'rgba(149, 117, 205, 0.2)' 
      : 'rgba(105, 48, 195, 0.1)'
    : 'transparent',
  color: active 
    ? theme.palette.mode === 'dark' 
      ? '#9575cd' 
      : '#6930c3'
    : theme.palette.text.secondary,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  marginRight: theme.spacing(1),
  '&:last-child': {
    marginRight: 0,
  },
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(149, 117, 205, 0.1)' 
      : 'rgba(105, 48, 195, 0.05)',
  },
}));

// Theme preview cards
const ThemePreviewCard = styled(Box)(({ theme, mode }) => ({
  width: '100%',
  height: 140,
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  position: 'relative',
  border: `2px solid ${theme.palette.mode === mode ? (theme.palette.mode === 'dark' ? '#9575cd' : '#6930c3') : 'transparent'}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 15px rgba(0, 0, 0, 0.3)'
    : '0 4px 15px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 20px rgba(0, 0, 0, 0.4)'
      : '0 6px 20px rgba(0, 0, 0, 0.15)',
  }
}));

const ThemePreviewHeader = styled(Box)(({ mode }) => ({
  background: mode === 'dark'
    ? 'linear-gradient(90deg, #7e57c2 0%, #5e35b1 100%)'
    : 'linear-gradient(90deg, #5e60ce 0%, #6930c3 100%)',
  height: '40%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
}));

const ThemePreviewContent = styled(Box)(({ mode }) => ({
  height: '60%',
  backgroundColor: mode === 'dark' ? '#282828' : '#ffffff',
  padding: '8px 12px',
  display: 'flex',
  flexDirection: 'column',
}));

const PreviewButton = styled(Box)(({ mode }) => ({
  backgroundColor: mode === 'dark' ? '#ffb74d' : '#ff9f1c',
  color: '#fff',
  fontSize: '8px',
  padding: '2px 6px',
  borderRadius: '10px',
  alignSelf: 'flex-end',
  marginTop: 'auto',
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>{children}</Box>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const theme = useTheme();

  // Get the color mode context
  const colorMode = useContext(ColorModeContext);

  // Get user information from localStorage
  const user_id = localStorage.getItem('user_id');

  // State for tabs
  const [activeTab, setActiveTab] = useState(0);

  // State for settings
  const [playerLevel, setPlayerLevel] = useState(localStorage.getItem('playerLevel') || 'intermediate');
  const [defaultSimulationSpeed, setDefaultSimulationSpeed] = useState(parseFloat(localStorage.getItem('defaultSimulationSpeed') || '1.0'));
  const [showTrajectories, setShowTrajectories] = useState(localStorage.getItem('showTrajectories') === 'true');
  const [showShotSuggestions, setShowShotSuggestions] = useState(localStorage.getItem('showShotSuggestions') !== 'false');
  const [enableSounds, setEnableSounds] = useState(localStorage.getItem('enableSounds') !== 'false');
  const [tableFriction, setTableFriction] = useState(parseFloat(localStorage.getItem('tableFriction') || '0.98'));
  const [ballRestitution, setBallRestitution] = useState(parseFloat(localStorage.getItem('ballRestitution') || '0.9'));
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  // Account settings
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification for saving settings
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Theme selection mode
  const [themeMode, setThemeMode] = useState('auto');

  // Load user info on component mount
  useEffect(() => {
    // In a real app, we'd fetch these from a backend API
    // Here we'll just simulate with localStorage
    if (user_id) {
      setEmail(localStorage.getItem('userEmail') || 'user@example.com');
    }
    
    // Get theme mode preference
    const savedThemeMode = localStorage.getItem('themeMode') || 'auto';
    setThemeMode(savedThemeMode);
  }, [user_id]);

  // Function to check active route
  const isActive = (route) => path === route;

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    colorMode.toggleColorMode();
    
    // Also update theme mode to 'manual'
    setThemeMode('manual');
    localStorage.setItem('themeMode', 'manual');
  };
  
  // Handle theme mode selection
  const handleThemeModeChange = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('themeMode', mode);
    
    if (mode === 'auto') {
      // In auto mode, set based on system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDarkMode !== darkMode) {
        // Only toggle if different from current
        setDarkMode(prefersDarkMode);
        colorMode.toggleColorMode();
      }
    }
    // 'manual' mode doesn't change the theme, just indicates user preference overrides system
  };

  // Save all settings
  const handleSaveSettings = () => {
    // Save to localStorage
    localStorage.setItem('playerLevel', playerLevel);
    localStorage.setItem('defaultSimulationSpeed', defaultSimulationSpeed.toString());
    localStorage.setItem('showTrajectories', showTrajectories.toString());
    localStorage.setItem('showShotSuggestions', showShotSuggestions.toString());
    localStorage.setItem('enableSounds', enableSounds.toString());
    localStorage.setItem('tableFriction', tableFriction.toString());
    localStorage.setItem('ballRestitution', ballRestitution.toString());
    localStorage.setItem('darkMode', darkMode.toString());
    localStorage.setItem('themeMode', themeMode);

    // Show success notification
    setNotification({
      open: true,
      message: 'Settings saved successfully',
      severity: 'success'
    });
  };

  // Reset settings to default
  const handleResetSettings = () => {
    setPlayerLevel('intermediate');
    setDefaultSimulationSpeed(1.0);
    setShowTrajectories(true);
    setShowShotSuggestions(true);
    setEnableSounds(true);
    setTableFriction(0.98);
    setBallRestitution(0.9);
    
    // Don't reset dark mode to maintain user's theme preference
    
    // Show notification
    setNotification({
      open: true,
      message: 'Game settings reset to default values',
      severity: 'info'
    });
  };

  // Save account changes
  const handleSaveAccount = () => {
    // Validate passwords match
    if (newPassword && newPassword !== confirmPassword) {
      setNotification({
        open: true,
        message: 'New passwords do not match',
        severity: 'error'
      });
      return;
    }

    // In a real app, we'd call an API to update the account
    // Here we'll just simulate with localStorage
    localStorage.setItem('userEmail', email);

    // Show success notification
    setNotification({
      open: true,
      message: 'Account settings updated successfully',
      severity: 'success'
    });

    // Clear password fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Handle theme preview card click
  const handleThemePreviewClick = (mode) => {
    if ((mode === 'dark') !== darkMode) {
      // Only toggle if different from current
      setDarkMode(mode === 'dark');
      colorMode.toggleColorMode();
    }
    
    // Set to manual mode
    setThemeMode('manual');
    localStorage.setItem('themeMode', 'manual');
  };

  return (
    <Box sx={{ 
      bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f5f5f5',
      minHeight: '100vh',
      transition: 'background-color 0.3s ease'
    }}>
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
          Settings
        </MainHeading>
        <SubHeading variant="body1">
          Customize your pool game simulation experience to match your preferences
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

        {/* Tabs navigation */}
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          centered
        >
          <Tab
            icon={<TuneIcon />}
            label="Game Settings"
            iconPosition="start"
          />
          <Tab
            icon={<SpeedIcon />}
            label="Physics Settings"
            iconPosition="start"
          />
          <Tab
            icon={<PaletteIcon />}
            label="Appearance"
            iconPosition="start"
          />
          <Tab
            icon={<PersonIcon />}
            label="Account"
            iconPosition="start"
          />
        </StyledTabs>

        {/* Game Settings Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <SettingCard>
                <CardContent sx={{ p: 3 }}>
                  <SettingCardTitle>
                    <SportsIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="h6">Player Settings</Typography>
                  </SettingCardTitle>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" gutterBottom>Player Skill Level</Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="player-level-label">Skill Level</InputLabel>
                      <Select
                        labelId="player-level-label"
                        value={playerLevel}
                        label="Skill Level"
                        onChange={(e) => setPlayerLevel(e.target.value)}
                      >
                        <MenuItem value="beginner">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmojiObjectsIcon sx={{ color: '#ff9f1c', mr: 1 }} />
                            Beginner
                          </Box>
                        </MenuItem>
                        <MenuItem value="intermediate">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <SportsIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                            Intermediate
                          </Box>
                        </MenuItem>
                        <MenuItem value="expert">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmojiEventsIcon sx={{ color: '#e63946', mr: 1 }} />
                            Expert
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>

                    <Typography variant="body2" color="text.secondary">
                      Skill level affects shot accuracy, simulation physics, and shot suggestions.
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>Default Simulation Speed</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SpeedIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                      <Slider
                        value={defaultSimulationSpeed}
                        onChange={(e, value) => setDefaultSimulationSpeed(value)}
                        step={0.1}
                        min={0.1}
                        max={3}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}x`}
                        sx={{
                          mx: 2,
                          color: theme.palette.primary.main,
                          '& .MuiSlider-thumb': {
                            width: 24,
                            height: 24,
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ minWidth: 40 }}>
                        {defaultSimulationSpeed}x
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </SettingCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <SettingCard>
                <CardContent sx={{ p: 3 }}>
                  <SettingCardTitle>
                    <VisibilityIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="h6">Display Settings</Typography>
                  </SettingCardTitle>

                  <Box sx={{ mb: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showTrajectories}
                          onChange={(e) => setShowTrajectories(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Show Ball Trajectories"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                      Display path traces of ball movement during simulation
                    </Typography>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={showShotSuggestions}
                          onChange={(e) => setShowShotSuggestions(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Show Shot Suggestions"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                      Show AI-powered shot suggestions based on ball positions
                    </Typography>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={enableSounds}
                          onChange={(e) => setEnableSounds(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Enable Sound Effects"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      Play realistic ball collision and pocket sounds
                    </Typography>
                  </Box>
                </CardContent>
              </SettingCard>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RestartAltIcon />}
              onClick={handleResetSettings}
              sx={{ borderRadius: 8 }}
            >
              Reset to Default
            </Button>
            <ActionButton
              onClick={handleSaveSettings}
              startIcon={<SaveIcon />}
            >
              Save Settings
            </ActionButton>
          </Box>
        </TabPanel>

        {/* Physics Settings Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <SettingCard>
                <CardContent sx={{ p: 3 }}>
                  <SettingCardTitle>
                    <SportsIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="h6">Table Physics</Typography>
                  </SettingCardTitle>

                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Table Friction</Typography>
                      <Tooltip title="Lower values mean less friction (balls roll further)">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                        Slippery
                      </Typography>
                      <Slider
                        value={tableFriction}
                        onChange={(e, value) => setTableFriction(value)}
                        step={0.01}
                        min={0.90}
                        max={0.99}
                        valueLabelDisplay="auto"
                        sx={{
                          mx: 2,
                          color: theme.palette.primary.main
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                        Grippy
                      </Typography>
                    </Box>
                    <Typography variant="body2" align="center" sx={{ mb: 3 }}>
                      {tableFriction.toFixed(2)}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Ball Restitution</Typography>
                      <Tooltip title="Higher values mean more bouncy collisions">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                        Less Bounce
                      </Typography>
                      <Slider
                        value={ballRestitution}
                        onChange={(e, value) => setBallRestitution(value)}
                        step={0.05}
                        min={0.5}
                        max={1.0}
                        valueLabelDisplay="auto"
                        sx={{
                          mx: 2,
                          color: theme.palette.primary.main
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                        More Bounce
                      </Typography>
                    </Box>
                    <Typography variant="body2" align="center">
                      {ballRestitution.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </SettingCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <SettingCard>
                <CardContent sx={{ p: 3 }}>
                  <SettingCardTitle>
                    <InfoIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="h6">Physics Information</Typography>
                  </SettingCardTitle>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" paragraph>
                      These settings control the physics simulation of the pool game. Adjustments will affect how the balls move and interact:
                    </Typography>

                    <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2 }}>Table Friction</Typography>
                    <Typography variant="body2" paragraph>
                      Controls how quickly balls slow down as they roll across the table. Higher values make balls stop sooner, simulating a feltier surface.
                    </Typography>

                    <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2 }}>Ball Restitution</Typography>
                    <Typography variant="body2" paragraph>
                      Determines how much energy is preserved during collisions. Higher values create more elastic, bouncy collisions between balls and cushions.
                    </Typography>

                    <Typography variant="body2" paragraph sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                      Note: Extreme values may produce unrealistic results. The default settings are calibrated for realistic pool physics.
                    </Typography>
                  </Box>
                </CardContent>
              </SettingCard>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RestartAltIcon />}
              onClick={handleResetSettings}
              sx={{ borderRadius: 8 }}
            >
              Reset to Default
            </Button>
            <ActionButton
              onClick={handleSaveSettings}
              startIcon={<SaveIcon />}
            >
              Save Settings
            </ActionButton>
          </Box>
        </TabPanel>

        {/* Appearance Settings Tab (NEW) */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <SettingCard>
                <CardContent sx={{ p: 3 }}>
                  <SettingCardTitle>
                    <PaletteIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="h6">Theme Settings</Typography>
                  </SettingCardTitle>

                  <Typography variant="body2" paragraph>
                    Choose how you want your app to look. You can select a light or dark theme, or let it match your system settings.
                  </Typography>

                  {/* Theme Mode Selection */}
                  <DarkModeToggleGroup>
                    <DarkModeToggleButton 
                      active={themeMode === 'light'}
                      onClick={() => handleThemeModeChange('light')}
                      sx={{ flex: 1 }}
                    >
                      <WbSunnyIcon sx={{ mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2">Light</Typography>
                    </DarkModeToggleButton>
                    
                    <DarkModeToggleButton 
                      active={themeMode === 'auto'}
                      onClick={() => handleThemeModeChange('auto')}
                      sx={{ flex: 1 }}
                    >
                      <SettingsIcon sx={{ mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2">Auto</Typography>
                    </DarkModeToggleButton>
                    
                    <DarkModeToggleButton 
                      active={themeMode === 'manual' && theme.palette.mode === 'dark'}
                      onClick={() => handleThemeModeChange('manual')}
                      sx={{ flex: 1 }}
                    >
                      <NightlightIcon sx={{ mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2">Dark</Typography>
                    </DarkModeToggleButton>
                  </DarkModeToggleGroup>

                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                    {themeMode === 'auto' 
                      ? 'Theme will match your system preferences' 
                      : themeMode === 'manual' 
                        ? 'Theme is set manually' 
                        : 'Theme is set to always light'}
                  </Typography>

                  {/* Theme Previews */}
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2, mt: 3 }}>
                    Preview & Select
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <ThemePreviewCard 
                        mode="light"
                        onClick={() => handleThemePreviewClick('light')}
                      >
                        <ThemePreviewHeader mode="light">
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', fontSize: '10px' }}>
                            Pool Simulation
                          </Typography>
                        </ThemePreviewHeader>
                        <ThemePreviewContent mode="light">
                          <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '8px', color: '#212121' }}>
                            Light Theme
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '6px', color: '#757575' }}>
                            Clear, bright interface for daytime use
                          </Typography>
                          <PreviewButton mode="light">
                            Button
                          </PreviewButton>
                        </ThemePreviewContent>
                      </ThemePreviewCard>
                    </Grid>
                    <Grid item xs={6}>
                      <ThemePreviewCard 
                        mode="dark"
                        onClick={() => handleThemePreviewClick('dark')}
                      >
                        <ThemePreviewHeader mode="dark">
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', fontSize: '10px' }}>
                            Pool Simulation
                          </Typography>
                        </ThemePreviewHeader>
                        <ThemePreviewContent mode="dark">
                          <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '8px', color: '#e0e0e0' }}>
                            Dark Theme
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '6px', color: '#aaaaaa' }}>
                            Reduces eye strain in low light conditions
                          </Typography>
                          <PreviewButton mode="dark">
                            Button
                          </PreviewButton>
                        </ThemePreviewContent>
                      </ThemePreviewCard>
                    </Grid>
                  </Grid>

                  {/* Dark Mode Switch */}
                  <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      {theme.palette.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </Typography>
                    <Switch
                      checked={theme.palette.mode === 'dark'}
                      onChange={handleDarkModeToggle}
                      color="primary"
                      icon={<Brightness7Icon />}
                      checkedIcon={<Brightness4Icon />}
                    />
                  </Box>
                </CardContent>
              </SettingCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <SettingCard>
                <CardContent sx={{ p: 3 }}>
                  <SettingCardTitle>
                    <VisibilityIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="h6">Display Settings</Typography>
                  </SettingCardTitle>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" paragraph>
                      Dark mode helps reduce eye strain by using darker colours and can save battery on devices with OLED screens.
                    </Typography>

                    <Box sx={{ 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', 
                      p: 2, 
                      borderRadius: 2,
                      mb: 3
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <InfoIcon sx={{ fontSize: '1rem', mr: 1, color: theme.palette.primary.main }} />
                        Benefits of Dark Mode:
                      </Typography>
                      <ul style={{ marginTop: 8, marginBottom: 8, paddingLeft: 20 }}>
                        <li>
                          <Typography variant="body2">Reduces eye strain in low-light environments</Typography>
                        </li>
                        <li>
                          <Typography variant="body2">Can save battery life on OLED screens</Typography>
                        </li>
                        <li>
                          <Typography variant="body2">Provides a more immersive gaming experience</Typography>
                        </li>
                      </ul>
                    </Box>

                    <Typography variant="body2" paragraph>
                      <strong>Auto Theme:</strong> When set to "Auto", the app will automatically switch between light and dark mode based on your system preferences.
                    </Typography>

                    <Typography variant="body2" paragraph>
                      <strong>Manual Selection:</strong> Choose either light or dark mode manually to override your system settings.
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="body2" paragraph sx={{ mb: 4 }}>
                    Your theme preference is saved and will be applied whenever you return to the application.
                  </Typography>
                </CardContent>
              </SettingCard>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <ActionButton
              onClick={handleSaveSettings}
              startIcon={<SaveIcon />}
            >
              Save Appearance Settings
            </ActionButton>
          </Box>
        </TabPanel>

        {/* Account Settings Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <SettingCard>
                <CardContent sx={{ p: 3 }}>
                  <SettingCardTitle>
                    <PersonIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="h6">Account Information</Typography>
                  </SettingCardTitle>

                  <Box sx={{ mb: 4 }}>
                    <TextField
                      label="Email Address"
                      variant="outlined"
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      sx={{ mb: 3 }}
                    />

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>Change Password</Typography>

                    <TextField
                      label="Current Password"
                      type="password"
                      variant="outlined"
                      fullWidth
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      label="New Password"
                      type="password"
                      variant="outlined"
                      fullWidth
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      label="Confirm New Password"
                      type="password"
                      variant="outlined"
                      fullWidth
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={newPassword !== confirmPassword && newPassword !== '' && confirmPassword !== ''}
                      helperText={newPassword !== confirmPassword && newPassword !== '' && confirmPassword !== '' ? "Passwords don't match" : ""}
                    />
                  </Box>
                </CardContent>
              </SettingCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <SettingCard>
                <CardContent sx={{ p: 3 }}>
                  <SettingCardTitle>
                    <NotificationsIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="h6">Notification Preferences</Typography>
                  </SettingCardTitle>

                  <Box sx={{ mb: 3 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked color="primary" />}
                      label="Email Notifications"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                      Receive emails about simulation results and tips
                    </Typography>

                    <FormControlLabel
                      control={<Switch defaultChecked color="primary" />}
                      label="Weekly Digest"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                      Get a weekly summary of your practice progress
                    </Typography>

                    <FormControlLabel
                      control={<Switch color="primary" />}
                      label="New Feature Announcements"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      Be notified about new app features and updates
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <SettingCardTitle>
                    <SettingsIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="h6">Advanced Settings</Typography>
                  </SettingCardTitle>
                  <Box>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      sx={{ mt: 2, borderRadius: 8 }}
                    >
                      Reset Account Data
                    </Button>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      This will delete all your saved simulations and settings
                    </Typography>
                  </Box>
                </CardContent>
              </SettingCard>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <ActionButton
              onClick={handleSaveAccount}
              startIcon={<SaveIcon />}
            >
              Save Account Settings
            </ActionButton>
          </Box>
        </TabPanel>
      </Container>
    </Box>
  );
}