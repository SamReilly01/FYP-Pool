import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';

// Icons
import SportsIcon from '@mui/icons-material/Sports';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';

const ShotHistoryPanel = ({ gameLog, onClose, ballGroups }) => {
  // Filter and limit the log entries to the most recent 20
  const recentLogs = gameLog.slice(-20).reverse();
  
  // Helper function to get colour for player avatar
  const getPlayerColor = (player) => {
    if (!ballGroups || !ballGroups[player]) return '#6930c3';  
    
    return ballGroups[player] === 'red' ? '#f44336' : '#ffeb3b';
  };
  
  // Helper function to get text colour for player avatar
  const getPlayerTextColor = (player) => {
    if (!ballGroups || !ballGroups[player]) return 'white'; 
    
    return ballGroups[player] === 'yellow' ? 'black' : 'white';
  };
  
  // Helper function to determine icon for log entry
  const getLogEntryIcon = (entry) => {
    const eventText = entry.event.toLowerCase();
    
    if (eventText.includes('foul')) {
      return <ErrorIcon sx={{ color: '#f44336' }} />;
    } else if (eventText.includes('pocketed')) {
      return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
    } else if (eventText.includes('win')) {
      return <FlagIcon sx={{ color: '#ff9800' }} />;
    } else {
      return <SportsIcon sx={{ color: '#6930c3' }} />;
    }
  };
  
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        mb: 2,
        position: 'relative',
        maxHeight: 400,
        overflow: 'auto'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <SportsIcon sx={{ mr: 1, color: '#6930c3', fontSize: '1.1rem' }} />
          Shot History
          <Tooltip title="See a history of all moves in the game">
            <IconButton size="small" sx={{ ml: 1 }}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        
        {onClose && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      
      <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
        {recentLogs.length === 0 ? (
          <ListItem>
            <ListItemText 
              primary="No shots taken yet"
              secondary="Game history will appear here"
            />
          </ListItem>
        ) : (
          recentLogs.map((entry, index) => (
            <React.Fragment key={index}>
              {index !== 0 && <Divider component="li" />}
              <ListItem
                alignItems="flex-start"
                sx={{
                  '&:hover': {
                    bgcolor: alpha('#6930c3', 0.04)
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      bgcolor: getPlayerColor(entry.player),
                      color: getPlayerTextColor(entry.player),
                      width: 35,
                      height: 35,
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}
                  >
                    P{entry.player}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getLogEntryIcon(entry)}
                      <Typography
                        sx={{ ml: 1, fontWeight: 500 }}
                        variant="body2"
                      >
                        {entry.event}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </Typography>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))
        )}
      </List>
    </Paper>
  );
};

export default ShotHistoryPanel;