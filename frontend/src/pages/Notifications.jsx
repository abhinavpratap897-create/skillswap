import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Bell, Check, CheckCheck, Calendar, MessageSquare, Star, Info } from 'lucide-react';

const icons = { booking_request: Calendar, booking_accepted: Check, booking_rejected: Info, new_message: MessageSquare, new_review: Star, system: Bell };
const colors = { booking_request: 'var(--primary-500)', booking_accepted: 'var(--success)', booking_rejected: 'var(--error)', new_message: '#3b82f6', new_review: 'var(--accent-500)', system: 'var(--text-muted)' };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/notifications').then(res => setNotifications(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await api.put(`/api/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await api.put('/api/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Notifications</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{notifications.filter(n => !n.is_read).length} unread</p>
        </div>
        <button onClick={markAllRead} className="btn btn-secondary btn-sm"><CheckCheck size={14} /> Mark all read</button>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifications.map((n, i) => {
          const Icon = icons[n.type] || Bell;
          const color = colors[n.type] || 'var(--text-muted)';
          return (
            <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }} onClick={() => !n.is_read && markRead(n.id)}
              className="glass-card" style={{
                padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start',
                cursor: !n.is_read ? 'pointer' : 'default',
                opacity: n.is_read ? 0.6 : 1, transition: 'opacity 0.3s',
              }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{n.title}</div>
                {n.message && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{n.message}</p>}
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
              {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-500)', marginTop: 6 }} />}
            </motion.div>
          );
        })}
        {!loading && notifications.length === 0 && (
          <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
            <Bell size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
