import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { IconButton as MuiIconButton } from '@mui/material';

const IconButton = forwardRef(({ color = 'inherit', variant = 'text', children, sx = {}, ...others }, ref) => {
  const baseStyles = {
    borderRadius: 1,
    ...sx
  };

  const variantStyles = {
    light: {
      bgcolor: `${color}.lighter`,
      color: `${color}.main`,
      '&:hover': {
        bgcolor: `${color}.light`
      }
    },
    text: {}
  };

  return (
    <MuiIconButton
      ref={ref}
      color={color}
      sx={{
        ...baseStyles,
        ...(variantStyles[variant] || {})
      }}
      {...others}
    >
      {children}
    </MuiIconButton>
  );
});

IconButton.displayName = 'IconButton';

IconButton.propTypes = {
  color: PropTypes.string,
  variant: PropTypes.oneOf(['light', 'text']),
  children: PropTypes.node,
  sx: PropTypes.object
};

export default IconButton;
