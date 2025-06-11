import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // Custom MUI theme

// AuthProvider and page components
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import AdminBoats from './pages/AdminBoats';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminPorts from './pages/AdminPorts';
import NotFound from './pages/NotFound';

/**
 * Main application component.
 * This component sets up the React Router, provides the MUI theme,
 * and wraps the entire application with the AuthProvider for authentication state management.
 */
function App() {
  return (
    // ThemeProvider applies the custom Material-UI theme to all children.
    <ThemeProvider theme={theme}>
      {/* CssBaseline resets browser default styles to Material-UI standards. */}
      <CssBaseline />
      {/* AuthProvider makes authentication state and functions available throughout the app. */}
      <AuthProvider>
        {/* BrowserRouter enables client-side routing. */}
        <Router>
          {/* Routes defines the mapping between URLs and components. */}
          <Routes>
            {/* Public Routes: Accessible to everyone */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes: Require authentication */}
            {/* These routes use the PrivateRoute component as a wrapper to
                enforce authentication checks before rendering the actual page content. */}
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
            <Route path="/booking" element={<PrivateRoute><Booking /></PrivateRoute>} />

            {/* Admin-only Routes: Require authentication and 'ADMIN' role */}
            {/* The `allowedRoles` prop in PrivateRoute ensures only users with the 'ADMIN' role can access. */}
            <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/boats" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminBoats /></PrivateRoute>} />
            <Route path="/admin/ports" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminPorts /></PrivateRoute>} />

            {/* Manager-allowed Routes: Require authentication and 'ADMIN' or 'MANAGER' role */}
            <Route path="/manager/dashboard" element={<PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}><ManagerDashboard /></PrivateRoute>} />

            {/* Fallback Route: For any undefined paths */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
