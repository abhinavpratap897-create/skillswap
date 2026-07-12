import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Sun, Moon, User, Lock, Bell, Palette, Shield, Save } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, setUser } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', username: user?.username || '' });
  const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' });
  const [saved, setSaved] = useState(false);

  const saveAccount = async () => {
    try {
      const res = await api.put('/api/users/me', form);
      setUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
  };

  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Settings</h1>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }} className="md:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <div className="glass-card" style={{ padding: 8, height: 'fit-content' }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none', background: activeSection === s.id ? 'rgba(99,102,241,0.1)' : 'transparent', color: activeSection === s.id ? 'var(--primary-500)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontWeight: 500, textAlign: 'left' }}>
              <s.icon size={16} /> {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="glass-card" style={{ padding: 28 }}>
          {activeSection === 'account' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Account Settings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
                <div><label className="input-label">First Name</label><input className="input" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} /></div>
                <div><label className="input-label">Last Name</label><input className="input" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} /></div>
                <div><label className="input-label">Username</label><input className="input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={saveAccount} className="btn btn-primary btn-sm"><Save size={14} /> Save Changes</button>
                {saved && <span style={{ fontSize: 13, color: 'var(--success)' }}>✓ Saved!</span>}
              </div>
              <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
                <h3 style={{ fontWeight: 600, marginBottom: 8, color: 'var(--error)' }}>Danger Zone</h3>
                <button onClick={logout} className="btn btn-secondary btn-sm" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>Sign Out</button>
              </div>
            </div>
          )}

          {activeSection === 'password' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Change Password</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
                <div><label className="input-label">Current Password</label><input className="input" type="password" value={pwForm.old} onChange={e => setPwForm({...pwForm, old: e.target.value})} /></div>
                <div><label className="input-label">New Password</label><input className="input" type="password" value={pwForm.new} onChange={e => setPwForm({...pwForm, new: e.target.value})} /></div>
                <div><label className="input-label">Confirm Password</label><input className="input" type="password" value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})} /></div>
                <button className="btn btn-primary btn-sm" style={{ width: 'fit-content' }}><Lock size={14} /> Update Password</button>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Appearance</h2>
              <div style={{ display: 'flex', gap: 16 }}>
                {['light', 'dark'].map(t => (
                  <div key={t} onClick={() => { if (theme !== t) toggleTheme(); }}
                    style={{ padding: 20, borderRadius: 14, border: `2px solid ${theme === t ? 'var(--primary-500)' : 'var(--border-color)'}`, cursor: 'pointer', textAlign: 'center', width: 140, background: t === 'dark' ? '#131c31' : '#f8fafc', transition: 'all 0.2s' }}>
                    {t === 'dark' ? <Moon size={24} color="#94a3b8" /> : <Sun size={24} color="#f59e0b" />}
                    <p style={{ marginTop: 8, fontWeight: 600, fontSize: 14, textTransform: 'capitalize', color: t === 'dark' ? '#e2e8f0' : '#0f172a' }}>{t}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Notification Preferences</h2>
              {['Email notifications', 'Booking reminders', 'New message alerts', 'Review notifications', 'Marketing emails'].map(item => (
                <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 14 }}>{item}</span>
                  <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ display: 'none' }} />
                    <div style={{ width: 44, height: 24, borderRadius: 12, background: 'var(--primary-500)', transition: 'background 0.2s', position: 'relative' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: 23, transition: 'left 0.2s' }} />
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'privacy' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Privacy Settings</h2>
              {['Show profile in search', 'Show location', 'Show hourly rate', 'Allow messages from anyone'].map(item => (
                <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 14 }}>{item}</span>
                  <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ display: 'none' }} />
                    <div style={{ width: 44, height: 24, borderRadius: 12, background: 'var(--primary-500)', position: 'relative' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: 23 }} />
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
