import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import { TextField, Button, Box, Typography, Container, Paper, Alert } from '@mui/material';

/**
 * Register component.
 * Provides a form for new users to register an account with email and password.
 * On successful registration, it logs the user in and redirects to the profile page.
 */
const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Optional name field
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginSuccess } = useAuth(); // Get loginSuccess function from AuthContext

  // Handles the form submission for registration.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(null); // Clear previous errors
    setLoading(true); // Set loading state

    try {
      // Send registration request to the backend
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/auth/register`, {
        email,
        password,
        name,
      });

      // On successful registration, the backend sets an httpOnly cookie.
      // The backend also returns user data, which we use to update AuthContext.
      loginSuccess(response.data.user);
      alert(response.data.message);
      // Redirect to the profile page after successful registration
      navigate('/profile');
    } catch (err: any) {
      // Handle errors from the backend API
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, p: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          Register New Account
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            margin="normal"
            fullWidth
          />
          <TextField
            label="Name (Optional)"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            margin="normal"
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, mb: 2, color: 'white' }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
          <Button component={Link} to="/" variant="outlined" color="secondary" fullWidth sx={{ mb: 2 }}>
            Back to Home
          </Button>
        </Box>
        <Typography variant="body2" align="center">
          Already have an account? <Link to="/login" style={{ fontWeight: 'bold' }}>Login here</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Register;
