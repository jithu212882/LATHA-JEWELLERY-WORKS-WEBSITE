import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { navigateTo } from '../../utils/navigation';

export default function ResetPasswordPage({ onComplete, onCancel }) {
  const { updatePassword, isAuthenticated } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(null); // null = checking

  useEffect(() => {
    let isSubscribed = true;

    async function checkRecoverySession() {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      if (
        hash.includes('access_token=') ||
        hash.includes('type=recovery') ||
        search.includes('type=recovery') ||
        search.includes('code=')
      ) {
        if (isSubscribed) setHasValidSession(true);
        return;
      }

      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && isSubscribed) {
            setHasValidSession(true);
            return;
          }
        } catch (e) {}
      }

      // Check after a brief delay to allow Supabase detectSessionInUrl to parse hash
      const timer = setTimeout(async () => {
        if (!isSubscribed) return;
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          const hashNow = window.location.hash || '';
          const searchNow = window.location.search || '';
          const valid =
            Boolean(session) ||
            hashNow.includes('access_token=') ||
            hashNow.includes('type=recovery') ||
            searchNow.includes('type=recovery');
          setHasValidSession(valid);
        } else {
          setHasValidSession(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }

    checkRecoverySession();

    // Listen for auth state change
    let authSub = null;
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!isSubscribed) return;
        if (event === 'PASSWORD_RECOVERY' || (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION'))) {
          setHasValidSession(true);
        }
      });
      authSub = subscription;
    }

    return () => {
      isSubscribed = false;
      authSub?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(newPassword);
      setSuccess(true);
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          navigateTo('/admin/login');
        }
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password. Your recovery link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceed = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigateTo('/admin/login');
    }
  };

  const handleBackToLogin = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigateTo('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4 selection:bg-accent-gold selection:text-[#121212]">
      <div className="max-w-md w-full p-8 bg-[#181818] border border-[#2A2A2A] rounded-2xl shadow-2xl text-center relative">
        {/* Brand Logo */}
        <div className="w-16 h-16 rounded-xl overflow-hidden border border-accent-gold/40 shadow-xl bg-[#121212] p-0.5 mx-auto mb-4 shrink-0">
          <img
            src="/assets/latha-jewellery-works-logo.jpeg"
            alt="Latha Jewellery Works"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        <h2 className="font-headline text-2xl font-bold text-accent-gold uppercase tracking-wider mb-1">
          Set New Password
        </h2>
        <p className="text-xs text-[#F5F2EB]/70 mb-6 font-light">
          Latha Jewellery Works Atelier Administrator Security
        </p>

        {success ? (
          <div className="space-y-5 py-4">
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <span className="material-symbols-outlined text-2xl">check</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                Password Successfully Updated
              </h3>
              <p className="text-xs text-[#F5F2EB]/70">
                Your new administrator password is active. Redirecting to login so you can sign in with your new credentials...
              </p>
            </div>
            <button
              onClick={handleProceed}
              className="w-full py-3.5 bg-accent-gold text-[#121212] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-supporting-beige transition-colors shadow-lg"
            >
              Proceed to Admin Login
            </button>
          </div>
        ) : hasValidSession === false ? (
          <div className="space-y-5 py-4">
            <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto text-amber-400">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                Password Reset Link Required
              </h3>
              <p className="text-xs text-[#F5F2EB]/70 leading-relaxed">
                No active password recovery session was detected. If you followed an email link, it may have expired. Please request a new recovery link from the login screen.
              </p>
            </div>
            <button
              onClick={handleBackToLogin}
              className="w-full py-3.5 bg-accent-gold text-[#121212] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-supporting-beige transition-colors shadow-lg"
            >
              Return to Admin Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-start gap-2">
                <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-accent-gold mb-1.5 font-medium">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters"
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 pr-10 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F2EB]/50 hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-accent-gold mb-1.5 font-medium">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent-gold text-[#121212] font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest hover:bg-supporting-beige transition-colors disabled:opacity-50 mt-2 shadow-lg flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#121212]/30 border-t-[#121212] rounded-full animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                'Update & Enter Studio'
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full text-center text-xs text-[#F5F2EB]/50 hover:text-accent-gold transition-colors pt-2 uppercase tracking-wider"
            >
              Cancel and Return to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
