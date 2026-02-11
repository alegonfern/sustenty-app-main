import { useState, useEffect, useRef } from 'react';
import {
  Box,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Popper,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  ClickAwayListener,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Dashboard,
  Business,
  People,
  BarChart,
  Settings,
  Home
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Opciones de búsqueda
const searchOptions = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', keywords: ['dashboard', 'inicio', 'panel'] },
  { text: 'Inicio', icon: <Home />, path: '/', keywords: ['inicio', 'home', 'principal'] },
  { text: 'Organizaciones', icon: <Business />, path: '/organizations', keywords: ['organizaciones', 'empresas', 'companies'] },
  { text: 'Usuarios', icon: <People />, path: '/users', keywords: ['usuarios', 'users', 'personas'] },
  { text: 'Reportes', icon: <BarChart />, path: '/reports', keywords: ['reportes', 'informes', 'reports', 'analytics'] },
  { text: 'Configuración', icon: <Settings />, path: '/settings', keywords: ['configuración', 'settings', 'ajustes'] }
];

export default function Search() {
  const theme = useTheme();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);

  // Manejar atajo de teclado Ctrl+K
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleFocus = (event) => {
    setAnchorEl(event.currentTarget);
    if (searchValue) {
      filterOptions(searchValue);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchValue('');
    setFilteredOptions([]);
  };

  const filterOptions = (value) => {
    const searchTerm = value.toLowerCase();
    const filtered = searchOptions.filter(option => 
      option.text.toLowerCase().includes(searchTerm) ||
      option.keywords.some(keyword => keyword.includes(searchTerm))
    );
    setFilteredOptions(filtered);
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setSearchValue(value);
    
    if (value.trim()) {
      filterOptions(value);
      if (!anchorEl) {
        setAnchorEl(event.currentTarget);
      }
    } else {
      setFilteredOptions([]);
    }
  };

  const handleSelect = (path) => {
    navigate(path);
    handleClose();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  const open = Boolean(anchorEl) && filteredOptions.length > 0;

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box sx={{ width: '100%', ml: { xs: 0, md: 1 }, position: 'relative' }}>
        <FormControl sx={{ width: { xs: '100%', md: 280 } }}>
          <OutlinedInput
            size="small"
            id="header-search"
            inputRef={inputRef}
            value={searchValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: -0.5 }}>
                <SearchIcon sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
              </InputAdornment>
            }
            placeholder="Buscar... (Ctrl + K)"
            sx={{
              bgcolor: 'grey.50',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.light'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
                borderWidth: '1px'
              },
              '& input::placeholder': {
                color: 'text.secondary',
                opacity: 0.7
              }
            }}
          />
        </FormControl>

        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-start"
          sx={{
            zIndex: theme.zIndex.modal + 1,
            width: anchorEl ? anchorEl.offsetWidth : 280,
            mt: 0.5
          }}
        >
          <Paper
            elevation={8}
            sx={{
              mt: 0.5,
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Resultados de búsqueda
              </Typography>
            </Box>
            <List sx={{ py: 0.5, maxHeight: 300, overflow: 'auto' }}>
              {filteredOptions.map((option, index) => (
                <ListItemButton
                  key={index}
                  onClick={() => handleSelect(option.path)}
                  sx={{
                    mx: 0.5,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'primary.lighter'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
                    {option.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={option.text}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: 500
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
