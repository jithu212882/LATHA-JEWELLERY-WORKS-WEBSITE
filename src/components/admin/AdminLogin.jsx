import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin({ onClose }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('LATHA2024');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 bg-[#181818] border border-[#2A2A2A] rounded-2xl shadow-2xl text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#F5F2EB]/60 hover:text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="w-12 h-12 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-2xl">lock</span>
        </div>

        <h2 className="font-headline text-2xl font-bold text-accent-gold uppercase tracking-wider mb-1">
          Admin Studio Access
        </h2>
        <p className="text-xs text-[#F5F2EB]/70 mb-6 font-light">
          Enter master credentials to access the Latha Jewellery Works atelier dashboard.
        </p>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1.5 font-medium">
              Master Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1.5 font-medium">
              Master Key / Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent-gold text-[#121212] font-bold py-3.5 rounded-lg text-xs uppercase tracking-widest hover:bg-supporting-beige transition-colors disabled:opacity-50 mt-2"
          >
            {submitting ? 'Authenticating...' : 'Authenticate Studio'}
          </button>
        </form>

        <p className="text-[11px] text-[#F5F2EB]/40 mt-6">
          Default Password: <code className="text-accent-gold">LATHA2024</code>
        </p>
      </div>
    </div>
  );
}
