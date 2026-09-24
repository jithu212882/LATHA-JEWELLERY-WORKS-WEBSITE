import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PRIMARY_ADMIN_EMAIL } from '../../lib/supabaseClient';
import { navigateTo } from '../../utils/navigation';

export default function AdminLogin({ onClose, onSuccess }) {
  const { login, sendPasswordReset, authError, clearError } = useAuth();
  const [email, setEmail] = useState(PRIMARY_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  // Forgot Password Mode State
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState(PRIMARY_ADMIN_EMAIL);
  const [resetSent, setResetSent] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError?.();
    setSubmitting(true);

    try {
      await login(email, password);
      if (onSuccess) {
        onSuccess();
      } else {
        navigateTo('/admin/dashboard');
      }
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError?.();
    setResetSubmitting(true);

    try {
      const res = await sendPasswordReset(forgotEmail);
      setResetSent(true);
      setResetMessage(res.message || `Password recovery link sent to ${forgotEmail}. Check your inbox.`);
    } catch (err) {
      setLocalError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigateTo('/');
    }
  };

  const activeError = localError || authError;

  return (
    <div className="fixed inset-0 z-[120] bg-[#0D0D0D]/95 backdrop-blur-xl flex items-center justify-center p-4 selection:bg-accent-gold selection:text-[#121212]">
      <div className="max-w-md w-full p-8 bg-[#181818] border border-[#2A2A2A] rounded-2xl shadow-2xl text-center relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#F5F2EB]/50 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close"
          title="Return to Storefront"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Brand Logo */}
        <div className="w-16 h-16 rounded-xl overflow-hidden border border-accent-gold/40 shadow-xl bg-[#121212] p-0.5 mx-auto mb-4 shrink-0">
          <img
            src="/assets/latha-jewellery-works-logo.jpeg"
            alt="Latha Jewellery Works"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        <h2 className="font-headline text-2xl font-bold text-accent-gold uppercase tracking-wider mb-1">
          {forgotMode ? 'Recover Password' : 'Admin Studio Access'}
        </h2>
        <p className="text-xs text-[#F5F2EB]/70 mb-6 font-light">
          {forgotMode
            ? 'Receive an official Supabase recovery link to securely reset your credentials.'
            : 'Enter authorized administrator credentials to access the atelier dashboard.'}
        </p>

        {/* Error Notification */}
        {activeError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs mb-4 flex items-start gap-2 text-left">
            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
            <span className="flex-1">{activeError}</span>
          </div>
        )}

        {forgotMode ? (
          /* Forgot Password View */
          resetSent ? (
            <div className="space-y-4 py-2">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <span className="material-symbols-outlined text-2xl">mail</span>
              </div>
              <div className="space-y-1 text-center">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  Check Your Inbox
                </h3>
                <p className="text-xs text-[#F5F2EB]/80 leading-relaxed">
                  {resetMessage}
                </p>
                <p className="text-[11px] text-[#F5F2EB]/50 pt-2">
                  Click the link in the email to open the password reset page and set your new password.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setResetSent(false);
                }}
                className="w-full mt-4 py-3 bg-[#121212] border border-[#2A2A2A] text-accent-gold font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#202020] transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs uppercase tracking-wider text-accent-gold mb-1.5 font-medium">
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="lathajewelleryworks@gmail.com"
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={resetSubmitting}
                className="w-full bg-accent-gold text-[#121212] font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest hover:bg-supporting-beige transition-colors disabled:opacity-50 mt-2 shadow-lg flex items-center justify-center gap-2"
              >
                {resetSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#121212]/30 border-t-[#121212] rounded-full animate-spin" />
                    <span>Sending Recovery Link...</span>
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setLocalError('');
                }}
                className="w-full text-center text-xs text-[#F5F2EB]/60 hover:text-accent-gold transition-colors pt-2 uppercase tracking-wider"
              >
                Back to Sign In
              </button>
            </form>
          )
        ) : (
          /* Standard Sign In Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs uppercase tracking-wider text-accent-gold mb-1.5 font-medium">
                Admin Email / Username
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lathajewelleryworks@gmail.com"
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider text-accent-gold font-medium">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(true);
                    setLocalError('');
                  }}
                  className="text-[11px] text-accent-gold/80 hover:text-accent-gold hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent-gold text-[#121212] font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest hover:bg-supporting-beige transition-colors disabled:opacity-50 mt-2 shadow-lg flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#121212]/30 border-t-[#121212] rounded-full animate-spin" />
                  <span>Authenticating Studio...</span>
                </>
              ) : (
                'Sign In to Atelier'
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-[#2A2A2A]/60 flex items-center justify-between text-[11px] text-[#F5F2EB]/40">
          <span>Est. 1990 • Chathencode</span>
          <button
            onClick={handleClose}
            className="hover:text-accent-gold transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Storefront
          </button>
        </div>
      </div>
    </div>
  );
}
