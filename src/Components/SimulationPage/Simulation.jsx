import React, { useState, useEffect, useRef } from 'react';
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
import HomeIcon from '@mui/icons-material/Home';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 280;

export default function SimulationPage() {
    const location = useLocation();
    const path = location.pathname;
    const navigate = useNavigate();

    // State Variables
    const [processedImage, setProcessedImage] = useState(null);
    const [ballPositions, setBallPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const imageRef = useRef(null);
    const [imageSize, setImageSize] = useState({ width: 1, height: 1 });

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
                setBallPositions(result.ball_positions);
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
                        Simulation Page
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
                            <ListItem key={item.text} disablePadding sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}>
                                <ListItemButton
                                    component={Link}
                                    to={item.link}
                                    selected={item.link === path}
                                    sx={{
                                        '&.Mui-selected': {
                                            backgroundColor: '#1565C0',
                                            color: '#fff',
                                            '&:hover': { backgroundColor: '#0d47a1' },
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ color: item.link === path ? '#fff' : '#000' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} sx={{ color: item.link === path ? '#fff' : '#000' }} />
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
                                '&:hover': { backgroundColor: '#B71C1C' },
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
                <Typography variant="h4">Welcome to the Simulation Page!</Typography>

                {loading ? (
                    <Typography>Loading simulation...</Typography>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : processedImage ? (
                    <div style={{ position: 'relative', display: 'inline-block', marginTop: '20px' }}>
                        {/* Processed Image */}
                        <img
                            ref={imageRef}
                            key={processedImage} // Force re-render when image changes
                            src={processedImage} // ✅ Now correctly showing the processed image
                            alt="Processed Pool Table"
                            style={{ width: '100%', borderRadius: '8px', marginTop: '20px' }}
                            onLoad={handleImageLoad}
                            onError={(e) => console.error("❌ Image failed to load:", e.target.src)}
                        />

                        {/* Overlay Balls */}
                        {ballPositions.map((ball, index) => (
                            <div
                                key={index}
                                style={{
                                    position: 'absolute',
                                    top: `${(ball.y / imageSize.height) * 100}%`,
                                    left: `${(ball.x / imageSize.width) * 100}%`,
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: ball.color,
                                    borderRadius: '50%',
                                    border: '2px solid white',
                                    transform: 'translate(-50%, -50%)',
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <Typography>No processed image available.</Typography>
                )}
            </Box>
        </Box>
    );
}
