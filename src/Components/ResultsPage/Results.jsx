import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SportsIcon from '@mui/icons-material/Sports';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
//import SportsPoolIcon from '@mui/icons-material/SportsPool';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FolderIcon from '@mui/icons-material/Folder';

// Styled components - same as other components
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

const EmptyStateCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  backgroundColor: '#f8f9fa',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
}));

const SimulationCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
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
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ResultsPage() {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  // Get user_id from localStorage
  const user_id = localStorage.getItem('user_id');

  // State variables
  const [activeTab, setActiveTab] = useState(0);
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [simulationToDelete, setSimulationToDelete] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Function to check active route
  const isActive = (route) => path === route;

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

  // Fetch simulations from API
  useEffect(() => {
    const fetchSimulations = async () => {
      // Get user_id from localStorage
      const userId = localStorage.getItem('user_id');

      if (!userId) {
        setLoading(false);
        setError('You must be logged in to view results');
        return;
      }

      try {
        setLoading(true);
        // Update the API URL to match the server route correctly
        const response = await fetch(`http://localhost:5000/api/results/user/${userId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch simulation results');
        }

        const data = await response.json();

        // Make sure we're handling the data structure correctly
        if (!data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid data format received from server');
        }

        // Sort by created_at (newest first)
        const sortedSimulations = data.data.sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );

        setSimulations(sortedSimulations);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching simulations:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchSimulations();
  }, []);

  // Make sure user authentication is set up properly
  // Add this function to set user authentication on login
  const setUserAuthentication = (userData) => {
    if (userData && userData.user_id) {
      localStorage.setItem('user_id', userData.user_id);
      // You can also store token if using JWT
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle view simulation details
  const handleViewDetails = (simulation) => {
    setSelectedSimulation(simulation);
    setDetailDialogOpen(true);
  };

  // Handle simulation replay with option to continue from last state
  const handleReplaySimulation = (simulation, continueFromLastState = true) => {
    try {
      // Create a deep copy to avoid mutation issues
      const modifiedSimulation = JSON.parse(JSON.stringify(simulation));
      
      if (continueFromLastState) {
        console.log("Directly replacing initial_positions with ball_positions for continuation");
        modifiedSimulation.initial_positions = modifiedSimulation.ball_positions;
      }
      
      // Store the modified simulation in localStorage
      localStorage.setItem('replaySimulation', JSON.stringify(modifiedSimulation));
      
      
      // Navigate to simulation page
      navigate('/simulation');
    } catch (error) {
      console.error("Error preparing simulation for replay:", error);
      showNotification("Error preparing simulation. Please try again.", "error");
    }
  };

  // Handle delete simulation
  const handleDeleteSimulation = async () => {
    if (!simulationToDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/results/${simulationToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete simulation');
      }

      // Remove deleted simulation from state
      setSimulations(simulations.filter(sim => sim.id !== simulationToDelete.id));
      showNotification('Simulation deleted successfully', 'success');

      // Close dialog
      setDeleteDialogOpen(false);
      setSimulationToDelete(null);
    } catch (error) {
      console.error('Error deleting simulation:', error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (simulation) => {
    setSimulationToDelete(simulation);
    setDeleteDialogOpen(true);
  };

  // Get the appropriate level icon
  const getLevelIcon = (level) => {
    switch (level) {
      case 'beginner':
        return <EmojiObjectsIcon fontSize="small" />;
      case 'expert':
        return <EmojiEventsIcon fontSize="small" />;
      case 'intermediate':
      default:
        return <SportsIcon fontSize="small" />;
    }
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(6).fill().map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
        <Card sx={{ height: '100%', borderRadius: 2 }}>
          <Skeleton variant="rectangular" height={160} />
          <CardContent>
            <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} width="60%" />
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 4 }} />
            </Box>
          </CardContent>
          <Box sx={{ mt: 'auto', p: 2, pt: 0 }}>
            <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 5 }} />
          </Box>
        </Card>
      </Grid>
    ));
  };

  // Render empty state
  const renderEmptyState = () => {
    return (
      <Grid item xs={12}>
        <EmptyStateCard>
          <FolderIcon sx={{ fontSize: 60, color: '#6930c3', mb: 2, opacity: 0.6 }} />
          <Typography variant="h5" gutterBottom>
            No Saved Simulations Yet
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: 500 }}>
            You haven't saved any pool game simulations. Run a simulation and save the results to see them here.
          </Typography>
          <ActionButton
            onClick={() => navigate('/upload')}
            startIcon={<AddPhotoAlternateIcon />}
          >
            Upload a Pool Table Image
          </ActionButton>
        </EmptyStateCard>
      </Grid>
    );
  };

  // Render simulation cards
  const renderSimulationCards = () => {
    if (simulations.length === 0) {
      return renderEmptyState();
    }

    return simulations.map((simulation) => {
      // Parse the JSON strings
      const ballPositions = typeof simulation.ball_positions === 'string'
        ? JSON.parse(simulation.ball_positions)
        : simulation.ball_positions;

      const pocketedBalls = typeof simulation.pocketed_balls === 'string'
        ? JSON.parse(simulation.pocketed_balls)
        : simulation.pocketed_balls || [];

      return (
        <Grid item xs={12} sm={6} md={4} key={simulation.id}>
          <SimulationCard>
            <CardMedia
              component="img"
              height="160"
              image={simulation.image_url}
              alt={simulation.simulation_name}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ pb: 1 }}>
              <Typography variant="h6" noWrap gutterBottom>
                {simulation.simulation_name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DateRangeIcon sx={{ fontSize: '0.9rem', color: 'text.secondary', mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(simulation.created_at)}
                </Typography>
              </Box>

              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <LevelChip
                  level={simulation.player_level}
                  label={simulation.player_level.charAt(0).toUpperCase() + simulation.player_level.slice(1)}
                  size="small"
                  icon={getLevelIcon(simulation.player_level)}
                />

                <Tooltip title="Pocketed Balls">
                  <Chip
                    size="small"
                    //icon={<SportsPoolIcon fontSize="small" />}
                    label={pocketedBalls?.length || 0}
                    variant="outlined"
                  />
                </Tooltip>
              </Box>
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0, mt: 'auto' }}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => handleReplaySimulation(simulation, true)}
                    sx={{ borderRadius: 5 }}
                  >
                    Continue Simulation
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    //startIcon={<RestartAltIcon />}
                    onClick={() => handleReplaySimulation(simulation, false)}
                    sx={{ borderRadius: 5, mt: 1 }}
                  >
                    Restart Simulation
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetails(simulation)}
                    sx={{ borderRadius: 5 }}
                  >
                    Details
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => openDeleteDialog(simulation)}
                    sx={{ borderRadius: 5 }}
                  >
                    Delete
                  </Button>
                </Grid>
              </Grid>
            </CardActions>
          </SimulationCard>
        </Grid>
      );
    });
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
          Your Simulation Results
        </MainHeading>
        <SubHeading variant="body1">
          View, replay, and manage your saved pool game simulations
        </SubHeading>
      </Header>

      <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {!user_id ? (
          <Card sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Login Required
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              You need to be logged in to view your saved simulations.
            </Typography>
            <ActionButton onClick={() => navigate('/')}>
              Go to Login
            </ActionButton>
          </Card>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  '.MuiTabs-indicator': {
                    backgroundColor: '#6930c3',
                  },
                }}
                centered
              >
                <Tab
                  label="All Simulations"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'bold',
                    '&.Mui-selected': {
                      color: '#6930c3',
                    }
                  }}
                />
                <Tab
                  label="Recent"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'bold',
                    '&.Mui-selected': {
                      color: '#6930c3',
                    }
                  }}
                />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={3}>
                {loading ? renderSkeletons() : renderSimulationCards()}
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={3}>
                {loading ? renderSkeletons() : (
                  simulations.length > 0
                    ? simulations.slice(0, 6).map((simulation) => {
                      // Parse the JSON strings
                      const ballPositions = typeof simulation.ball_positions === 'string'
                        ? JSON.parse(simulation.ball_positions)
                        : simulation.ball_positions;

                      const pocketedBalls = typeof simulation.pocketed_balls === 'string'
                        ? JSON.parse(simulation.pocketed_balls)
                        : simulation.pocketed_balls || [];

                      return (
                        <Grid item xs={12} sm={6} md={4} key={simulation.id}>
                          <SimulationCard>
                            <CardMedia
                              component="img"
                              height="160"
                              image={simulation.image_url}
                              alt={simulation.simulation_name}
                              sx={{ objectFit: 'cover' }}
                            />
                            <CardContent sx={{ pb: 1 }}>
                              <Typography variant="h6" noWrap gutterBottom>
                                {simulation.simulation_name}
                              </Typography>

                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <DateRangeIcon sx={{ fontSize: '0.9rem', color: 'text.secondary', mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(simulation.created_at)}
                                </Typography>
                              </Box>

                              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <LevelChip
                                  level={simulation.player_level}
                                  label={simulation.player_level.charAt(0).toUpperCase() + simulation.player_level.slice(1)}
                                  size="small"
                                  icon={getLevelIcon(simulation.player_level)}
                                />

                                <Tooltip title="Pocketed Balls">
                                  <Chip
                                    size="small"
                                    //icon={<SportsPoolIcon fontSize="small" />}
                                    label={pocketedBalls?.length || 0}
                                    variant="outlined"
                                  />
                                </Tooltip>
                              </Box>
                            </CardContent>

                            <CardActions sx={{ p: 2, pt: 0, mt: 'auto' }}>
                              <Grid container spacing={1}>
                                <Grid item xs={12}>
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    startIcon={<PlayArrowIcon />}
                                    onClick={() => handleReplaySimulation(simulation)}
                                    sx={{ borderRadius: 5 }}
                                  >
                                    Replay Simulation
                                  </Button>
                                </Grid>
                                <Grid item xs={6}>
                                  <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => handleViewDetails(simulation)}
                                    sx={{ borderRadius: 5 }}
                                  >
                                    Details
                                  </Button>
                                </Grid>
                                <Grid item xs={6}>
                                  <Button
                                    fullWidth
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => openDeleteDialog(simulation)}
                                    sx={{ borderRadius: 5 }}
                                  >
                                    Delete
                                  </Button>
                                </Grid>
                              </Grid>
                            </CardActions>
                          </SimulationCard>
                        </Grid>
                      );
                    })
                    : renderEmptyState()
                )}
              </Grid>
            </TabPanel>
          </>
        )}
      </Container>

      {/* Simulation Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        {selectedSimulation && (
          <>
            <DialogTitle sx={{
              background: 'linear-gradient(90deg, #5e60ce 0%, #6930c3 100%)',
              color: 'white',
              py: 2
            }}>
              <Typography variant="h5">{selectedSimulation.simulation_name}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {formatDate(selectedSimulation.created_at)}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={selectedSimulation.image_url}
                      alt="Simulation"
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: 8,
                        border: '1px solid #eee'
                      }}
                    />
                    <LevelChip
                      level={selectedSimulation.player_level}
                      label={selectedSimulation.player_level.charAt(0).toUpperCase() + selectedSimulation.player_level.slice(1)}
                      size="small"
                      icon={getLevelIcon(selectedSimulation.player_level)}
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Simulation Details
                  </Typography>

                  <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Created:</strong> {formatDate(selectedSimulation.created_at)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Player Level:</strong> {selectedSimulation.player_level.charAt(0).toUpperCase() + selectedSimulation.player_level.slice(1)}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    {(() => {
                      // Parse ball positions and pocketed balls
                      const pocketedBalls = typeof selectedSimulation.pocketed_balls === 'string'
                        ? JSON.parse(selectedSimulation.pocketed_balls)
                        : selectedSimulation.pocketed_balls || [];

                      const initialPositions = typeof selectedSimulation.initial_positions === 'string'
                        ? JSON.parse(selectedSimulation.initial_positions)
                        : selectedSimulation.initial_positions;

                      // Count balls by colour
                      const ballCounts = {};
                      if (initialPositions && Array.isArray(initialPositions)) {
                        initialPositions.forEach(ball => {
                          if (!ballCounts[ball.color]) {
                            ballCounts[ball.color] = 0;
                          }
                          ballCounts[ball.color]++;
                        });
                      }

                      return (
                        <>
                          <Typography variant="body2" gutterBottom>
                            <strong>Ball Statistics:</strong>
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                            {Object.entries(ballCounts).map(([color, count]) => (
                              <Chip
                                key={color}
                                size="small"
                                label={`${color.charAt(0).toUpperCase() + color.slice(1)}: ${count}`}
                                sx={{
                                  backgroundColor: color === 'white' ? '#f5f5f5' :
                                    color === 'red' ? '#ffcdd2' :
                                      color === 'black' ? '#212121' :
                                        color === 'yellow' ? '#fff9c4' : '#e0e0e0',
                                  color: color === 'black' ? 'white' : 'rgba(0,0,0,0.7)',
                                  border: '1px solid #ddd'
                                }}
                              />
                            ))}
                          </Box>

                          <Typography variant="body2" gutterBottom>
                            <strong>Pocketed Balls:</strong> {pocketedBalls.length}
                          </Typography>

                          {pocketedBalls.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                              {pocketedBalls.map((ball, idx) => (
                                <Avatar
                                  key={idx}
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    fontSize: '0.75rem',
                                    backgroundColor: ball.color === 'white' ? '#fff' :
                                      ball.color === 'black' ? '#000' :
                                        ball.color === 'red' ? '#f44336' :
                                          '#ffeb3b',
                                    color: ball.color === 'white' || ball.color === 'yellow' ? '#000' : '#fff',
                                    border: ball.color === 'white' ? '1px solid #ddd' : 'none'
                                  }}
                                >
                                  {(ball.color === 'red' || ball.color === 'yellow') && ball.number && (
                                    <Typography variant="caption">
                                      {ball.number}
                                    </Typography>
                                  )}
                                </Avatar>
                              ))}
                            </Box>
                          )} <Divider sx={{ my: 1.5 }} />

                          <Typography variant="body2" color="text.secondary">
                            <strong>Success Rate:</strong> {
                              pocketedBalls.length > 0 && Object.keys(ballCounts).length > 0 ?
                                `${Math.round((pocketedBalls.length / (Object.values(ballCounts).reduce((a, b) => a + b, 0) - (ballCounts.white || 0))) * 100)}%` :
                                'No balls pocketed yet'
                            }
                          </Typography>
                        </>
                      );
                    })()}
                  </Paper>

                  <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      fullWidth
                      onClick={() => {
                        handleReplaySimulation(selectedSimulation);
                        setDetailDialogOpen(false);
                      }}
                      sx={{ borderRadius: 5 }}
                    >
                      Replay Simulation
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setDetailDialogOpen(false);
                  openDeleteDialog(selectedSimulation);
                }}
                sx={{ mr: 'auto', borderRadius: 5 }}
              >
                Delete
              </Button>
              <Button
                onClick={() => setDetailDialogOpen(false)}
                variant="outlined"
                sx={{ borderRadius: 5 }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the simulation "{simulationToDelete?.simulation_name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 5 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteSimulation}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 5 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}