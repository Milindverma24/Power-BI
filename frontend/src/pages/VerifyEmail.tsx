import { useEffect, useState } from 'react';
import Logo from '../components/Logo';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('No verification token provided in the URL.');
        setLoading(false);
        return;
      }

      try {
        await axios.post('/api/v1/auth/verify-email', { token });
        setSuccess(true);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Verification failed. The link may have expired.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="glass w-full max-w-md p-8 rounded-2xl border border-border-theme text-center animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-purple-500"></div>
        
        {loading ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="animate-spin text-accent-primary mb-4" size={48} />
            <h2 className="text-xl font-bold text-main">Verifying your email...</h2>
            <p className="text-muted mt-2">Please wait while we confirm your account.</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center py-4">
            <CheckCircle className="text-green-400 mb-6" size={64} />
            <h2 className="text-2xl font-bold text-main mb-4">Email Verified!</h2>
            <p className="text-main mb-8">
              Your email address has been successfully verified. You can now access all features.
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-accent-indigo hover:bg-accent-indigo text-main font-medium py-2 px-8 rounded-xl transition"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <XCircle className="text-accent-red mb-6" size={64} />
            <h2 className="text-2xl font-bold text-main mb-4">Verification Failed</h2>
            <p className="text-main mb-8">{error}</p>
            <Link to="/login" className="bg-surface-hover hover:bg-surface-hover text-main font-medium py-2 px-8 rounded-xl transition">
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
