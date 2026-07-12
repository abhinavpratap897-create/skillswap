import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Calendar, Clock, MapPin, ArrowLeft, Check } from 'lucide-react';

export default function BookingPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ date: '', time: '10:00', duration: 60, notes: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const scheduled_at = new Date(`${form.date}T${form.time}`).toISOString();
      await api.post('/api/bookings', {
        provider_id: userId,
        skill_id: '00000000-0000-0000-0000-000000000000', // placeholder
        scheduled_at, duration_minutes: form.duration, notes: form.notes, location: form.location,
      });
      setSuccess(true);
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (err) { setError(err.response?.data?.detail || 'Booking failed'); }
    setLoading(false);
  };

  const timeSlots = Array.from({ length: 16 }, (_, i) => { const h = 8 + i; return `${h.toString().padStart(2, '0')}:00`; });

  if (success) return (
    <div className="page-container" style={{ maxWidth: 500, textAlign: 'center', padding: 80 }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Check size={32} color="white" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Booking Sent!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Your booking request has been sent. Redirecting...</p>
      </motion.div>
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: 600 }}>
      <Link to={`/user/${userId}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 20, fontSize: 14 }}>
        <ArrowLeft size={16} /> Back
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Book a Session</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Choose a date and time for your session</p>

        {error && <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, background: 'rgba(239,68,68,0.1)', color: 'var(--error)', fontSize: 13 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="input-label"><Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Date</label>
            <input className="input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="input-label"><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Time</label>
            <select className="input" value={form.time} onChange={e => setForm({...form, time: e.target.value})}>
              {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Duration (minutes)</label>
            <select className="input" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})}>
              {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
            </select>
          </div>
          <div>
            <label className="input-label"><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Location (optional)</label>
            <input className="input" placeholder="Online or physical address" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          </div>
          <div>
            <label className="input-label">Notes (optional)</label>
            <textarea className="input" rows={3} placeholder="Any additional details..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Sending...' : 'Send Booking Request'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
