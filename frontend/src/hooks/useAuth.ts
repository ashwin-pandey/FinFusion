import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { login, register, loginWithGoogle, getCurrentUser, logout, clearError } from '../store/slices/authSlice';
import { LoginCredentials, RegisterData } from '../services/authService';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  // Auto-fetch user on mount if token exists
  useEffect(() => {
    if (!user && isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user, isAuthenticated]);

  const handleLogin = async (credentials: LoginCredentials) => {
    return dispatch(login(credentials)).unwrap();
  };

  const handleRegister = async (data: RegisterData) => {
    return dispatch(register(data)).unwrap();
  };

  const handleGoogleLogin = async (tokenId: string) => {
    return dispatch(loginWithGoogle(tokenId)).unwrap();
  };

  const handleLogout = async () => {
    return dispatch(logout()).unwrap();
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    loginWithGoogle: handleGoogleLogin,
    logout: handleLogout,
    clearError: clearAuthError,
  };
};

