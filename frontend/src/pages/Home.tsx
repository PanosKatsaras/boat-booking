import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper, CircularProgress, Divider } from '@mui/material'; // Added Divider
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; // Leaflet components
import 'leaflet/dist/leaflet.css'; // Leaflet CSS for styling
import L from 'leaflet'; // For Parcel/Webpack compatibility)
import axios from 'axios';

// This block ensures Leaflet's default icons are correctly referenced.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// A type for Boat data (simplified for popup display)
interface BoatData {
  id: string;
  name: string;
  type: string;
  imageUrl?: string; // Optional as per the model
}

// A type for Port data, matching Prisma schema
interface PortData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  boats?: BoatData[]; // Optional boats array
}

/**
 * Home component.
 * This is the public landing page of the application.
 * It displays a welcome message and provides navigation links
 * based on the user's authentication status and role.
 * It now also includes a map displaying various ports fetched from the backend.
 */
const Home: React.FC = () => {
  const { user, logout, loadingAuth } = useAuth(); // Get user data, logout function, and loading state

  const [ports, setPorts] = useState<PortData[]>([]);
  const [loadingPorts, setLoadingPorts] = useState(true);
  const [portFetchError, setPortFetchError] = useState<string | null>(null);

  // Default map center if no ports are loaded or available
  const defaultMapCenter: [number, number] = [37.9408, 23.6477];

  // Calculate dynamic map center based on fetched ports
  // Explicitly define the return type as [number, number] (a tuple)
  const calculateMapCenter = useCallback((): [number, number] => {
    if (ports.length === 0) {
      return defaultMapCenter;
    }
    const totalLatitude = ports.reduce((sum, port) => sum + port.latitude, 0);
    const totalLongitude = ports.reduce((sum, port) => sum + port.longitude, 0);
    return [totalLatitude / ports.length, totalLongitude / ports.length];
  }, [ports]);

  // Function to fetch ports from the backend
  const fetchPorts = useCallback(async () => {
    setLoadingPorts(true);
    setPortFetchError(null);
    try {
      const response = await axios.get<PortData[]>(`${process.env.REACT_APP_SERVER_URL}/api/ports`);
      setPorts(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch ports.';
      setPortFetchError(errorMessage);
      console.error('Error fetching ports:', err);
    } finally {
      setLoadingPorts(false);
    }
  }, []);

  // Function to delete a port
  const handleDeletePort = useCallback(async (portId: string, portName: string) => {
    if (!window.confirm(`Are you sure you want to delete the port: ${portName}?`)) {
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_URL}/api/ports/${portId}`);
      // Remove the deleted port from the state to update UI
      setPorts(prevPorts => prevPorts.filter(port => port.id !== portId));
      window.alert(`Port '${portName}' deleted successfully.`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete port.';
      console.error(`Error deleting port ${portId}:`, err);
      window.alert(`Error deleting port: ${errorMessage}`);
    }
  }, []);

  // Function to open image in a new tab
  const handleImageClick = (imageUrl: string | undefined, boatName: string) => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    } else {
      window.alert(`No image available for ${boatName}.`);
    }
  };

  // Fetch ports when the component mounts
  useEffect(() => {
    fetchPorts();
  }, [fetchPorts]);


  // A loading indicator while the authentication status is being determined or ports are loading
  if (loadingAuth || loadingPorts) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          {loadingAuth ? 'Loading authentication...' : 'Loading ports...'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 8, p: 4 }}> {/* Increased max width for map */}
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center"
          sx={{
            background: 'linear-gradient(to right, #2fa5cc,rgb(72, 186, 99))',
            WebkitBackgroundClip: 'text', // Note the camelCase for JS objects
            backgroundClip: 'text',
            color: 'transparent',
            fontWeight: 700,
            display: 'inline-block'
          }}>
          Welcome to the Boat Booking App!
        </Typography>

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          {user ? (
            // Display links for authenticated users
            <>
              <Typography variant="h6" align="center">
                Hello, <strong>{user.name || user.email}</strong>!
                {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                  <>
                    {' | Your role: '}
                    <strong>{user.role}</strong>
                  </>
                )}
              </Typography>


              {/* Conditional links to dashboards based on role and inline My Profile button */}
              {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                <Box display="flex" justifyContent="center" gap={2} mt={2}> {/* Added Box for flex row */}
                  {user.role === 'ADMIN' && (
                    <Button component={Link} to="/admin/dashboard" variant="contained" color="secondary" sx={{ color: 'white' }}>
                      Go to Admin Dashboard
                    </Button>
                  )}
                  {user.role === 'MANAGER' && (
                    <Button component={Link} to="/manager/dashboard" variant="contained" color="primary" sx={{ color: 'white' }}> {/* Changed color to primary for consistency */}
                      Go to Manager Dashboard
                    </Button>
                  )}
                  <Button component={Link} to="/profile" variant="outlined" color="primary">
                    My Profile
                  </Button>
                </Box>
              )}

              {/* Users will typically go to their bookings or profile directly */}
              {user.role === 'USER' && (
                <>
                  <Box display="flex" justifyContent="center" gap={2} mt={2}>
                    <Button component={Link} to="/bookings" variant="contained" color="primary" sx={{ color: 'white' }}>
                      My Bookings
                    </Button>
                    <Button component={Link} to="/profile" variant="outlined" color="primary">
                      My Profile
                    </Button>
                    <Button component={Link} to="/booking" variant="contained" color="primary" sx={{ color: 'white' }}>
                      Create new Booking
                    </Button>
                  </Box>
                </>
              )}

              {/* General logout link for all authenticated users */}
              <Button onClick={logout} variant="text" color="error">
                Logout
              </Button>
            </>
          ) : (
            // Display links for unauthenticated users
            <>
              <Typography variant="body1" align="center">
                Please log in or register to book a boat.
              </Typography>
              <Box display="flex" justifyContent="center" gap={2} mt={2}>
                <Button component={Link} to="/login" variant="contained" color="primary" sx={{ color: 'white' }}>
                  Login
                </Button>
                <Button component={Link} to="/register" variant="outlined" color="primary">
                  Register
                </Button>
              </Box>
            </>
          )}
        </Box>

        {/* Map Section - Uses fetched data */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2, mb: 2 }}> {/* Increased top margin */}
          Explore Our Ports
        </Typography>
        {portFetchError && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            Error: {portFetchError}
          </Typography>
        )}
        <Box
          sx={{
            height: '400px', // Fixed height for the map
            width: '100%',
            borderRadius: 2, // Rounded corners for the map box
            overflow: 'hidden', // Ensures map content stays within rounded corners
            mb: 4, // Margin below the map
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // Subtle shadow for map
          }}
        >
          {ports.length > 0 ? (
            <MapContainer
              center={calculateMapCenter()} // Dynamic center based on fetched ports
              zoom={6} // Default zoom level
              scrollWheelZoom={true} // Enable scroll zoom
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {ports.map((port) => (
                <Marker key={port.id} position={[port.latitude, port.longitude]}>
                  <Popup>
                    <Typography sx={{ display: 'flex', justifyContent: 'center', width: '100%' }} variant="h6">{port.name}</Typography>
                    <Typography variant="body2">
                      Latitude: {port.latitude.toFixed(4)}, Longitude: {port.longitude.toFixed(4)}
                    </Typography>

                    {/* Display boats if available */}
                    {port.boats && port.boats.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Divider sx={{ mb: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Available Boats:</Typography>
                        {port.boats.map((boat) => (
                          <Box key={boat.id} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                mr: 1,
                                flexShrink: 0, // Prevent shrinking
                                cursor: boat.imageUrl ? 'pointer' : 'default', // Only clickable if image exists
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: boat.imageUrl ? 'transparent' : '#e0e0e0', // Grey background for default
                                border: '1px solid #ccc',
                              }}
                              onClick={() => handleImageClick(boat.imageUrl, boat.name)}
                            >
                              {boat.imageUrl ? (
                                <img
                                  src={boat.imageUrl}
                                  alt={boat.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null; // Prevent infinite loop
                                    <Typography variant="caption" sx={{ fontSize: '1.2rem' }} aria-label={boat.name || 'Boat icon'}>
                                      ⛵
                                    </Typography>
                                  }}
                                />
                              ) : (
                                // Default image when no imageUrl is provided
                                (<img
                                  src="https://cdn.pixabay.com/photo/2013/04/01/21/33/motor-boat-99295_1280.png"
                                  alt={boat.name || 'Boat Image'} // Provide a fallback alt text
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />)
                              )}
                            </Box>
                            <Typography variant="body2">
                              {boat.name} ({boat.type})
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                    {port.boats && port.boats.length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'flex', justifyContent: 'center', width: '100%' }}>
                        No boats registered for this port.
                      </Typography>
                    )}

                    {/* Delete button for ADMIN users */}
                    {user && (user.role === 'ADMIN') && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{ mt: 1, display: 'flex', justifyContent: 'center', width: '100%' }}
                        onClick={() => handleDeletePort(port.id, port.name)}
                      >
                        Delete Port
                      </Button>
                    )}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="h6" color="text.secondary">
                No ports available to display.
              </Typography>
            </Box>
          )}
        </Box>
        {/* End Map Section */}

      </Paper>
    </Container>
  );
};

export default Home;
