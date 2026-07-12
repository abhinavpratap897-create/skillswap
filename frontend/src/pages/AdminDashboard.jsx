import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Users, Zap, Calendar, Star, ToggleLeft, ToggleRight, Search, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/stats').catch(() => ({ data: null })),
      api.get('/api/admin/users').catch(() => ({ data: [] })),
    ]).then(([s, u]) => { setStats(s.data); setUsers(u.data); }).finally(() => setLoading(false));
  }, []);

  const toggleUser = async (id) => {
    await api.put(`/api/admin/users/${id}/toggle-active`);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
  };

  const searchUsers = async () => {
    const res = await api.get(`/api/admin/users?search=${search}`);
    setUsers(res.data);
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'var(--primary-500)' },
    { label: 'Total Skills', value: stats.total_skills, icon: Zap, color: '#22c55e' },
    { label: 'Total Bookings', value: stats.total_bookings, icon: Calendar, color: '#f59e0b' },
    { label: 'Total Reviews', value: stats.total_reviews, icon: Star, color: '#ec4899' },
  ] : [];

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Shield size={28} color="var(--primary-500)" />
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Platform management and analytics</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{s.value}</div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={20} color={s.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* User Management */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>User Management</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" style={{ maxWidth: 240 }} placeholder="Search users..."
              value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchUsers()} />
            <button onClick={searchUsers} className="btn btn-primary btn-sm"><Search size={14} /></button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>
                        {u.first_name?.[0]}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.first_name} {u.last_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '10px 12px' }}><span className="badge badge-primary">{u.role}</span></td>
                  <td style={{ padding: '10px 12px' }}><span className={`badge badge-${u.is_active ? 'success' : 'error'}`}>{u.is_active ? 'Active' : 'Disabled'}</span></td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 13 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <button onClick={() => toggleUser(u.id)} className="btn-ghost btn-sm"
                      style={{ color: u.is_active ? 'var(--error)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}>
                      {u.is_active ? <><ToggleRight size={16} /> Disable</> : <><ToggleLeft size={16} /> Enable</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
