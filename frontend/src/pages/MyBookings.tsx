import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // The authentication context
import { Box, Typography, Button, Container, Paper, CircularProgress, List, ListItem, ListItemText, Divider } from '@mui/material';

// Type for a booking, matching the backend response
interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  paid: boolean;
  includeCaptain: boolean;
  boat: {
    name: string;
    type: string;
  };
  port: {
    name: string;
  };
}

/**
 * MyBookings component.
 * Displays a list of all bookings for the currently authenticated user.
 * This route is protected by `PrivateRoute`.
 */
const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loadingAuth, logout } = useAuth(); // Get user, loadingAuth, and logout function
  const navigate = useNavigate(); // Hook for programmatic navigation

  useEffect(() => {
    const fetchBookings = async () => {
      // If authentication status is still loading, wait.
      if (loadingAuth) return;

      // If no user is authenticated after loading, redirect to login.
      if (!user) {
        navigate('/login');
        return;
      }
      setLoading(true); // Start loading before fetching
      setError(null); // Clear previous errors

      try {
        // Axios is configured globally to send cookies (httpOnly JWT).
        const response = await axios.get<Booking[]>(`${process.env.REACT_APP_SERVER_URL}/api/bookings/my`);
        setBookings(response.data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch bookings.';
        setError(errorMessage);
        console.error('Error fetching bookings:', err);

        // If the error is due to unauthorized (401) or forbidden (403),
        // it likely means the JWT is expired or invalid. Log out the user.
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout(); // Clear local user state and cookie on backend
          navigate('/login'); // Redirect to login page
        }
      } finally {
        setLoading(false); // Stop loading after fetch attempt
      }
    };
    fetchBookings(); // Call the fetch function when component mounts or dependencies change
  }, [user, loadingAuth, navigate, logout]); // Dependencies: re-run if user/loadingAuth changes

  // Display loading indicator
  if (loading || loadingAuth) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading your bookings...</Typography>
      </Container>
    );
  }

  // Display error message
  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">{error}</Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 3 }}>Back to Home</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8, p: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          px: 6,
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom align="center">
          My Bookings
        </Typography>

        {bookings.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ mt: 3 }}>
            You have no bookings yet.
          </Typography>
        ) : (
          <List sx={{ mt: 3 }}>
            {bookings.map((booking, index) => (
              <React.Fragment key={booking.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{ mb: 2 }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="span">
                        {booking.boat.name} ({booking.boat.type})
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography component="span" variant="body2" color="text.primary">
                          <strong>From:</strong> {new Date(booking.startTime).toLocaleString()} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>To:</strong> {new Date(booking.endTime).toLocaleString()}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.secondary">
                          <strong>Port:</strong> {booking.port.name} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; <strong>Price:</strong> ${booking.price.toFixed(2)} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; <strong>Paid:</strong> {booking.paid ? 'Yes' : 'No'} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; <strong>Captain:</strong> {booking.includeCaptain ? 'Yes' : 'No'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < bookings.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Button component={Link} to="/" variant="outlined" color="secondary" sx={{ width: '50%' }}>
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );

};

export default MyBookings;
