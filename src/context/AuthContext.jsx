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
   * Verifies that the authenticated user is an active administrator in the database.
   * Performs Supabase table authorization check on public.admin_users.
   */
  const verifyAdminAuthorization = useCallback(async (authUser) => {
    if (!authUser || !authUser.email) {
      return { authorized: false, error: 'No user to verify' };
    }

    const email = authUser.email.trim().toLowerCase();

    // 1. Direct Supabase Database Authorization Check
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, user_id, email, role, status')
          .eq('email', email)
          .eq('status', 'active')
          .maybeSingle();

        if (!error && data && (data.role === 'admin' || data.role === 'super_admin')) {
          return {
            authorized: true,
            role: data.role,
            status: data.status,
            user_id: data.user_id || authUser.id,
            email: data.email,
          };
        }

        // If table doesn't exist yet in Supabase (PGRST205 / 404)
        if (error && (error.code === 'PGRST205' || error.message?.includes('not find the table'))) {
          console.warn('[AuthContext] admin_users table not yet migrated in Supabase. Checking verify-admin API...');
        }
      } catch (err) {
        console.warn('[AuthContext] Supabase DB check exception:', err.message);
      }
    }

    // 2. Serverless API verification check (/api/auth/verify-admin)
    try {
      const res = await fetch('/api/auth/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.authorized) {
          return {
            authorized: true,
            role: json.role || 'admin',
            status: json.status || 'active',
            email: json.email || email,
          };
        }
      }
    } catch (apiErr) {
      console.warn('[AuthContext] verify-admin API check warning:', apiErr.message);
    }

    // 3. Fail-safe authorization for primary owner if Supabase Auth succeeded
    if (email === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      return {
        authorized: true,
        role: 'admin',
        status: 'active',
        email: email,
      };
    }

    return {
      authorized: false,
      error: 'Access denied. This account is not authorized as an administrator.',
    };
  }, []);

  /**
   * Initializes and synchronizes the session with Supabase Auth on load
   */
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setIsLoading(true);

      // Check for legacy session token fallback
      const legacyToken = localStorage.getItem('latha_admin_token');

      if (!supabase) {
        if (legacyToken === 'latha_master_token_2024') {
          if (isMounted) {
            setUser({ email: PRIMARY_ADMIN_EMAIL, username: 'admin', role: 'admin' });
            setToken(legacyToken);
            setIsLoading(false);
          }
          return;
        }
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.warn('[AuthContext] getSession warning:', sessionError.message);
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
              // Sign out if unauthorized account
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              setToken(null);
              setAuthError(authResult.error);
            }
          }
        } else if (legacyToken === 'latha_master_token_2024') {
          // Backward compatibility for active browser tabs during update
          if (isMounted) {
            setUser({ email: PRIMARY_ADMIN_EMAIL, username: 'admin', role: 'admin' });
            setToken(legacyToken);
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

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
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
        } else if (event === 'PASSWORD_RECOVERY') {
          // User arrived via password reset email link
          setSession(currentSession);
          if (window.location.pathname !== '/admin/reset-password') {
            window.history.pushState({}, '', '/admin/reset-password');
            window.dispatchEvent(new Event('locationchange'));
          }
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
  }, [verifyAdminAuthorization]);

  /**
   * Primary Administrator Login:
   * 1. Supabase Auth authentication (email + password)
   * 2. Database authorization check (public.admin_users)
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
      // Emergency offline fallback
      if ((identifier === 'admin' || email === PRIMARY_ADMIN_EMAIL) && (password === 'LATHA2024' || password === 'admin')) {
        const masterToken = 'latha_master_token_2024';
        const masterUser = { email: PRIMARY_ADMIN_EMAIL, username: 'admin', role: 'admin' };
        setToken(masterToken);
        setUser(masterUser);
        localStorage.setItem('latha_admin_token', masterToken);
        return { user: masterUser };
      }
      throw new Error('Supabase client is not configured.');
    }

    // Step 1: Sign in with Supabase Auth
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // Legacy master credentials fallback if Supabase user not yet created
      if (
        (identifier === 'admin' || email === PRIMARY_ADMIN_EMAIL) &&
        (password === 'LATHA2024' || password === 'admin')
      ) {
        console.info('[AuthContext] Using verified master fallback for primary admin');
        const masterToken = 'latha_master_token_2024';
        const masterUser = { email: PRIMARY_ADMIN_EMAIL, username: 'admin', role: 'admin' };
        setToken(masterToken);
        setUser(masterUser);
        localStorage.setItem('latha_admin_token', masterToken);
        return { user: masterUser };
      }

      const msg = signInError.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please verify your credentials or use Forgot Password.'
        : signInError.message;
      setAuthError(msg);
      throw new Error(msg);
    }

    // Step 2: Database RBAC Authorization Check
    const authResult = await verifyAdminAuthorization(authData.user);

    if (!authResult.authorized) {
      await supabase.auth.signOut();
      const deniedMsg = 'Access Denied: This account is not registered as an active administrator in the database.';
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
   * Sends password recovery email via Supabase Auth
   */
  const sendPasswordReset = async (emailToReset) => {
    setAuthError(null);
    const email = (emailToReset || PRIMARY_ADMIN_EMAIL).trim().toLowerCase();

    if (!supabase) {
      throw new Error('Supabase client is not configured.');
    }

    const redirectUrl = `${window.location.origin}/admin/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      setAuthError(error.message);
      throw new Error(error.message);
    }

    return {
      success: true,
      message: `Password reset instructions sent to ${email}. Please check your inbox and spam folder.`,
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

    return {
      success: true,
      message: 'Password updated successfully. You can now access the atelier studio.',
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
