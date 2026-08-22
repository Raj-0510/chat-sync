import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IoMailOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoChatbubblesOutline,
} from 'react-icons/io5';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <IoChatbubblesOutline className="logo-icon" />
            <h1>ChatSync</h1>
          </div>
          <p className="auth-subtitle">Sign in to continue to your workspace</p>
        </div>

        {/* Demo credentials banner */}
        <div className="demo-credentials-banner">
          <div className="demo-credentials-header">
            <strong>Testing / Trial Credentials</strong>
          </div>
          <p className="demo-credentials-text">
            To test real-time chat, you can use these two demo accounts in different browser sessions:
          </p>
          <div className="demo-credentials-fields">
            <div><span>Account 1:</span> <code>demo@chatsync.com</code></div>
            <div><span>Account 2:</span> <code>demo2@chatsync.com</code></div>
            <div><span>Password:</span> <code>demo123</code></div>
          </div>
          <div className="demo-autofill-group" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button
              type="button"
              className="demo-autofill-btn"
              onClick={() => {
                setEmail('demo@chatsync.com');
                setPassword('demo123');
              }}
              style={{ flex: 1 }}
            >
              Fill Account 1
            </button>
            <button
              type="button"
              className="demo-autofill-btn"
              onClick={() => {
                setEmail('demo2@chatsync.com');
                setPassword('demo123');
              }}
              style={{ flex: 1 }}
            >
              Fill Account 2
            </button>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="input-group">
            <IoMailOutline className="input-icon" />
            <input
              id="login-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="input-group">
            <IoLockClosedOutline className="input-icon" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="auth-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
