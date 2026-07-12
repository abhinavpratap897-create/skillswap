import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', username: '', first_name: '', last_name: '' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useState(() => {
    if (location.pathname === '/register') setIsRegister(true);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const res = await api.post(endpoint, payload);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Google Login is handled via the GoogleLogin component automatically.

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 16, position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: '10%', left: '20%', width: 400, height: 400,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card" style={{ width: '100%', maxWidth: 440, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900, color: 'white',
          }}>S</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {isRegister ? 'Start your skill exchange journey' : 'Sign in to continue to SkillSwap'}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 10, marginBottom: 16,
            background: 'rgba(239,68,68,0.1)', color: 'var(--error)', fontSize: 13,
            border: '1px solid rgba(239,68,68,0.2)',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isRegister && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="input-label">First Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input" style={{ paddingLeft: 38 }} placeholder="John"
                    value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required />
                </div>
              </div>
              <div>
                <label className="input-label">Last Name</label>
                <input className="input" placeholder="Doe"
                  value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required />
              </div>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="input-label">Username</label>
              <input className="input" placeholder="johndoe"
                value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
            </div>
          )}

          <div>
            <label className="input-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" type="email" style={{ paddingLeft: 38 }} placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
          </div>

          <div>
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" type={show ? 'text' : 'password'} style={{ paddingLeft: 38, paddingRight: 42 }}
                placeholder="••••••••" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
              <button type="button" onClick={() => setShow(!show)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isRegister && (
            <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--primary-500)', textDecoration: 'none', textAlign: 'right' }}>
              Forgot password?
            </Link>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', marginTop: 4, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                setLoading(true);
                const res = await api.post('/api/auth/google', { token: credentialResponse.credential });
                login(res.data);
                navigate('/dashboard');
              } catch (err) {
                setError(err.response?.data?.detail || 'Google Login failed');
                setLoading(false);
              }
            }}
            onError={() => {
              setError('Google Login Failed');
            }}
            useOneTap
          />
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--primary-500)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
