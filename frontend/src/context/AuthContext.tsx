import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';

// The shape of the user data that will be stored in the context
interface UserDataType {
  id: string;
  email: string;
  name?: string; // Optional name
  role: 'ADMIN' | 'USER' | 'MANAGER'; // Prisma Role enum values
}

// The shape of the authentication context
interface AuthContextType {
  user: UserDataType | null; // The authenticated user's data, or null if not authenticated
  loadingAuth: boolean; // Indicates if the authentication status is currently being loaded
  loginSuccess: (userData: UserDataType) => void; // Function to call on successful login/registration
  logout: () => void; // Function to call for logout
  fetchUser: () => Promise<void>; // Function to explicitly re-fetch user data
}

// Create the AuthContext with an initial undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to wrap the application and provide authentication context
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDataType | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Initially true as we check auth status

  // Fetches the current user's profile from the backend.
  const fetchUser = useCallback(async () => {
    try {
      // Make a GET request to the profile endpoint.
      // Axios is configured globally to send cookies with credentials.
      const response = await axios.get<UserDataType>(`${process.env.REACT_APP_SERVER_URL}/api/profile`);
      setUser(response.data); // Set user data if successful
    } catch (error) {
      console.error("AuthContext: Failed to fetch user profile (likely unauthenticated or token expired):", error);
      setUser(null); // Clear user data if fetching fails
    } finally {
      setLoadingAuth(false); // Authentication status has been determined
    }
  }, []); // Dependency array is empty as fetchUser itself doesn't depend on external state

  // Effect to run `fetchUser` once on component mount to establish initial auth state
  useEffect(() => {
    fetchUser();
  }, [fetchUser]); // Depend on fetchUser to prevent unnecessary re-runs

  /**
   * Called upon successful login or registration.
   * Updates the `user` state. Since the JWT is httpOnly,
   * the token itself is not passed or stored in client-side state here.
   * userData - The user's basic data returned from the backend login/register endpoint.
   */
  const loginSuccess = (userData: UserDataType) => {
    setUser(userData);
  };

  /**
   * Logs out the user.
   * Makes a request to the backend to clear the httpOnly cookie
   * and then clears the user state in the frontend.
   */
  const logout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_SERVER_URL}/auth/logout`);
      setUser(null); // Clear user state in frontend
    } catch (error) {
      console.error("AuthContext: Logout failed:", error);
      // Even if backend logout fails, clear frontend state to avoid inconsistent state
      setUser(null);
    }
  };

  // The values provided to consumers of this context
  const contextValue = {
    user,
    loadingAuth,
    loginSuccess,
    fetchUser,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to consume the AuthContext.
 * Provides easy access to authentication state and functions within components.
 * Returns The AuthContextType object.
 * Throws An error if used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
