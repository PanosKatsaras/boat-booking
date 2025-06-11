import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import { TextField, Button, Box, Typography, Container, Paper, Alert } from '@mui/material';

/**
 * Login component.
 * Provides a form for existing users to log in with their email and password.
 * On successful login, it updates the authentication context and redirects to the profile page.
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginSuccess } = useAuth(); // Get loginSuccess function from AuthContext

  // Handles the form submission for login.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(null); // Clear previous errors
    setLoading(true); // Set loading state

    try {
      // Send login request to the backend
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/auth/login`, {
        email,
        password,
      });

      // On successful login, the backend sets an httpOnly cookie.
      // The backend also returns user data, which we use to update AuthContext.
      loginSuccess(response.data.user);
      console.log(response.data.message);
      // Redirect to the profile page after successful login
      navigate('/profile');
    } catch (err: any) {
      // Handle errors from the backend API
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, p: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          Login to Your Account
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
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          <Button component={Link} to="/" variant="outlined" color="secondary" fullWidth sx={{ mb: 2 }}>
            Back to Home
          </Button>
        </Box>
        <Typography variant="body2" align="center">
          Don't have an account? <Link to="/register" style={{ fontWeight: 'bold' }}>Register here</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login;
