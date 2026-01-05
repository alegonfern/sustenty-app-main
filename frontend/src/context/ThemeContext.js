import React, { createContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Recuperar preferencia guardada o usar el tema del sistema
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) return savedMode;
    
    // Detectar preferencia del sistema operativo
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    // Guardar preferencia en localStorage
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            lighter: mode === 'light' ? '#d1fae5' : '#065f46',
            light: mode === 'light' ? '#6ee7b7' : '#059669',
            main: '#10b981',
            dark: mode === 'light' ? '#059669' : '#6ee7b7',
            darker: mode === 'light' ? '#047857' : '#a7f3d0',
            contrastText: '#fff'
          },
          secondary: {
            lighter: mode === 'light' ? '#e0f2fe' : '#075985',
            light: mode === 'light' ? '#7dd3fc' : '#0284c7',
            main: '#0ea5e9',
            dark: mode === 'light' ? '#0284c7' : '#7dd3fc',
            darker: mode === 'light' ? '#0369a1' : '#bae6fd',
            contrastText: '#fff'
          },
          success: {
            lighter: mode === 'light' ? '#d1fae5' : '#065f46',
            light: mode === 'light' ? '#6ee7b7' : '#059669',
            main: '#10b981',
            dark: mode === 'light' ? '#059669' : '#6ee7b7',
            darker: mode === 'light' ? '#047857' : '#a7f3d0',
            contrastText: '#fff'
          },
          info: {
            lighter: mode === 'light' ? '#e0f2fe' : '#075985',
            light: mode === 'light' ? '#7dd3fc' : '#0284c7',
            main: '#0ea5e9',
            dark: mode === 'light' ? '#0284c7' : '#7dd3fc',
            darker: mode === 'light' ? '#0369a1' : '#bae6fd',
            contrastText: '#fff'
          },
          error: {
            lighter: mode === 'light' ? '#fee2e2' : '#7f1d1d',
            light: mode === 'light' ? '#fca5a5' : '#dc2626',
            main: '#ef4444',
            dark: mode === 'light' ? '#dc2626' : '#fca5a5',
            darker: mode === 'light' ? '#b91c1c' : '#fecaca',
            contrastText: '#fff'
          },
          warning: {
            lighter: mode === 'light' ? '#fef3c7' : '#78350f',
            light: mode === 'light' ? '#fcd34d' : '#d97706',
            main: '#f59e0b',
            dark: mode === 'light' ? '#d97706' : '#fcd34d',
            darker: mode === 'light' ? '#b45309' : '#fde68a',
            contrastText: '#fff'
          },
          grey: {
            50: mode === 'light' ? '#fafafa' : '#18181b',
            100: mode === 'light' ? '#f4f4f5' : '#27272a',
            200: mode === 'light' ? '#e4e4e7' : '#3f3f46',
            300: mode === 'light' ? '#d4d4d8' : '#52525b',
            400: mode === 'light' ? '#a1a1aa' : '#71717a',
            500: '#71717a',
            600: mode === 'light' ? '#52525b' : '#a1a1aa',
            700: mode === 'light' ? '#3f3f46' : '#d4d4d8',
            800: mode === 'light' ? '#27272a' : '#e4e4e7',
            900: mode === 'light' ? '#18181b' : '#f4f4f5',
            A50: mode === 'light' ? '#fafafb' : '#18181b',
            A100: mode === 'light' ? '#f4f4f5' : '#27272a',
            A200: mode === 'light' ? '#e4e4e7' : '#3f3f46',
            A400: mode === 'light' ? '#a1a1aa' : '#71717a',
            A700: mode === 'light' ? '#3f3f46' : '#d4d4d8'
          },
          text: {
            primary: mode === 'light' ? '#3f3f46' : '#f4f4f5',
            secondary: mode === 'light' ? '#71717a' : '#a1a1aa',
            disabled: mode === 'light' ? '#a1a1aa' : '#52525b'
          },
          action: {
            disabled: mode === 'light' ? '#d4d4d8' : '#3f3f46',
            hover: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
            selected: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.16)',
          },
          divider: mode === 'light' ? '#e4e4e7' : '#3f3f46',
          background: {
            paper: mode === 'light' ? '#ffffff' : '#18181b',
            default: mode === 'light' ? '#fafafa' : '#09090b'
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
        shadows: mode === 'light' 
          ? [
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
            ]
          : [
              'none',
              '0px 2px 4px rgba(0, 0, 0, 0.3)',
              '0px 3px 6px rgba(0, 0, 0, 0.35)',
              '0px 4px 8px rgba(0, 0, 0, 0.4)',
              '0px 5px 10px rgba(0, 0, 0, 0.45)',
              '0px 6px 12px rgba(0,0,0,0.5)',
              '0px 7px 14px rgba(0,0,0,0.52)',
              '0px 8px 16px rgba(0,0,0,0.54)',
              '0px 9px 18px rgba(0,0,0,0.56)',
              '0px 10px 20px rgba(0,0,0,0.58)',
              '0px 11px 22px rgba(0,0,0,0.6)',
              '0px 12px 24px rgba(0,0,0,0.62)',
              '0px 13px 26px rgba(0,0,0,0.64)',
              '0px 14px 28px rgba(0,0,0,0.66)',
              '0px 15px 30px rgba(0,0,0,0.68)',
              '0px 16px 32px rgba(0,0,0,0.7)',
              '0px 17px 34px rgba(0,0,0,0.72)',
              '0px 18px 36px rgba(0,0,0,0.74)',
              '0px 19px 38px rgba(0,0,0,0.76)',
              '0px 20px 40px rgba(0,0,0,0.78)',
              '0px 21px 42px rgba(0,0,0,0.8)',
              '0px 22px 44px rgba(0,0,0,0.82)',
              '0px 23px 46px rgba(0,0,0,0.84)',
              '0px 24px 48px rgba(0,0,0,0.86)'
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
                  boxShadow: mode === 'light' 
                    ? '0px 4px 8px rgba(16, 185, 129, 0.15)' 
                    : '0px 4px 8px rgba(16, 185, 129, 0.25)'
                }
              },
              contained: {
                '&:hover': {
                  boxShadow: mode === 'light' 
                    ? '0px 6px 12px rgba(16, 185, 129, 0.2)' 
                    : '0px 6px 12px rgba(16, 185, 129, 0.3)'
                }
              }
            }
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: mode === 'light' 
                  ? '0px 2px 8px rgba(0,0,0,0.08)' 
                  : '0px 2px 8px rgba(0,0,0,0.4)',
                border: mode === 'light' ? '1px solid #e4e4e7' : '1px solid #3f3f46',
                backgroundImage: 'none'
              }
            }
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundImage: 'none',
                borderRight: mode === 'light' ? '1px solid #e4e4e7' : '1px solid #3f3f46'
              }
            }
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 6
              }
            }
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                backgroundColor: mode === 'light' ? '#ffffff' : '#18181b',
                borderBottom: mode === 'light' ? '1px solid #e4e4e7' : '1px solid #3f3f46'
              }
            }
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none'
              }
            }
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottom: mode === 'light' 
                  ? '1px solid #e4e4e7' 
                  : '1px solid #3f3f46'
              }
            }
          }
        }
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
