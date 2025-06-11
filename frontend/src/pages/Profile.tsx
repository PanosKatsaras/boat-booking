import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext'; // The authentication context

// Displays the profile information of the currently authenticated user.
const Profile: React.FC = () => {
  const { user, logout, loadingAuth } = useAuth(); // Get user data, logout function, and loading state
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Display loading indicator if authentication status is still being determined
  if (loadingAuth) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading profile...</Typography>
      </Container>
    );
  }

  // If no user is authenticated (should be handled by PrivateRoute, but just for safety)
  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">You are not logged in.</Typography>
        <Button component={Link} to="/login" variant="contained" sx={{ mt: 3 }}>Go to Login</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, p: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          My Profile
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1">
            <strong>Name:</strong> {user.name || 'N/A'}
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {user.email}
          </Typography>
          <Typography variant="body1">
            <strong>Role:</strong> {user.role}
          </Typography>
        </Box>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Button onClick={logout} variant="outlined" color="error">
            Logout
          </Button>
          <Button component={Link} to="/" variant="outlined" color="secondary">
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
