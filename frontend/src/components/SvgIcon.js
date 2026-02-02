import React from 'react';

export default function SvgIcon({ name, size = 24, color = 'inherit', ...props }) {
  // Simple fallback icon
  return <span style={{ display: 'inline-block', width: size, height: size, background: color, borderRadius: '50%' }} {...props}></span>;
}
