import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SPLLogo } from '../../components/common/SPLLogo';
import { Lock, Mail } from 'lucide-react';

const PitchLines = () => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.04 }}>
    <rect x="40" y="40" width="720" height="520" fill="none" stroke="white" strokeWidth="1.5"/>
    <line x1="400" y1="40" x2="400" y2="560" stroke="white" strokeWidth="1.5"/>
    <circle cx="400" cy="300" r="90" fill="none" stroke="white" strokeWidth="1.5"/>
    <circle cx="400" cy="300" r="3" fill="white"/>
    <rect x="40" y="160" width="130" height="280" fill="none" stroke="white" strokeWidth="1"/>
    <rect x="630" y="160" width="130" height="280" fill="none" stroke="white" strokeWidth="1"/>
  </svg>
);

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail]       = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--spl-black)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <PitchLines />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(26,86,219,0.10) 0%, transparent 60%)',
        }} />
        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(7,10,15,0.85) 100%)',
        }} />
      </div>

      {/* Login card */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 420,
        background: 'var(--spl-navy)',
        border: '1px solid var(--border-default)',
        borderRadius: 10,
        padding: '40px 36px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
      }}>
        {/* Top accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '10px 10px 0 0', background: 'var(--spl-blue)' }} />

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <SPLLogo size={96} />
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
            color: 'var(--spl-blue-light)', letterSpacing: '0.35em', marginBottom: 8,
          }}>
            FOOTBALL · AUCTION PLATFORM
          </div>
          <h1 style={{
            fontFamily: 'var(--font-broadcast)',
            fontSize: 32, color: '#fff',
            lineHeight: 1, letterSpacing: '0.02em', textTransform: 'uppercase',
            marginBottom: 6,
          }}>
            Control Center
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>
            Sign in to access the auction management system
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 16, padding: '10px 14px',
            background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)',
            borderRadius: 5,
            fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
            color: '#f87171', letterSpacing: '0.06em', textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{
              fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700,
              color: 'var(--text-muted)', letterSpacing: '0.2em', display: 'block', marginBottom: 6,
            }}>
              EMAIL
            </label>
            <div style={{ position: 'relative' }}>
              <Mail className="w-4 h-4" style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="input-field"
                style={{ paddingLeft: 36, paddingTop: 10, paddingBottom: 10, paddingRight: 12 }}
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label style={{
              fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700,
              color: 'var(--text-muted)', letterSpacing: '0.2em', display: 'block', marginBottom: 6,
            }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <Lock className="w-4 h-4" style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="input-field"
                style={{ paddingLeft: 36, paddingTop: 10, paddingBottom: 10, paddingRight: 12 }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%', padding: '13px 0',
              fontSize: 16, marginTop: 6,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>


      </div>
    </div>
  );
};
