import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { MapPin, Star, Calendar, MessageSquare, Briefcase, ArrowLeft } from 'lucide-react';

export default function SkillDetails() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      api.get(`/api/users/${userId}/profile`).catch(() => ({data:null})),
      api.get(`/api/reviews/user/${userId}`).catch(() => ({data:[]})),
    ]).then(([p, r]) => { setProfile(p.data); setReviews(r.data); }).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="page-container" style={{ textAlign: 'center', padding: 80 }}>Loading...</div>;
  if (!profile) return <div className="page-container" style={{ textAlign: 'center', padding: 80 }}>User not found</div>;

  const u = profile.user;
  const p = profile.profile;

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <Link to="/search" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 20, fontSize: 14 }}>
        <ArrowLeft size={16} /> Back to search
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: u.avatar_url ? `url(${u.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--primary-500), var(--primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white' }}>
            {!u.avatar_url && u.first_name?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>{u.first_name} {u.last_name}</h1>
            {p?.headline && <p style={{ fontWeight: 500, marginTop: 4 }}>{p.headline}</p>}
            <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-secondary)' }}>
              {p?.city && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {p.city}</span>}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} fill="var(--accent-400)" color="var(--accent-400)" /> {profile.avg_rating} ({profile.total_reviews})</span>
              {p?.hourly_rate && <span><Briefcase size={14} /> ${p.hourly_rate}/hr</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/messages" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}><MessageSquare size={14} /> Message</Link>
            <Link to={`/book/${userId}`} className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Calendar size={14} /> Book Now</Link>
          </div>
        </div>
        {p?.bio && <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{p.bio}</p>}
      </motion.div>

      {/* Skills */}
      {profile.skills?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Skills</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {profile.skills.map(s => (
              <div key={s.id} className="glass-card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{s.skill?.name}</span>
                  <span className={`badge badge-${s.skill_type === 'offer' ? 'success' : 'primary'}`}>{s.skill_type}</span>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({length:5}).map((_,i) => <Star key={i} size={12} fill={i < s.proficiency_level ? 'var(--accent-400)' : 'transparent'} color={i < s.proficiency_level ? 'var(--accent-400)' : 'var(--text-muted)'} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Reviews ({reviews.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {reviews.map(r => (
          <div key={r.id} className="glass-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{r.author?.first_name} {r.author?.last_name}</span>
              <div style={{ display: 'flex', gap: 2 }}>{Array.from({length:r.rating}).map((_,i) => <Star key={i} size={12} fill="var(--accent-400)" color="var(--accent-400)" />)}</div>
            </div>
            {r.comment && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.comment}</p>}
          </div>
        ))}
        {reviews.length === 0 && <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No reviews yet</div>}
      </div>
    </div>
  );
}
