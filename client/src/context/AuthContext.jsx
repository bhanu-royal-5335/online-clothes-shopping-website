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
          setUser(null);
          localStorage.removeItem('userInfo');
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // Unified Login (Email OR Phone Number + Password)
  const login = async (identifier, password) => {
    const { data } = await api.post('/api/auth/login', { identifier, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  // Phone Login alias
  const loginPhone = async (phone, countryCode, password) => {
    const { data } = await api.post('/api/auth/login-phone', { phone, countryCode, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  // Direct Registration (Name, Email, Phone, CountryCode, Password - NO OTP)
  const register = async (name, email, phone, countryCode, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, phone, countryCode, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  // Send Phone Registration OTP
  const sendRegistrationOTP = async (phone, countryCode) => {
    const { data } = await api.post('/api/auth/send-registration-otp', { phone, countryCode });
    return data;
  };

  // Verify Phone Registration OTP & Auto-Login
  const verifyRegistrationOTPAndRegister = async (registrationData) => {
    const { data } = await api.post('/api/auth/verify-registration-otp', registrationData);
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  // Send Forgot Password OTP to Phone
  const forgotPasswordPhone = async (phone, countryCode) => {
    const { data } = await api.post('/api/auth/forgot-password-phone', { phone, countryCode });
    return data;
  };

  // Reset Password via Phone OTP
  const resetPasswordPhone = async (resetData) => {
    const { data } = await api.post('/api/auth/reset-password-phone', resetData);
    return data;
  };

  // Send Forgot Password OTP to Email / Gmail
  const forgotPasswordEmailOTP = async (email) => {
    const { data } = await api.post('/api/auth/forgot-password-email-otp', { email });
    return data;
  };

  // Reset Password via Email OTP
  const resetPasswordEmailOTP = async (resetData) => {
    const { data } = await api.post('/api/auth/reset-password-email-otp', resetData);
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
      const isInWishlist = user.wishlist?.includes(productId);
      let updatedWishlist = [...(user.wishlist || [])];
      
      if (isInWishlist) {
        updatedWishlist = updatedWishlist.filter((id) => id !== productId);
      } else {
        updatedWishlist.push(productId);
      }

      const updatedUser = { ...user, wishlist: updatedWishlist };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));

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
        loginPhone,
        register,
        sendRegistrationOTP,
        verifyRegistrationOTPAndRegister,
        forgotPasswordPhone,
        resetPasswordPhone,
        forgotPasswordEmailOTP,
        resetPasswordEmailOTP,
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
