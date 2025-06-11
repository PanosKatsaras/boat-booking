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
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';

// BoatType enum values as a constant array for easy mapping to MUI Select
const BoatTypeOptions = ['SMALL', 'NORMAL', 'SPEED_BOAT', 'MOTOR_YACHT'];

// AdminBoats component.
const AdminBoats: React.FC = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('SPEED_BOAT'); // Default to 'SPEED_BOAT'
  const [portId, setPortId] = useState(''); // This should be selected from existing ports
  const [imageUrl, setImageUrl] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');
  const [halfDayRate, setHalfDayRate] = useState<number | ''>('');
  const [fullDayRate, setFullDayRate] = useState<number | ''>('');
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // Used by PrivateRoute to check role

  // Handles the form submission to create a new boat.
  const handleCreateBoat = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setMessage(null); // Clear previous messages
    setMessageType(null);
    setLoading(true); // Set loading state

    // Basic validation for rates (ensure they are numbers)
    if (isNaN(Number(hourlyRate)) || isNaN(Number(halfDayRate)) || isNaN(Number(fullDayRate))) {
      setMessage('Rates must be valid numbers.');
      setMessageType('error');
      setLoading(false);
      return;
    }
    if (!portId) {
      setMessage('Port ID is required.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      // Send POST request to the admin-only boat creation endpoint.
      // Axios is configured globally to send the httpOnly cookie.
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/admin/boats`, {
        name,
        type,
        portId,
        imageUrl: imageUrl || null, // Send null if empty string
        hourlyRate: Number(hourlyRate),
        halfDayRate: Number(halfDayRate),
        fullDayRate: Number(fullDayRate),
      });

      setMessage(`Boat "${response.data.name}" created successfully!`);
      setMessageType('success');
      // Clear form fields after successful creation
      setName('');
      setType('NORMAL');
      setPortId('');
      setImageUrl('');
      setHourlyRate('');
      setHalfDayRate('');
      setFullDayRate('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create boat.';
      setMessage(errorMessage);
      setMessageType('error');
      console.error('Error creating boat:', err);
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
          Admin - Create New Boat
        </Typography>

        {message && (
          <Alert severity={messageType || 'info'} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleCreateBoat} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Boat Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />

          <FormControl fullWidth required>
            <InputLabel id="boat-type-label">Boat Type</InputLabel>
            <Select
              labelId="boat-type-label"
              id="boat-type-select"
              value={type}
              label="Boat Type"
              onChange={(e) => setType(e.target.value as string)}
            >
              {BoatTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option.replace('_', ' ')} {/* Display friendly name */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Port ID"
            value={portId}
            onChange={(e) => setPortId(e.target.value)}
            required
            fullWidth
            helperText="e.g., 2b8b9f78-2d1b-4d4b-9e4a-4e2b8b9f78a2 (ensure this Port ID exists in DB!)"
          />

          <TextField
            label="Image URL (Optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
          />

          <TextField
            label="Hourly Rate"
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
            required
            fullWidth
          />
          <TextField
            label="Half Day Rate"
            type="number"
            value={halfDayRate}
            onChange={(e) => setHalfDayRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
            required
            fullWidth
          />
          <TextField
            label="Full Day Rate"
            type="number"
            value={fullDayRate}
            onChange={(e) => setFullDayRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
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
            {loading ? 'Creating...' : 'Create Boat'}
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

export default AdminBoats;
