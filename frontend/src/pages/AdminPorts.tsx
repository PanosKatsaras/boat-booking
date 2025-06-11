import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Paper,
  Alert,
} from '@mui/material';

// This page allows ADMIN users to create new boat entries.
const AdminPorts: React.FC = () => {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // Used by PrivateRoute to check role, not directly used here for API calls

  /**
   * Handles the form submission to create a new port.
   * Sends the port data to the backend's admin API endpoint.
   */
  const handleCreatePort = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setMessage(null); // Clear previous messages
    setMessageType(null);
    setLoading(true); // Set loading state

    // Basic validation for rates (ensure they are numbers)
    if (isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      setMessage('Latitude and Longitude must be valid numbers.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      // Send POST request to the admin-only boat creation endpoint.
      // Axios is configured globally to send the httpOnly cookie.
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/admin/ports`, {
        name,
        latitude: Number(latitude),
        longitude: Number(longitude)
      });

      setMessage(`Port "${response.data.name}" created successfully!`);
      setMessageType('success');
      // Clear form fields after successful creation
      setName('');
      setLatitude('');
      setLongitude('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create port.';
      setMessage(errorMessage);
      setMessageType('error');
      console.error('Error creating port:', err);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Render the component only if the user is an ADMIN (PrivateRoute already handles redirection)
  if (user?.role !== 'ADMIN') {
    // This part should ideally not be reached if PrivateRoute is working correctly,
    // but acts as a fallback or for initial loading states.
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Access Denied</Typography>
        <Typography variant="body1">You must be an ADMIN to view this page.</Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 3 }}>Back to Home</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8, p: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          Admin - Create New Port
        </Typography>

        {message && (
          <Alert severity={messageType || 'info'} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleCreatePort} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Port Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Latitude"
            type="number"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value === '' ? '' : parseFloat(e.target.value))}
            required
            fullWidth
          />
          <TextField
            label="Longitude"
            type="number"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value === '' ? '' : parseFloat(e.target.value))}
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 3, color: 'white', width: '100%',
              backgroundColor: '#25cc86',
              '&:hover': {
                backgroundColor: '#1c8056',
              }
            }}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Port'}
          </Button>
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button component={Link} to="/" variant="outlined" color="secondary" sx={{ width: '49%' }}>
            Back to Home
          </Button>
          <Button component={Link} to="/admin/dashboard" variant="outlined" color="secondary" sx={{ ml: 1, width: '49%' }}>
            Back to Admin
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminPorts;
