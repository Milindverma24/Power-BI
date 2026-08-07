import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Loader2 } from 'lucide-react';

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invite token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post('/api/v1/organizations/invites/accept', {
        token,
        password
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to accept invite. It may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-main">{error}</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-surface border border-border-theme rounded-3xl shadow-xl overflow-hidden animate-fade-in p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-accent-primary/20 rounded-2xl flex items-center justify-center text-accent-primary mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-main">Accept Invitation</h1>
          <p className="text-muted text-center mt-2">
            Set your password to activate your account and join the organization.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="text-accent-emerald bg-accent-emerald/10 p-4 rounded-xl border border-accent-emerald/20">
              Account activated successfully! Redirecting you to login...
            </div>
            <Loader2 className="w-8 h-8 animate-spin text-accent-emerald mx-auto" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-xl">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-main mb-1">New Password</label>
              <input
                type="password"
                required
                className="w-full bg-background border border-border-theme text-main rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-main mb-1">Confirm Password</label>
              <input
                type="password"
                required
                className="w-full bg-background border border-border-theme text-main rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-accent-primary hover:bg-accent-primary-hover text-white rounded-xl font-medium transition-all shadow-lg shadow-accent-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Activate Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
