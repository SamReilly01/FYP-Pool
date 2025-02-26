import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import HomeIcon from '@mui/icons-material/Home';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 280;

export default function UploadPage() {
    const location = useLocation();
    const path = location.pathname;
    const navigate = useNavigate();

    const [image, setImage] = useState(null); // Preview URL
    const [imageFile, setImageFile] = useState(null); // Actual file object

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file)); // Create a preview URL
            setImageFile(file); // Save the file object for API upload
        }
    };

    const handleProceed = async () => {
        if (!imageFile) {
            alert('Please upload an image first.');
            return;
        }
    
        try {
            const formData = new FormData();
            formData.append('image', imageFile); // ✅ Backend expects 'image', not 'file'
    
            const response = await fetch('http://localhost:5000/api/image/upload', {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                const error = await response.text(); // ✅ Handle non-JSON error responses
                throw new Error(error);
            }
    
            const result = await response.json();
            console.log('✅ Image uploaded successfully:', result);
    
            // ✅ Save uploaded image path to localStorage
            localStorage.setItem('uploadedImagePath', result.image_url);
    
            // ✅ Redirect to simulation page
            navigate('/simulation');
        } catch (err) {
            console.error('❌ Unexpected error in handleProceed:', err);
            alert('An unexpected error occurred while uploading the image.');
        }
    };
    
    

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: '#1565C0',
                }}
            >
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        Upload Page
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: '#f4f4f4',
                        borderRight: '1px solid #ddd',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <List>
                        {[
                            { text: 'Home', icon: <HomeIcon />, link: '/home' },
                            { text: 'Upload Image', icon: <AddPhotoAlternateIcon />, link: '/upload' },
                            { text: 'Simulation', icon: <VideogameAssetIcon />, link: '/simulation' },
                            { text: 'Results', icon: <FileDownloadDoneIcon />, link: '/results' },
                            { text: 'Settings', icon: <SettingsIcon />, link: '/settings' },
                            { text: 'Help', icon: <HelpIcon />, link: '/help' },
                            { text: 'About', icon: <InfoIcon />, link: '/about' },
                        ].map((item) => (
                            <ListItem
                                key={item.text}
                                disablePadding
                                sx={{
                                    '&:hover': {
                                        backgroundColor: '#e0e0e0',
                                    },
                                }}
                            >
                                <ListItemButton
                                    component={Link}
                                    to={item.link}
                                    selected={item.link === path}
                                    sx={{
                                        '&.Mui-selected': {
                                            backgroundColor: '#1565C0',
                                            color: '#fff',
                                            '&:hover': {
                                                backgroundColor: '#0d47a1',
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: item.link === path ? '#fff' : '#000',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        sx={{
                                            color: item.link === path ? '#fff' : '#000',
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    <Box sx={{ p: 2 }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<LogoutIcon />}
                            fullWidth
                            sx={{
                                backgroundColor: '#D32F2F',
                                '&:hover': {
                                    backgroundColor: '#B71C1C',
                                },
                            }}
                            onClick={() => {
                                console.log('Logging out...');
                                navigate('/');
                            }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#fafafa' }}>
                <Toolbar />
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12}>
                        <Typography variant="h4" align="center">
                            Upload Your Pool Table Image
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={3}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 400,
                                border: '2px dashed #ccc',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                            }}
                        >
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                            <label
                                htmlFor="image-upload"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    width: '100%',
                                    cursor: 'pointer',
                                }}
                            >
                                <Typography>Click to Upload or Drag and Drop</Typography>
                            </label>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={3}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 400,
                                backgroundColor: '#f5f5f5',
                                overflow: 'hidden',
                            }}
                        >
                            {image ? (
                                <img
                                    src={image}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                    }}
                                />
                            ) : (
                                <Typography>Image Preview</Typography>
                            )}
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{
                                backgroundColor: '#1565C0',
                                color: '#fff',
                                height: 50,
                                '&:hover': { backgroundColor: '#0d47a1' },
                            }}
                            onClick={handleProceed}
                        >
                            Proceed to Simulation
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
