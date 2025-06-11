import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Props for the PrivateRoute component.
 * children - The React elements to render if the user is authenticated and authorized.
 * allowedRoles - An optional array of roles.
 */
interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'USER' | 'MANAGER')[]; // Match Role enum string types
}

/**
 * PrivateRoute component.
 * This component acts as a guard for routes that require authentication
 * and/or specific roles. It handles redirection based on the authentication
 * status and user's role.
 *
 * It relies on the `useAuth` hook to get the current authentication state.
 *
 * {PrivateRouteProps} props - The props for the component.
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }: PrivateRouteProps) => {
  const { user, loadingAuth } = useAuth(); // Get user and loading state from AuthContext
  const navigate = useNavigate(); // Hook for programmatic navigation

  useEffect(() => {
    // If authentication status is still loading, do nothing and wait.
    if (loadingAuth) {
      return;
    }

    // If not loading and no user is authenticated, redirect to the login page.
    if (!user) {
      navigate('/login');
      return;
    }

    // If roles are specified and the user does not have an allowed role, redirect.
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      alert("You do not have permission to view this page.");
      navigate('/'); // Redirect to home page
      return;
    }

  }, [user, loadingAuth, navigate, allowedRoles]); // Dependencies for useEffect

  // While authentication status is loading, or if user is not authenticated/authorized,
  // return a loading indicator or null (to prevent rendering protected content).
  if (loadingAuth || !user || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return <div>{loadingAuth ? 'Loading content...' : 'Redirecting...'}</div>;
  }

  // If all checks pass, render the children components.
  return <>{children}</>;
};

export default PrivateRoute;
