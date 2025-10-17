import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { authAPI } from '../utils/api';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  register: () => {},
  logout: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verify token and restore session on mount
  useEffect(() => {
    const verifyAndRestoreSession = async () => {
      const token = localStorage.getItem('lsrToken');
      const storedUser = localStorage.getItem('lsrUser');

      if (token && storedUser) {
        try {
          // Verify token is still valid
          const response = await authAPI.verifyToken(token);
          
          if (response.success) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('lsrToken');
            localStorage.removeItem('lsrUser');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // Token expired or invalid, clear storage
          localStorage.removeItem('lsrToken');
          localStorage.removeItem('lsrUser');
        }
      }
      
      setIsLoading(false);
    };

    verifyAndRestoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);

      if (response.success) {
        const userData = response.user;
        const token = response.token;

        // Store token and user data in localStorage (persists for 1 week)
        localStorage.setItem('lsrToken', token);
        localStorage.setItem('lsrUser', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await authAPI.register(email, password, name);

      if (response.success) {
        const userData = response.user;
        const token = response.token;

        // Store token and user data in localStorage
        localStorage.setItem('lsrToken', token);
        localStorage.setItem('lsrUser', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('lsrToken');
    localStorage.removeItem('lsrUser');
    
    // Clear state
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isLoading,
        login, 
        register,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
