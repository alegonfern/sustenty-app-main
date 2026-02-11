import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';

export default function MainCard({
  border = true,
  boxShadow,
  children,
  subheader,
  content = true,
  contentSX = {},
  darkTitle,
  divider = true,
  elevation,
  secondary,
  shadow,
  sx = {},
  title,
  ...others
}) {
  return (
    <Card
      elevation={elevation || 0}
      sx={{
        position: 'relative',
        border: border ? '1px solid' : 'none',
        borderColor: 'divider',
        borderRadius: 1,
        boxShadow: boxShadow && !border ? shadow || 2 : 'inherit',
        ':hover': { boxShadow: boxShadow ? shadow || 2 : 'inherit' },
        ...sx
      }}
      {...others}
    >
      {/* card header and action */}
      {!darkTitle && title && (
        <CardHeader
          sx={{ p: 2.5 }}
          title={title}
          action={secondary}
          subheader={subheader}
          titleTypographyProps={{ variant: darkTitle ? 'h4' : 'subtitle1' }}
        />
      )}

      {/* content & header divider */}
      {title && divider && <Divider />}

      {/* card content */}
      {content && <CardContent sx={contentSX}>{children}</CardContent>}
      {!content && children}
    </Card>
  );
}

MainCard.propTypes = {
  border: PropTypes.bool,
  boxShadow: PropTypes.bool,
  children: PropTypes.node,
  subheader: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  content: PropTypes.bool,
  contentSX: PropTypes.object,
  darkTitle: PropTypes.bool,
  divider: PropTypes.bool,
  elevation: PropTypes.number,
  secondary: PropTypes.any,
  shadow: PropTypes.string,
  sx: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
};
