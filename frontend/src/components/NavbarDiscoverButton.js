import { Button } from '@mui/material';
import { Lightbulb } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function NavbarDiscoverButton() {
  return (
    <Button
      color="inherit"
      component={Link}
      to="/discover"
      startIcon={<Lightbulb />}
      sx={{ textTransform: 'none' }}
    >
      Discover ESG
    </Button>
  );
}
