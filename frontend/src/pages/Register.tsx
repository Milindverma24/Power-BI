import Logo from '../components/Logo';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/v1/auth/register', {
        firstName,
        lastName,
        email,
        password,
        role: 'ORG_ADMIN' // Default for new registration in this phase
      });
      if (response.data.token && response.data.refreshToken) {
        login(response.data.token, response.data.refreshToken);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-indigo/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-lg animate-slide-up my-8">
        <div className="bento-card p-8 sm:p-10 relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="flex justify-center mb-2">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-bold text-main mb-2">Create Account</h1>
            <p className="text-muted text-center">Join the future of Business Intelligence.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-2xl bg-accent-red/10 border border-accent-red/50 text-accent-red text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-main ml-1">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <UserIcon size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-surface/50 border border-border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-accent-indigo transition-all text-main placeholder-slate-500 outline-none"
                    placeholder="Jane"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-main ml-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface/50 border border-border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-accent-indigo transition-all text-main placeholder-slate-500 outline-none"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-main ml-1">Work Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface/50 border border-border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-accent-indigo transition-all text-main placeholder-slate-500 outline-none"
                  placeholder="jane@company.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-main ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface/50 border border-border-theme rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-accent-indigo transition-all text-main placeholder-slate-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-indigo hover:bg-accent-indigo text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(79,70,229,0.3)]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-primary font-medium hover:text-accent-primary transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
