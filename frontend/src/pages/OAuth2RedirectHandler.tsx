import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (token && refreshToken) {
      login(token, refreshToken);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login?error=' + (error || 'OAuth2AuthenticationFailed'), { replace: true });
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-main text-xl animate-pulse">Authenticating with Google...</div>
    </div>
  );
};

export default OAuth2RedirectHandler;
