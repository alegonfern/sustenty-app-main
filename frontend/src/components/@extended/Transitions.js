import PropTypes from 'prop-types';
import { Box, Grow, Fade } from '@mui/material';

export default function Transitions({ children, position = 'top-left', type = 'grow', direction = 'up', ...others }) {
  let positionSX = {
    transformOrigin: '0 0 0'
  };

  switch (position) {
    case 'top-right':
      positionSX = { transformOrigin: 'top right' };
      break;
    case 'top':
      positionSX = { transformOrigin: 'top' };
      break;
    case 'bottom-left':
      positionSX = { transformOrigin: 'bottom left' };
      break;
    case 'bottom-right':
      positionSX = { transformOrigin: 'bottom right' };
      break;
    case 'bottom':
      positionSX = { transformOrigin: 'bottom' };
      break;
    case 'top-left':
    default:
      positionSX = { transformOrigin: '0 0 0' };
      break;
  }

  return (
    <Box>
      {type === 'grow' && (
        <Grow {...others}>
          <Box sx={positionSX}>{children}</Box>
        </Grow>
      )}
      {type === 'fade' && (
        <Fade {...others} timeout={{ appear: 0, enter: 300, exit: 150 }}>
          <Box sx={positionSX}>{children}</Box>
        </Fade>
      )}
    </Box>
  );
}

Transitions.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(['grow', 'fade']),
  position: PropTypes.oneOf(['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right']),
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right'])
};
