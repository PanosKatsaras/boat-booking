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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon // ArrowUpward icon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// The type for a user, matching the backend response for /api/admin/users
interface UserData {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'USER' | 'MANAGER'; // Match Prisma Role enum string types
  createdAt: string;
  updatedAt: string;
}

// The type for a boat, matching the backend response for boats
interface BoatData {
  id: string;
  name: string;
  type: string; // BoatType enum
  portId: string;
  imageUrl?: string;
  hourlyRate: number;
  halfDayRate: number;
  fullDayRate: number;
}

interface PortData {
  id: string,
  name: string,
  latitude: number,
  longitude: number
}

// The type for a booking, matching the backend response
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

// The available roles for the dropdown, matching the backend enum
const roleOptions: ('ADMIN' | 'USER' | 'MANAGER')[] = ['ADMIN', 'MANAGER', 'USER'];

/**
 * AdminDashboard component.
 * This serves as the central hub for ADMIN users, combining links to administrative
 * functionalities with direct user and boat management capabilities.
 * This route is protected by `PrivateRoute` to ensure only ADMINs can access it.
 */
const AdminDashboard: React.FC = () => {
  const { user, loadingAuth, logout } = useAuth();

  // State for Users Management
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userFetchError, setUserFetchError] = useState<string | null>(null);
  const [openEditUserModal, setOpenEditUserModal] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState<UserData | null>(null);
  const [editFormState, setEditFormState] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as UserData['role'],
  });

  // State for Boats Management
  const [boats, setBoats] = useState<BoatData[]>([]);
  const [loadingBoats, setLoadingBoats] = useState(true);
  const [boatFetchError, setBoatFetchError] = useState<string | null>(null);

  // State for Ports Management
  const [ports, setPorts] = useState<PortData[]>([]);
  const [loadingPorts, setLoadingPorts] = useState(true);
  const [portFetchError, setPortFetchError] = useState<string | null>(null);

  // State for Bookings Management (only viewing)
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingFetchError, setBookingFetchError] = useState<string | null>(null);

  // State for general action messages (e.g., successful update/deletion)
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionMessageType, setActionMessageType] = useState<'success' | 'error' | null>(null);

  // State for "scroll to top" button visibility
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);


  const clearActionMessage = useCallback(() => {
    setTimeout(() => {
      setActionMessage(null);
      setActionMessageType(null);
    }, 5000);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUserFetchError(null);
    try {
      const response = await axios.get<UserData[]>(`${process.env.REACT_APP_SERVER_URL}/api/admin/users`);
      setUsers(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch users.';
      setUserFetchError(errorMessage);
      console.error('Error fetching users for admin dashboard:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setLoadingUsers(false);
    }
  }, [logout]);

  const fetchBoats = useCallback(async () => {
    setLoadingBoats(true);
    setBoatFetchError(null);
    try {
      const response = await axios.get<BoatData[]>(`${process.env.REACT_APP_SERVER_URL}/api/admin/boats`);
      setBoats(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch boats.';
      setBoatFetchError(errorMessage);
      console.error('Error fetching boats for admin dashboard:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setLoadingBoats(false);
    }
  }, [logout]);

  const fetchPorts = useCallback(async () => {
    setLoadingPorts(true);
    setPortFetchError(null);
    try {
      const response = await axios.get<PortData[]>(`${process.env.REACT_APP_SERVER_URL}/api/admin/ports`);
      setPorts(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch ports.';
      setPortFetchError(errorMessage);
      console.error('Error fetching ports for admin dashboard:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setLoadingPorts(false);
    }
  }, [logout]);

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    setBookingFetchError(null);
    try {
      const response = await axios.get<BookingData[]>(`${process.env.REACT_APP_SERVER_URL}/api/admin/bookings`);
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

  useEffect(() => {
    if (!loadingAuth && user && user.role === 'ADMIN') {
      fetchUsers();
      fetchBoats();
      fetchPorts();
      fetchBookings();
    } else if (!loadingAuth && (!user || user.role !== 'ADMIN')) {
      setLoadingUsers(false);
      setUserFetchError('You are not authorized to view user data.');
      setLoadingBoats(false);
      setBoatFetchError('You are not authorized to view boat data.');
      setLoadingPorts(false);
      setPortFetchError('You are not authorized to view port data.');
      setLoadingBookings(false);
      setBookingFetchError('You are not authorized to view booking data.');
    }
  }, [user, loadingAuth, fetchUsers, fetchBoats, fetchPorts, fetchBookings]);

  // Effect hook to handle scroll for the "scroll to top" button
  useEffect(() => {
    const handleScroll = () => {
      // Show button if scrolled down more than 200px (adjust as needed)
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


  const handleChangeRole = async (userId: string, newRole: UserData['role']) => {
    setActionMessage(null);
    setActionMessageType(null);
    if (!window.confirm(`Are you sure you want to change the role of user ${userId} to ${newRole}?`)) {
      return;
    }

    try {
      const response = await axios.put(`${process.env.REACT_APP_SERVER_URL}/api/admin/users/${userId}/role`, { newRole });
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === userId ? { ...u, role: response.data.user.role } : u))
      );
      setActionMessage(response.data.message);
      setActionMessageType('success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to change user role.';
      setActionMessage(errorMessage);
      setActionMessageType('error');
      console.error('Error changing user role:', err);
      if (err.response?.status === 401 || err.response?.status === 403) logout();
    } finally {
      clearActionMessage();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setActionMessage(null);
    setActionMessageType(null);
    if (user && user.id === userId) {
      setActionMessage("You cannot delete your own account from this interface.");
      setActionMessageType('error');
      clearActionMessage();
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user ${userId}? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_URL}/api/admin/users/${userId}`);
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      setActionMessage(`User ${userId} deleted successfully.`);
      setActionMessageType('success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete user.';
      setActionMessage(errorMessage);
      setActionMessageType('error');
      console.error('Error deleting user:', err);
      if (err.response?.status === 401 || err.response?.status === 403) logout();
    } finally {
      clearActionMessage();
    }
  };

  const handleDeleteBoat = async (boatId: string) => {
    setActionMessage(null);
    setActionMessageType(null);
    if (!window.confirm(`Are you sure you want to delete boat ${boatId}? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_URL}/api/admin/boats/${boatId}`);
      setBoats(prevBoats => prevBoats.filter(b => b.id !== boatId));
      setActionMessage(`Boat ${boatId} deleted successfully.`);
      setActionMessageType('success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete boat.';
      setActionMessage(errorMessage);
      setActionMessageType('error');
      console.error('Error deleting boat:', err);
      if (err.response?.status === 401 || err.response?.status === 403) logout();
    } finally {
      clearActionMessage();
    }
  };

  const handleDeletePort = async (portId: string) => {
    setActionMessage(null);
    setActionMessageType(null);
    if (!window.confirm(`Are you sure you want to delete port ${portId}? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_URL}/api/admin/ports/${portId}`);
      setPorts(prevPorts => prevPorts.filter(p => p.id !== portId)); // Fix: Changed setBoats to setPorts
      setActionMessage(`Port ${portId} deleted successfully.`);
      setActionMessageType('success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete port.';
      setActionMessage(errorMessage);
      setActionMessageType('error');
      console.error('Error deleting port:', err);
      if (err.response?.status === 401 || err.response?.status === 403) logout();
    } finally {
      clearActionMessage();
    }
  };

  const handleOpenEditUserModal = (userToEdit: UserData) => {
    setCurrentUserToEdit(userToEdit);
    setEditFormState({
      name: userToEdit.name || '',
      email: userToEdit.email,
      password: '',
      role: userToEdit.role,
    });
    setOpenEditUserModal(true);
  };

  const handleCloseEditUserModal = () => {
    setOpenEditUserModal(false);
    setCurrentUserToEdit(null);
    setEditFormState({ name: '', email: '', password: '', role: 'USER' });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRoleChangeInModal = (e: any) => {
    setEditFormState(prevState => ({
      ...prevState,
      role: e.target.value as UserData['role'],
    }));
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    setActionMessageType(null);
    if (!currentUserToEdit) return;

    try {
      const payload: {
        name?: string;
        email?: string;
        password?: string;
        role?: UserData['role'];
      } = {};

      if (editFormState.name !== currentUserToEdit.name) payload.name = editFormState.name;
      if (editFormState.email !== currentUserToEdit.email) payload.email = editFormState.email;
      if (editFormState.password) payload.password = editFormState.password;
      if (editFormState.role !== currentUserToEdit.role) payload.role = editFormState.role;

      if (Object.keys(payload).length === 0) {
        setActionMessage('No changes detected to update user.');
        setActionMessageType('success');
        handleCloseEditUserModal();
        clearActionMessage();
        return;
      }

      const response = await axios.put(`${process.env.REACT_APP_SERVER_URL}/api/admin/users/${currentUserToEdit.id}`, payload);

      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === currentUserToEdit.id ? response.data.user : u))
      );
      setActionMessage(response.data.message);
      setActionMessageType('success');
      handleCloseEditUserModal();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update user.';
      setActionMessage(errorMessage);
      setActionMessageType('error');
      console.error('Error updating user:', err);
      if (err.response?.status === 401 || err.response?.status === 403) logout();
    } finally {
      clearActionMessage();
    }
  };

  if (loadingAuth || loadingUsers || loadingBoats) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Loading Admin Dashboard...</Typography>
      </Container>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Access Denied</Typography>
        <Typography variant="body1">You must be an ADMIN to view this page.</Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 3 }}>Back to Home</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 8, p: 4 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Back to Home Button - Now on the left */}
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

          {/* Section for Managing Bookings (View Only) */}
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
                      <TableCell sx={{ fontWeight: 'bold' }} >Captain</TableCell>
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

          {/* Section for Managing Boats */}
          <Paper elevation={2} sx={{ p: 3, width: '100%' }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Manage Boats
              </Typography>
              <Typography variant="body1" align='right'>
                Create new boats or delete existing ones.
              </Typography>
            </Box>
            <Button component={Link} to="/admin/boats" variant="contained" sx={{ color: 'white' }}>
              Create New Boat
            </Button>

            {boatFetchError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {boatFetchError}
              </Alert>
            ) : boats.length === 0 && !loadingBoats ? (
              <Typography variant="body1" align="center" sx={{ mt: 3 }}>
                No boats found.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table sx={{ minWidth: 650 }} aria-label="boat management table">
                  <TableHead sx={{ backgroundColor: '#98dddf', color: 'white' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Hourly Rate</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Port ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {boats.map((boat) => (
                      <TableRow key={boat.id}>
                        <TableCell>{boat.name}</TableCell>
                        <TableCell>{boat.type}</TableCell>
                        <TableCell>${boat.hourlyRate.toFixed(2)}</TableCell>
                        <TableCell>{boat.portId}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteBoat(boat.id)}
                            aria-label={`delete boat ${boat.name}`}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Section for Managing Ports */}
          <Paper elevation={2} sx={{ p: 3, width: '100%' }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Manage Ports
              </Typography>
              <Typography variant="body1" align='right'>
                Create new ports or delete existing ones.
              </Typography>
            </Box>
            <Button component={Link} to="/admin/ports" variant="contained" sx={{ color: 'white' }}>
              Create New Port
            </Button>

            {portFetchError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {portFetchError}
              </Alert>
            ) : ports.length === 0 && !loadingPorts ? (
              <Typography variant="body1" align="center" sx={{ mt: 3 }}>
                No ports found.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table sx={{ minWidth: 650 }} aria-label="boat management table">
                  <TableHead sx={{ backgroundColor: '#98dddf', color: 'white' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Latitude</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Longitute</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ports.map((port) => (
                      <TableRow key={port.id}>
                        <TableCell>{port.name}</TableCell>
                        <TableCell>{port.latitude.toFixed(4)}</TableCell>
                        <TableCell>{port.longitude.toFixed(4)}</TableCell>
                        <TableCell>{port.id}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            onClick={() => handleDeletePort(port.id)}
                            aria-label={`delete port ${port.name}`}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Section for Managing Users */}
          <Paper elevation={2} sx={{ p: 3, width: '100%' }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Manage Users
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, textAlign: 'right' }}>
                View, update details, or delete users.
              </Typography>
            </Box>

            {userFetchError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {userFetchError}
              </Alert>
            ) : users.length === 0 && !loadingUsers ? (
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
                      <TableCell sx={{ fontWeight: 'bold' }}>Current Role</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">Change Role To</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
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
                        <TableCell align="right">
                          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Role</InputLabel>
                            <Select
                              value={u.role}
                              onChange={(e) => handleChangeRole(u.id, e.target.value as UserData['role'])}
                              label="Role"
                              disabled={u.id === user.id}
                            >
                              {roleOptions.map((role) => (
                                <MenuItem key={role} value={role}>
                                  {role}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="right">
                          {u.id === user.id && (
                            <Typography variant="body2" color="textSecondary" sx={{ display: 'inline-block', mr: 1 }}>
                              (Your Account)
                            </Typography>
                          )}
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEditUserModal(u)}
                            aria-label={`edit user ${u.name || u.email}`}
                            disabled={u.id === user.id} // Disable editing own account via this modal for safety
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteUser(u.id)}
                            aria-label={`delete user ${u.name || u.email}`}
                            disabled={u.id === user.id} // Disable deleting own account
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      </Paper>

      {/* Edit User Modal */}
      <Dialog open={openEditUserModal} onClose={handleCloseEditUserModal}
      maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          {currentUserToEdit && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Name"
                type="text"
                fullWidth
                variant="outlined"
                value={editFormState.name}
                onChange={handleEditFormChange}
              />
              <TextField
                margin="dense"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={editFormState.email}
                onChange={handleEditFormChange}
              />
              <TextField
                margin="dense"
                name="password"
                label="New Password (optional)"
                type="password"
                fullWidth
                variant="outlined"
                value={editFormState.password}
                onChange={handleEditFormChange}
                placeholder="Leave blank to keep current password"
              />
              <FormControl fullWidth margin="dense">
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role-select"
                  value={editFormState.role}
                  label="Role"
                  onChange={handleRoleChangeInModal}
                >
                  {roleOptions.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button onClick={handleCloseEditUserModal} color="secondary" sx={{ color: 'white', width: '50%'}}>
            Cancel
          </Button>
          <Button onClick={handleUpdateUserSubmit} variant="contained" 
            sx={{ color: 'white', width: '50%', 
              backgroundColor: '#25cc86', 
              '&:hover': {
                backgroundColor: '#1c8056', 
              }}}>
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scroll to Top Button */}
      {showScrollToTopButton && (
        <IconButton
          color="primary"
          aria-label="scroll to top"
          onClick={handleScrollToTop}
          sx={{
            position: 'fixed',
            bottom: 40, // Adjust position as needed
            right: 40,  // Adjust position as needed
            backgroundColor: '#98dddf', 
            color: '#474c4d',
            '&:hover': {
              backgroundColor: '#72b6b8', // Darker shade on hover
            },
            zIndex: 1000, // Ensure it's above other content
            boxShadow: 3, // Add some shadow for elevation
          }}
        >
          <ArrowUpwardIcon />
        </IconButton>
      )}
    </Container>
  );
};

export default AdminDashboard;