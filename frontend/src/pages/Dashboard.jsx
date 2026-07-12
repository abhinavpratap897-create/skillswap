import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, Star, TrendingUp, Clock, ArrowRight, Users, Zap } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ bookings: 0, skills: 0, reviews: 0, rating: 0 });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/bookings').catch(() => ({ data: [] })),
      api.get('/api/skills/user/my-skills').catch(() => ({ data: [] })),
      api.get('/api/reviews/user/' + user?.id).catch(() => ({ data: [] })),
    ]).then(([b, s, r]) => {
      setBookings(b.data.slice(0, 5));
      const avgRating = r.data.length ? r.data.reduce((a, x) => a + x.rating, 0) / r.data.length : 0;
      setStats({
        bookings: b.data.length,
        skills: s.data.length,
        reviews: r.data.length,
        rating: avgRating.toFixed(1),
      });
    }).finally(() => setLoading(false));
  }, [user]);

  const statCards = [
    { label: 'Active Bookings', value: stats.bookings, icon: Calendar, color: 'var(--primary-500)' },
    { label: 'My Skills', value: stats.skills, icon: Zap, color: '#22c55e' },
    { label: 'Reviews', value: stats.reviews, icon: Star, color: '#f59e0b' },
    { label: 'Avg Rating', value: stats.rating || '—', icon: TrendingUp, color: '#ec4899' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" style={{ marginBottom: 32 }}>
        <motion.h1 custom={0} variants={fadeUp} style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          Welcome back, {user?.first_name}! 👋
        </motion.h1>
        <motion.p custom={1} variants={fadeUp} style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Here's your activity overview
        </motion.p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div initial="hidden" animate="visible"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map((s, i) => (
          <motion.div key={s.label} custom={i + 2} variants={fadeUp} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{s.value}</div>
              </div>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: `${s.color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon size={20} color={s.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }} className="lg:grid-cols-2">
        {/* Recent Bookings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }} className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Recent Bookings</h2>
            <Link to="/bookings" style={{ fontSize: 13, color: 'var(--primary-500)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Calendar size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No bookings yet</p>
              <Link to="/search" className="btn btn-primary btn-sm" style={{ marginTop: 12, textDecoration: 'none' }}>
                Find Skills
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bookings.map(b => (
                <div key={b.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', borderRadius: 12,
                  background: 'var(--bg-glass)', border: '1px solid var(--border-color)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{b.skill?.name || 'Skill'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      {new Date(b.scheduled_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`badge badge-${b.status === 'accepted' ? 'success' : b.status === 'pending' ? 'warning' : 'primary'}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }} className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { to: '/search', label: 'Find a Skill Expert', icon: '🔍', desc: 'Browse skills and book sessions' },
              { to: '/profile', label: 'Update Your Profile', icon: '👤', desc: 'Add skills and portfolio items' },
              { to: '/messages', label: 'Check Messages', icon: '💬', desc: 'View and respond to conversations' },
              { to: '/settings', label: 'Account Settings', icon: '⚙️', desc: 'Manage your preferences' },
            ].map(action => (
              <Link key={action.to} to={action.to} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 12,
                background: 'var(--bg-glass)', border: '1px solid var(--border-color)',
                textDecoration: 'none', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-400)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                <span style={{ fontSize: 24 }}>{action.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{action.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{action.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
