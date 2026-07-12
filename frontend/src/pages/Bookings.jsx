import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, Clock, Check, X, MapPin, ChevronRight } from 'lucide-react';

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/bookings').then(res => setBookings(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/api/bookings/${id}`, { status });
    const res = await api.get('/api/bookings');
    setBookings(res.data);
  };

  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab);
  const tabs = ['all', 'pending', 'accepted', 'completed', 'cancelled'];
  const statusColors = { pending: 'warning', accepted: 'success', completed: 'primary', rejected: 'error', cancelled: 'error' };

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>My Bookings</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Manage your sessions</p>
      </motion.div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ textTransform: 'capitalize', borderRadius: 100, border: '1px solid var(--border-color)', background: tab === t ? 'var(--primary-500)' : 'var(--bg-glass)', color: tab === t ? 'white' : 'var(--text-secondary)', cursor: 'pointer', padding: '6px 16px', fontSize: 13, fontWeight: 500 }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white' }}>
                    {(b.provider?.id === user?.id ? b.client : b.provider)?.first_name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{b.skill?.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      with {(b.provider?.id === user?.id ? b.client : b.provider)?.first_name} {(b.provider?.id === user?.id ? b.client : b.provider)?.last_name}
                    </div>
                  </div>
                </div>
                <span className={`badge badge-${statusColors[b.status] || 'primary'}`}>{b.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {new Date(b.scheduled_at).toLocaleDateString()}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {b.duration_minutes}min</span>
                {b.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {b.location}</span>}
                {b.total_price && <span>${b.total_price}</span>}
              </div>
              {b.notes && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{b.notes}</p>}
              {b.status === 'pending' && b.provider?.id === user?.id && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => updateStatus(b.id, 'accepted')} className="btn btn-primary btn-sm"><Check size={14} /> Accept</button>
                  <button onClick={() => updateStatus(b.id, 'rejected')} className="btn btn-secondary btn-sm" style={{ color: 'var(--error)' }}><X size={14} /> Decline</button>
                </div>
              )}
              {b.status === 'accepted' && (
                <button onClick={() => updateStatus(b.id, 'completed')} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}><Check size={14} /> Mark Complete</button>
              )}
            </motion.div>
          ))}
          {filtered.length === 0 && <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>No bookings found</p></div>}
        </div>
      )}
    </div>
  );
}
