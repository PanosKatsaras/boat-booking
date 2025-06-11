import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  IconButton
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon // ArrowUpward icon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext'; // useAuth hook

// Type for a user, matching the backend response for /api/admin/users
interface UserData {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'USER' | 'MANAGER'; // Match Prisma Role enum string literal types
  createdAt: string;
  updatedAt: string;
}

// Type for a booking, matching the backend response
interface BookingData {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  paid: boolean;
  includeCaptain: boolean;
  boat?: { // Assuming boat and port might be included if fetched together
    name: string;
    type: string;
  };
  port?: {
    name: string;
  };
  user?: { // User might also be included
    name?: string;
    email: string;
  };
}


/**
 * ManagerDashboard component.
 * This serves as the central hub for MANAGER users.
 * This route is protected by `PrivateRoute` to ensure only ADMINs and MANAGERs can access it.
 */
const ManagerDashboard: React.FC = () => {
  const { user, loadingAuth, logout } = useAuth();

  // State for Users Management (only viewing)
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userFetchError, setUserFetchError] = useState<string | null>(null);

  // State for Bookings Management (only viewing)
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingFetchError, setBookingFetchError] = useState<string | null>(null);

  // State for general action messages
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionMessageType, setActionMessageType] = useState<'success' | 'error' | 'info' | null>(null);

  // State for "scroll to top" button visibility
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);


  // const clearActionMessage = useCallback(() => {
  //   setTimeout(() => {
  //     setActionMessage(null);
  //     setActionMessageType(null);
  //   }, 5000);
  // }, []);

  /**
   * Fetches all users from the backend. Managers can view all users.
   */
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUserFetchError(null);
    try {
      // Reusing admin/users endpoint. Backend authorization middleware will verify role.
      // Managers (and Admins) are allowed to view this endpoint.
      const response = await axios.get<UserData[]>(`${process.env.REACT_APP_SERVER_URL}/api/admin/users`);
      setUsers(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch users.';
      setUserFetchError(errorMessage);
      console.error('Error fetching users for manager dashboard:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setLoadingUsers(false);
    }
  }, [logout]);

  // Fetches all bookings from the backend.
  const fetchAllBookings = useCallback(async () => {
    setLoadingBookings(true);
    setBookingFetchError(null);
    try {
      const response = await axios.get<BookingData[]>(`${process.env.REACT_APP_SERVER_URL}/api/admin/bookings`); // Placeholder
      setBookings(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch bookings.';
      setBookingFetchError(errorMessage);
      console.error('Error fetching all bookings for manager dashboard:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setLoadingBookings(false);
    }
  }, [logout]);

  // Effect hooks to fetch data on component mount and when auth state is ready
  useEffect(() => {
    if (!loadingAuth && user && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
      fetchUsers();
      fetchAllBookings();
    } else if (!loadingAuth && (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER'))) {
      setLoadingUsers(false);
      setUserFetchError('You are not authorized to view user data.');
      setLoadingBookings(false);
      setBookingFetchError('You are not authorized to view booking data.');
    }
  }, [user, loadingAuth, fetchUsers, fetchAllBookings]);

  // Effect hook to handle scroll for the "scroll to top" button
  useEffect(() => {
    const handleScroll = () => {
      // Show button if scrolled down more than 200px
      if (window.scrollY > 200) {
        setShowScrollToTopButton(true);
      } else {
        setShowScrollToTopButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Function to scroll to the top of the page
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Smooth scrolling
    });
  };

  // Display loading indicator
  if (loadingAuth || loadingUsers || loadingBookings) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Loading Manager Dashboard...</Typography>
      </Container>
    );
  }

  // Fallback for access denied
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Access Denied</Typography>
        <Typography variant="body1">You must be an ADMIN or MANAGER to view this page.</Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 3 }}>Back to Home</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 8, p: 4 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manager Dashboard
        </Typography>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Back to Home Button */}
          <Button component={Link} to="/" variant="outlined" color="secondary">
            Back to Home
          </Button>
          <Typography variant="h6" sx={{ mb: 3, textAlign: 'right' }}>
            Welcome, <strong>{user.name || user.email}</strong>!
          </Typography>
        </Box>

        {actionMessage && (
          <Alert severity={actionMessageType || 'info'} sx={{ mb: 2, width: '100%' }}>
            {actionMessage}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', width: '100%' }}>

          {/* Section for View Bookings */}
          <Paper elevation={2} sx={{ p: 3, width: '100%' }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                View Bookings
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, textAlign: 'right' }}>
                View all bookings in the system.
              </Typography>
            </Box>
            {bookingFetchError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {bookingFetchError}
              </Alert>
            ) : bookings.length === 0 ? (
              <Typography variant="body1" align="center" sx={{ mt: 3 }}>
                No bookings found.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table sx={{ minWidth: 650 }} aria-label="booking management table">
                  <TableHead sx={{ backgroundColor: '#98dddf', color: 'white' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Boat</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Port</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Start Time</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>End Time</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Paid</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Captain</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.user?.name || booking.user?.email || 'N/A'}</TableCell>
                        <TableCell>{booking.boat?.name || 'N/A'} ({booking.boat?.type || 'N/A'})</TableCell>
                        <TableCell>{booking.port?.name || 'N/A'}</TableCell>
                        <TableCell>{new Date(booking.startTime).toLocaleString()}</TableCell>
                        <TableCell>{new Date(booking.endTime).toLocaleString()}</TableCell>
                        <TableCell>€{booking.price.toFixed(2)}</TableCell>
                        <TableCell sx={{ color: booking.paid ? '#0fa610' : 'red' }}>
                          {booking.paid ? 'Yes' : 'No'}
                        </TableCell>
                        <TableCell sx={{ color: booking.includeCaptain ? '#0fa610' : 'red' }}>
                          {booking.includeCaptain ? 'Yes' : 'No'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Section for View Users */}
          <Paper elevation={2} sx={{ p: 3, width: '100%' }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                View Users
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, textAlign: 'right' }}>
                View all users information.
              </Typography>
            </Box>
            {userFetchError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {userFetchError}
              </Alert>
            ) : users.length === 0 ? (
              <Typography variant="body1" align="center" sx={{ mt: 3 }}>
                No users found.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table sx={{ minWidth: 650 }} aria-label="user management table">
                  <TableHead sx={{ backgroundColor: '#98dddf', color: 'white' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell component="th" scope="row">
                          {u.name || 'N/A'}
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.role}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      </Paper>

      {/* Scroll to Top Button */}
      {showScrollToTopButton && (
        <IconButton
          color="primary"
          aria-label="scroll to top"
          onClick={handleScrollToTop}
          sx={{
            position: 'fixed',
            bottom: 40,
            right: 40,
            backgroundColor: '#98dddf',
            color: '#474c4d',
            '&:hover': {
              backgroundColor: '#72b6b8', // Darker shade on hover
            },
            zIndex: 1000, // Ensure it's above other content
            boxShadow: 3, // Shadow for elevation
          }}
        >
          <ArrowUpwardIcon />
        </IconButton>
      )}

    </Container>
  );
};

export default ManagerDashboard;
