import React, { createContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a context for colour mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
  mode: 'light',
});

export const ThemeContextProvider = ({ children }) => {
  // Get initial mode from localStorage
  const [mode, setMode] = useState(localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light');

  useEffect(() => {
    // Update when localStorage changes
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setMode(darkMode ? 'dark' : 'light');
    
    // Add a data attribute to the HTML tag for potential global CSS selectors
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, []);

  // Colour mode toggler
  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => {
        const newMode = prevMode === 'light' ? 'dark' : 'light';
        localStorage.setItem('darkMode', newMode === 'dark');
        document.documentElement.setAttribute('data-theme', newMode);
        return newMode;
      });
    },
    mode,
  }), [mode]);

  // Theme definition 
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode palette
            primary: {
              main: '#6930c3',
              light: '#8c5bd4',
              dark: '#5e2aad',
              contrastText: '#ffffff',
            },
            secondary: {
              main: '#ff9f1c',
              light: '#ffb74d',
              dark: '#e98800',
              contrastText: '#000000',
            },
            success: {
              main: '#4caf50',
              dark: '#388e3c',
              light: '#81c784', 
            },
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
              card: '#f8f9fa',
            },
            text: {
              primary: '#212121',
              secondary: '#757575',
              disabled: '#9e9e9e',
            },
            divider: 'rgba(0, 0, 0, 0.12)',
            action: {
              active: 'rgba(0, 0, 0, 0.54)',
              hover: 'rgba(0, 0, 0, 0.04)',
              selected: 'rgba(105, 48, 195, 0.08)',
              disabled: 'rgba(0, 0, 0, 0.26)',
              disabledBackground: 'rgba(0, 0, 0, 0.12)',
            },
          }
        : {
            // Dark mode palette - more refined
            primary: {
              main: '#9575cd', // Lighter purple for dark mode
              light: '#b39ddb',
              dark: '#7e57c2',
              contrastText: '#ffffff',
            },
            secondary: {
              main: '#ffb74d', // Brighter orange for dark mode
              light: '#ffd95b',
              dark: '#f57c00',
              contrastText: '#000000',
            },
            success: {
              main: '#66bb6a',
              dark: '#43a047',
              light: '#81c784',
            },
            background: {
              default: '#121212',
              paper: '#1e1e1e',
              card: '#282828', // Slightly lighter than paper for cards
            },
            text: {
              primary: '#e0e0e0',
              secondary: '#aaaaaa',
              disabled: '#6e6e6e',
            },
            divider: 'rgba(255, 255, 255, 0.12)',
            action: {
              active: 'rgba(255, 255, 255, 0.7)',
              hover: 'rgba(255, 255, 255, 0.08)',
              selected: 'rgba(149, 117, 205, 0.16)',
              disabled: 'rgba(255, 255, 255, 0.3)',
              disabledBackground: 'rgba(255, 255, 255, 0.12)',
            },
          }),
    },
    // Typography adjustments for better readability
    typography: {
      fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    // Component overrides for dark mode compatibility
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#282828' : '#ffffff',
            boxShadow: mode === 'dark' 
              ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
              : '0 4px 20px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none', // Remove default gradient in dark mode
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            color: mode === 'dark' ? '#9575cd' : '#6930c3',
          },
          track: {
            backgroundColor: mode === 'dark' ? '#616161' : '#e0e0e0',
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          thumb: {
            boxShadow: mode === 'dark' 
              ? '0 0 0 8px rgba(149, 117, 205, 0.16)' 
              : '0 0 0 8px rgba(105, 48, 195, 0.16)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            backgroundColor: mode === 'dark' ? '#9575cd' : '#6930c3',
            '&:hover': {
              backgroundColor: mode === 'dark' ? '#7e57c2' : '#5e2aad',
            },
          },
          outlinedPrimary: {
            borderColor: mode === 'dark' ? '#9575cd' : '#6930c3',
            color: mode === 'dark' ? '#9575cd' : '#6930c3',
          },
          textPrimary: {
            color: mode === 'dark' ? '#9575cd' : '#6930c3',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.12)' 
              : '1px solid rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: '1.25rem',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? '#aaaaaa' : '#757575',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? '#9575cd' : '#6930c3',
            },
          },
        },
      },
    },
  }), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};