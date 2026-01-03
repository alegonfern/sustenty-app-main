import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      lighter: '#d1fae5',
      light: '#6ee7b7',
      main: '#10b981',
      dark: '#059669',
      darker: '#047857',
      contrastText: '#fff'
    },
    secondary: {
      lighter: '#e0f2fe',
      light: '#7dd3fc',
      main: '#0ea5e9',
      dark: '#0284c7',
      darker: '#0369a1',
      contrastText: '#fff'
    },
    success: {
      lighter: '#d1fae5',
      light: '#6ee7b7',
      main: '#10b981',
      dark: '#059669',
      darker: '#047857',
      contrastText: '#fff'
    },
    error: {
      lighter: '#fee2e2',
      light: '#fca5a5',
      main: '#ef4444',
      dark: '#dc2626',
      darker: '#b91c1c',
      contrastText: '#fff'
    },
    warning: {
      lighter: '#fef3c7',
      light: '#fcd34d',
      main: '#f59e0b',
      dark: '#d97706',
      darker: '#b45309',
      contrastText: '#fff'
    },
    grey: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      A50: '#fafafb',
      A100: '#f4f4f5',
      A200: '#e4e4e7',
      A400: '#a1a1aa',
      A700: '#3f3f46'
    },
    text: {
      primary: '#3f3f46',
      secondary: '#71717a',
      disabled: '#a1a1aa'
    },
    action: {
      disabled: '#d4d4d8'
    },
    divider: '#e4e4e7',
    background: {
      paper: '#ffffff',
      default: '#fafafa'
    }
  },
  typography: {
    fontFamily: `'Inter', 'Public Sans', 'Roboto', sans-serif`,
    h1: {
      fontSize: '2.375rem',
      fontWeight: 700,
      lineHeight: 1.21
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 700,
      lineHeight: 1.27
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.33
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.57
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.57
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.66
    },
    button: {
      textTransform: 'none',
      fontWeight: 500
    }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 768,
      md: 1024,
      lg: 1266,
      xl: 1440
    }
  },
  shape: {
    borderRadius: 8
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(16, 185, 129, 0.04)',
    '0px 3px 6px rgba(16, 185, 129, 0.06)',
    '0px 4px 8px rgba(16, 185, 129, 0.08)',
    '0px 5px 10px rgba(16, 185, 129, 0.1)',
    '0px 6px 12px rgba(0,0,0,0.12)',
    '0px 7px 14px rgba(0,0,0,0.14)',
    '0px 8px 16px rgba(0,0,0,0.16)',
    '0px 9px 18px rgba(0,0,0,0.18)',
    '0px 10px 20px rgba(0,0,0,0.2)',
    '0px 11px 22px rgba(0,0,0,0.22)',
    '0px 12px 24px rgba(0,0,0,0.24)',
    '0px 13px 26px rgba(0,0,0,0.26)',
    '0px 14px 28px rgba(0,0,0,0.28)',
    '0px 15px 30px rgba(0,0,0,0.3)',
    '0px 16px 32px rgba(0,0,0,0.32)',
    '0px 17px 34px rgba(0,0,0,0.34)',
    '0px 18px 36px rgba(0,0,0,0.36)',
    '0px 19px 38px rgba(0,0,0,0.38)',
    '0px 20px 40px rgba(0,0,0,0.4)',
    '0px 21px 42px rgba(0,0,0,0.42)',
    '0px 22px 44px rgba(0,0,0,0.44)',
    '0px 23px 46px rgba(0,0,0,0.46)',
    '0px 24px 48px rgba(0,0,0,0.48)'
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(16, 185, 129, 0.15)'
          }
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 6px 12px rgba(16, 185, 129, 0.2)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e4e4e7'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6
        }
      }
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);