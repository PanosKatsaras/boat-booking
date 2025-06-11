import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; 
import App from './App';
// import reportWebVitals from './reportWebVitals'; 

// Axios send cookies with all requests.
// This is crucial for handling httpOnly cookies which backend will use for JWTs.
import axios from 'axios';
axios.defaults.withCredentials = true;

// Create the root element for React application.
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render the main App component into the root.
root.render(
  // React.StrictMode enables strict mode checks for development
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

