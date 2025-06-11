// src/pages/NotFound.tsx
import React from 'react';
import { Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
      }}
    >
      <Typography variant="h4">404 - Page Not Found</Typography>
      <Button component={Link} to="/" variant="contained" sx={{ mt: 3, color: 'white' }}>
        Go Home
      </Button>
    </div>
  );
};

export default NotFound;
