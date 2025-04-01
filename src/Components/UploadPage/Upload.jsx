import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

// Icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsIcon from '@mui/icons-material/Sports';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';


const user_id = localStorage.getItem('user_id');

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

// New styled components for the dialog
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    padding: theme.spacing(2),
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    maxWidth: 500,
  },
}));

const DialogHeader = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(90deg, #5e60ce 0%, #6930c3 100%)',
  color: 'white',
  padding: theme.spacing(3),
  borderRadius: '16px 16px 0 0',
  textAlign: 'center',
}));

const LevelCard = styled(Box)(({ theme, selected }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  border: selected ? '2px solid #6930c3' : '2px solid transparent',
  backgroundColor: selected ? 'rgba(105, 48, 195, 0.1)' : 'transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: selected ? 'rgba(105, 48, 195, 0.15)' : 'rgba(0, 0, 0, 0.04)',
  },
}));

export default function UploadPage() {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  
  // Function to check active route
  const isActive = (route) => path === route;
  
  // State for image upload
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  // New state for player level dialog
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('intermediate');
  
  // Add the missing handleLevelSelection function
  const handleLevelSelection = (level) => {
    setSelectedLevel(level);
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };
  
  const handleProceed = async () => {
    if (!imageFile) {
      alert('Please upload an image first.');
      return;
    }
  
    // Open the player level selection dialog instead of proceeding immediately
    setLevelDialogOpen(true);
  };
  
  const handleLevelConfirm = async () => {
    // Close the dialog
    setLevelDialogOpen(false);
    
    try {
      // Get user_id from localStorage
      const userId = localStorage.getItem('user_id');
      
      const formData = new FormData();
      formData.append('image', imageFile);
      // Add the selected level to form data
      formData.append('playerLevel', selectedLevel);
      // Add user_id to form data if available
      if (userId) {
        formData.append('user_id', userId);
      }
  
      const response = await fetch('http://localhost:5000/api/image/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
  
      const result = await response.json();
      console.log('✅ Image uploaded successfully:', result);
      
      // Store level and image path in localStorage
      localStorage.setItem('uploadedImagePath', result.image_url);
      localStorage.setItem('playerLevel', selectedLevel);
      navigate('/simulation');
    } catch (err) {
      console.error('❌ Error in handleLevelConfirm:', err);
      alert('An error occurred while uploading the image.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
          Upload Pool Table Image
        </MainHeading>
        <SubHeading variant="body1">
          Take a photo or upload an existing image to begin your pool game analysis
        </SubHeading>
      </Header>
      
      <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%',
                border: '2px dashed #ccc',
                borderRadius: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                cursor: 'pointer',
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" style={{ width: '100%', height: '100%', cursor: 'pointer', textAlign: 'center' }}>
                <CloudUploadIcon sx={{ fontSize: 60, color: '#6930c3', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Drag & Drop Image Here
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                  Supports: JPG, PNG, HEIC (max 10MB)
                </Typography>
                <ActionButton variant="contained" component="span">
                  Browse Files
                </ActionButton>
              </label>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 4,
              bgcolor: '#f8f9fa',
              display: 'flex',
              flexDirection: 'column',
              p: 3
            }}>
              <Typography variant="h6" gutterBottom>
                Image Preview
              </Typography>
              <Box sx={{ 
                flex: 1,
                bgcolor: '#e9ecef',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                minHeight: 250,
                overflow: 'hidden'
              }}>
                {image ? (
                  <img 
                    src={image} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                  />
                ) : (
                  <Typography color="textSecondary">
                    Preview will appear here
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <ActionButton 
                  onClick={handleProceed}
                  disabled={!image}
                >
                  Proceed to Simulation
                </ActionButton>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* Player Level Selection Dialog */}
      <StyledDialog
        open={levelDialogOpen}
        onClose={() => setLevelDialogOpen(false)}
        aria-labelledby="player-level-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogHeader id="player-level-dialog-title">
          <Typography variant="h5" component="div">
            What's your Pool Playing Level?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            We'll adjust our simulation and recommendations based on your skill level
          </Typography>
        </DialogHeader>
        
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <LevelCard 
                selected={selectedLevel === 'beginner'}
                onClick={() => handleLevelSelection('beginner')}
              >
                <EmojiObjectsIcon sx={{ fontSize: 40, color: '#ff9f1c', mb: 1 }} />
                <Typography variant="h6" gutterBottom align="center">
                  Beginner
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  New to the game or play occasionally
                </Typography>
              </LevelCard>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <LevelCard 
                selected={selectedLevel === 'intermediate'}
                onClick={() => handleLevelSelection('intermediate')}
              >
                <SportsIcon sx={{ fontSize: 40, color: '#6930c3', mb: 1 }} />
                <Typography variant="h6" gutterBottom align="center">
                  Intermediate
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  Play regularly with good understanding of the game
                </Typography>
              </LevelCard>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <LevelCard 
                selected={selectedLevel === 'expert'}
                onClick={() => handleLevelSelection('expert')}
              >
                <EmojiEventsIcon sx={{ fontSize: 40, color: '#e63946', mb: 1 }} />
                <Typography variant="h6" gutterBottom align="center">
                  Expert
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  Competitive player with advanced skills
                </Typography>
              </LevelCard>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button 
            onClick={() => setLevelDialogOpen(false)}
            sx={{ 
              color: '#6930c3', 
              borderRadius: 5,
              px: 3,
              mr: 2,
              border: '1px solid #6930c3'
            }}
          >
            Cancel
          </Button>
          <ActionButton onClick={handleLevelConfirm}>
            Confirm & Continue
          </ActionButton>
        </DialogActions>
      </StyledDialog>
    </Box>
  );
}