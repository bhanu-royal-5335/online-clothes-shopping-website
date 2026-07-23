import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('userInfo');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data } = await api.get('/api/auth/profile');
          setUser(data);
          localStorage.setItem('userInfo', JSON.stringify(data));
        } catch (error) {
          console.error('Error restoring session profile:', error.message);
          // If session fails (unauthorized), clear cache
          setUser(null);
          localStorage.removeItem('userInfo');
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Error logging out:', err.message);
    } finally {
      setUser(null);
      localStorage.removeItem('userInfo');
    }
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/api/auth/profile', profileData);
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const verifyEmail = async () => {
    const { data } = await api.post('/api/auth/verify-email');
    const updatedUser = { ...user, isVerified: true };
    setUser(updatedUser);
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    return data;
  };

  const toggleWishlist = async (productId) => {
    if (!user) return;
    try {
      // Toggle locally first for high reactivity
      const isInWishlist = user.wishlist?.includes(productId);
      let updatedWishlist = [...(user.wishlist || [])];
      
      if (isInWishlist) {
        updatedWishlist = updatedWishlist.filter((id) => id !== productId);
      } else {
        updatedWishlist.push(productId);
      }

      // Optimistically update
      const updatedUser = { ...user, wishlist: updatedWishlist };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));

      // Sync with server
      // Note: We can save user profile with wishlist directly or we have a dedicated route.
      // Saving through the PUT profile route is a simple, robust fallback since it handles profile properties.
      await api.put('/api/auth/profile', { wishlist: updatedWishlist });
    } catch (error) {
      console.error('Failed to sync wishlist status:', error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        verifyEmail,
        toggleWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
