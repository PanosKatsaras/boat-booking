import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Define a custom Material-UI theme.
const theme = createTheme({
  palette: {
    primary: {
      main: '#2fa5cc', // A shade of blue for primary actions/elements
    },
    secondary: {
      main: '#ffab40', // A shade of orange for secondary actions/elements
    },
    error: {
      main: red.A400, // Default red for error states
    },
    background: {
      default: '#dadfe0', // Light grey background for the app
      paper: '#ffffff', // White background for paper/card elements
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Default font family
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      marginBottom: '0.8rem',
    },
    body1: {
      fontSize: '1rem',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained', // Default button variant
        disableElevation: true, // Remove shadow by default
      },
      styleOverrides: {
        root: {
          borderRadius: 8, // Apply rounded corners to buttons
          textTransform: 'none', // Prevent uppercase transform
          padding: '10px 20px', // Add some padding
          fontWeight: 'bold',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', // Default text field variant
        fullWidth: true,     // Make text fields full width by default
        margin: 'normal',    // Default margin
      },
      styleOverrides: {
        root: {
          borderRadius: 8, // Apply rounded corners to text fields
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Apply more rounded corners to Paper components
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // Subtle shadow
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0, 
        },
      },
    },
  },
});

export default theme;
