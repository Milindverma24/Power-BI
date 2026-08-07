import { useState } from 'react';
import Logo from '../components/Logo';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Database, Loader2, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass w-full max-w-md p-8 rounded-2xl border border-accent-red/50 text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-main mb-4">Invalid Link</h2>
          <p className="text-main mb-8">
            The password reset link is invalid or missing the token.
          </p>
          <Link to="/forgot-password" className="bg-accent-indigo hover:bg-accent-indigo text-main py-2 px-6 rounded-xl transition">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post('/api/v1/auth/reset-password', { token, newPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass w-full max-w-md p-8 rounded-2xl border border-border-theme text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <CheckCircle className="text-green-400" size={64} />
          </div>
          <h2 className="text-3xl font-bold text-main mb-4">Password Reset!</h2>
          <p className="text-main mb-8">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-accent-indigo hover:bg-accent-indigo text-main font-medium py-2 px-8 rounded-xl transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="glass w-full max-w-md p-8 rounded-2xl border border-border-theme relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-purple-500"></div>
        
        <div className="flex items-center gap-3 justify-center mb-8">
          <Database className="text-accent-primary" size={32} />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            AI-BI
          </h1>
        </div>
        
        <h2 className="text-2xl font-bold text-main text-center mb-2">Create New Password</h2>
        <p className="text-muted text-center mb-8">Enter your new password below.</p>

        {error && (
          <div className="bg-accent-red/10 border border-accent-red/50 text-accent-red p-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-main mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-primary-500 transition"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-main mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-surface border border-border-theme rounded-xl p-3 text-main focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-primary-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-indigo hover:bg-accent-indigo disabled:bg-accent-indigo/50 text-main font-medium py-3 rounded-xl transition flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
