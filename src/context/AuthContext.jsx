import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, PRIMARY_ADMIN_EMAIL } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * Helper to identify if the current browser window is in password recovery mode
   */
  const isRecoveryFlow = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname || '';
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    return (
      path.startsWith('/admin/reset-password') ||
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      (hash.includes('access_token=') && hash.includes('recovery'))
    );
  }, []);

  /**
   * Verifies that the authenticated user is an active administrator in public.admin_users.
   * Conforms strictly with UUID authorization (user_id = auth.uid()) and role/status validation.
   */
  const verifyAdminAuthorization = useCallback(async (authUser) => {
    if (!authUser || !authUser.id) {
      return { authorized: false, error: 'No authenticated user to verify' };
    }

    const userId = authUser.id;
    const email = (authUser.email || '').trim().toLowerCase();

    // 1. Direct Supabase Database Authorization Check by authenticated UUID
    // Conforms strictly with RLS policy: USING (user_id = auth.uid())
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, user_id, email, role, status')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        if (!error && data) {
          const roleValid = data.role === 'admin' || data.role === 'super_admin';
          const statusValid = data.status === 'active';
          const emailMatches = !email || !data.email || data.email.toLowerCase() === email;

          if (roleValid && statusValid && emailMatches && data.user_id === userId) {
            return {
              authorized: true,
              role: data.role,
              status: data.status,
              user_id: data.user_id,
              email: data.email || email,
            };
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Supabase DB check exception:', err.message);
      }
    }

    // 2. Serverless API verification check (/api/auth/verify-admin)
    // Passes authenticated UUID and email for server-side verification and safe initial owner linking
    try {
      const res = await fetch('/api/auth/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      });

      if (res.ok) {
        const json = await res.json();
        if (
          json.authorized &&
          (!json.user_id || json.user_id === userId) &&
          (json.role === 'admin' || json.role === 'super_admin') &&
          json.status === 'active'
        ) {
          return {
            authorized: true,
            role: json.role,
            status: json.status,
            user_id: json.user_id || userId,
            email: json.email || email,
          };
        }
      }
    } catch (apiErr) {
      console.warn('[AuthContext] verify-admin API check warning:', apiErr.message);
    }

    return {
      authorized: false,
      error: 'Access denied. You are not authorized as an administrator.',
    };
  }, []);

  /**
   * Initializes and synchronizes the session with Supabase Auth on load
   */
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setIsLoading(true);

      if (!supabase) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      // If user landed on password recovery flow, protect the recovery session
      if (isRecoveryFlow()) {
        try {
          const { data: { session: recoverySession } } = await supabase.auth.getSession();
          if (recoverySession && isMounted) {
            setSession(recoverySession);
            setToken(recoverySession.access_token);
          }
        } catch (e) {}
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.warn('[AuthContext] getSession notice:', sessionError.message);
        }

        if (initialSession?.user) {
          const authResult = await verifyAdminAuthorization(initialSession.user);
          if (isMounted) {
            if (authResult.authorized) {
              setSession(initialSession);
              setToken(initialSession.access_token);
              setUser({
                id: initialSession.user.id,
                email: initialSession.user.email,
                username: initialSession.user.email.split('@')[0],
                role: authResult.role || 'admin',
              });
              setAuthError(null);
            } else {
              // Sign out immediately if not authorized as active admin
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              setToken(null);
              setAuthError(authResult.error);
            }
          }
        }
      } catch (err) {
        console.error('[AuthContext] Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Listen to Supabase Auth state changes (sign in, sign out, token refresh, password recovery)
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!isMounted) return;

        // 1. Password recovery event from email link
        if (event === 'PASSWORD_RECOVERY') {
          setSession(currentSession);
          if (currentSession?.access_token) {
            setToken(currentSession.access_token);
          }
          if (typeof window !== 'undefined' && window.location.pathname !== '/admin/reset-password') {
            const target = '/admin/reset-password' + window.location.search + window.location.hash;
            window.history.replaceState(null, '', target);
            window.dispatchEvent(new Event('locationchange'));
          }
          return;
        }

        // 2. Auth events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          // If in password recovery flow, keep session and DO NOT sign out or redirect
          if (isRecoveryFlow()) {
            setSession(currentSession);
            if (currentSession?.access_token) {
              setToken(currentSession.access_token);
            }
            return;
          }

          if (currentSession?.user) {
            const authResult = await verifyAdminAuthorization(currentSession.user);
            if (authResult.authorized) {
              setSession(currentSession);
              setToken(currentSession.access_token);
              setUser({
                id: currentSession.user.id,
                email: currentSession.user.email,
                username: currentSession.user.email.split('@')[0],
                role: authResult.role || 'admin',
              });
              setAuthError(null);
            } else {
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              setToken(null);
              setAuthError('Access denied: Unauthorized admin account');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setToken(null);
          localStorage.removeItem('latha_admin_token');
        }
      });

      return () => {
        isMounted = false;
        subscription?.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [verifyAdminAuthorization, isRecoveryFlow]);

  /**
   * Primary Administrator Login:
   * 1. Supabase Auth authentication (email + password)
   * 2. Database authorization check (public.admin_users matching user_id UUID)
   */
  const login = async (emailOrUsername, password) => {
    setAuthError(null);
    const identifier = (emailOrUsername || '').trim();

    // Resolve email (allow store owner to type username or official brand email)
    const email = identifier.includes('@')
      ? identifier.toLowerCase()
      : identifier.toLowerCase() === 'admin'
      ? PRIMARY_ADMIN_EMAIL
      : `${identifier.toLowerCase()}@gmail.com`;

    if (!supabase) {
      throw new Error('Supabase client is not configured.');
    }

    // Step 1: Sign in with Supabase Auth
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      const msg = signInError.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please verify your credentials or use Forgot Password.'
        : signInError.message;
      setAuthError(msg);
      throw new Error(msg);
    }

    // Step 2: Database UUID RBAC Authorization Check
    const authResult = await verifyAdminAuthorization(authData.user);

    if (!authResult.authorized) {
      await supabase.auth.signOut();
      const deniedMsg = authResult.error || 'Access Denied: This account is not registered as an active administrator in the database.';
      setAuthError(deniedMsg);
      throw new Error(deniedMsg);
    }

    setSession(authData.session);
    setToken(authData.session.access_token);
    const authenticatedUser = {
      id: authData.user.id,
      email: authData.user.email,
      username: authData.user.email.split('@')[0],
      role: authResult.role || 'admin',
    };
    setUser(authenticatedUser);
    localStorage.setItem('latha_admin_token', authData.session.access_token);
    return { user: authenticatedUser, session: authData.session };
  };

  /**
   * Sends password recovery email via Supabase Auth.
   * Explicitly passes the dynamic origin redirect to /admin/reset-password.
   */
  const sendPasswordReset = async (emailToReset) => {
    setAuthError(null);
    const email = (emailToReset || PRIMARY_ADMIN_EMAIL).trim().toLowerCase();

    if (!supabase) {
      throw new Error('Supabase client is not configured.');
    }

    // Use current origin dynamically for localhost or production Vercel
    const origin = (typeof window !== 'undefined' && window.location?.origin)
      ? window.location.origin
      : 'https://latha-jewellery-works.vercel.app';
    const redirectTo = `${origin}/admin/reset-password`;

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setAuthError(error.message);
      throw new Error(error.message);
    }

    return {
      success: true,
      message: `Password reset instructions sent to ${email}. Please check your inbox and spam folder.`,
      redirectTo,
      data,
    };
  };

  /**
   * Updates user password via Supabase Auth after recovery link is clicked
   */
  const updatePassword = async (newPassword) => {
    setAuthError(null);
    if (!supabase) {
      throw new Error('Supabase client is not configured.');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setAuthError(error.message);
      throw new Error(error.message);
    }

    // Cleanly terminate the recovery session after updating password
    try {
      await supabase.auth.signOut();
    } catch (e) {}

    setSession(null);
    setUser(null);
    setToken(null);
    localStorage.removeItem('latha_admin_token');

    return {
      success: true,
      message: 'Password updated successfully. Please log in with your new password.',
      user: data.user,
    };
  };

  /**
   * Logs out the administrator and terminates the session
   */
  const logout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[AuthContext] SignOut notice:', err.message);
    } finally {
      setSession(null);
      setUser(null);
      setToken(null);
      setAuthError(null);
      localStorage.removeItem('latha_admin_token');

      // Navigate to /admin/login
      if (typeof window !== 'undefined') {
        window.history.pushState({ hasHomeRoot: true, page: '/admin/login' }, '', '/admin/login');
        window.dispatchEvent(new Event('locationchange'));
      }
    }
  };

  const clearError = () => setAuthError(null);

  const value = {
    session,
    user,
    token,
    isAuthenticated: Boolean(user && (token || session)),
    isLoading,
    authenticating: isLoading,
    authError,
    login,
    logout,
    sendPasswordReset,
    updatePassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
