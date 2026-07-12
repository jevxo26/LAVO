"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { loginThunk, logoutThunk, fetchMeThunk, clearError, type AuthUser } from '@/store/slices/authSlice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector((s) => s.auth);
  const router = useRouter();

  // Rehydrate user on first mount if a token exists in localStorage
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMeThunk());
    }
  }, [token, user, dispatch]);

  const login = async (email: string, password: string) => {
    const result = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(result)) {
      router.push('/dashboard');
      return true;
    }
    return false;
  };

  const logout = async () => {
    await dispatch(logoutThunk());
    router.push('/login');
  };

  const dismissError = () => dispatch(clearError());

  return {
    user: user as AuthUser | null,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    dismissError,
  };
}
