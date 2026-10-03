import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('tihs_token');
      const storedUser = localStorage.getItem('tihs_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await authApi.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('tihs_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('[Auth] Session validation expired:', error.message);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      if (res.data.success) {
        const { accessToken, refreshToken, user: loggedUser } = res.data;
        localStorage.setItem('tihs_token', accessToken);
        localStorage.setItem('tihs_refresh_token', refreshToken);
        localStorage.setItem('tihs_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        toast.success(`Welcome back, ${loggedUser.name}!`);
        return { success: true, user: loggedUser };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      if (res.data.success) {
        const { accessToken, refreshToken, user: registeredUser } = res.data;
        if (accessToken) localStorage.setItem('tihs_token', accessToken);
        if (refreshToken) localStorage.setItem('tihs_refresh_token', refreshToken);
        if (registeredUser) localStorage.setItem('tihs_user', JSON.stringify(registeredUser));
        if (registeredUser) setUser(registeredUser);
        if (res.data.message) toast.success(res.data.message);
        return {
          success: true,
          user: registeredUser,
          devOtp: res.data.devOtp,
          emailSent: res.data.emailSent,
          unverified: res.data.unverified,
          message: res.data.message,
        };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      return {
        success: false,
        message: msg,
        isVerified: error.response?.data?.isVerified,
      };
    }
  };

  const resendOtp = async (email) => {
    try {
      const res = await authApi.resendOtp({ email });
      if (res.data.success) {
        toast.success(res.data.message || 'Fresh OTP code sent to your email inbox!');
        return {
          success: true,
          devOtp: res.data.devOtp,
          otp: res.data.otp,
          emailSent: res.data.emailSent,
          message: res.data.message,
        };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to resend OTP.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      const res = await authApi.verifyEmail({ email, otp });
      if (res.data.success) {
        toast.success('Email successfully verified!');
        if (user) {
          const updatedUser = { ...user, isVerified: true };
          setUser(updatedUser);
          localStorage.setItem('tihs_user', JSON.stringify(updatedUser));
        }
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid or expired OTP';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('tihs_token');
    localStorage.removeItem('tihs_refresh_token');
    localStorage.removeItem('tihs_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('tihs_user', JSON.stringify(res.data.user));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateProfilePhoto = async (profilePhoto) => {
    try {
      const res = await authApi.updateProfilePhoto({ profilePhoto });
      if (res.data.success) {
        const updated = res.data.user || { ...user, profilePhoto };
        setUser(updated);
        localStorage.setItem('tihs_user', JSON.stringify(updated));
        toast.success('Profile photo updated successfully!');
        return { success: true, user: updated };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile photo';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const updateProfile = async (details) => {
    try {
      const res = await authApi.updateProfile(details);
      if (res.data.success) {
        const updated = res.data.user || { ...user, ...details };
        setUser(updated);
        localStorage.setItem('tihs_user', JSON.stringify(updated));
        toast.success('Profile details updated successfully!');
        return { success: true, user: updated };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile details';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        resendOtp,
        verifyEmail,
        logout,
        refreshUser,
        updateProfilePhoto,
        updateProfile,
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
