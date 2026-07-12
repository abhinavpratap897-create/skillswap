import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MapPin, Star, Edit3, Plus, ExternalLink, Briefcase } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState('skills');

  useEffect(() => {
    if (!user) return;
    api.get('/api/users/me/profile').then(res => {
      setProfile(res.data.profile);
      setSkills(res.data.skills || []);
      setPortfolios(res.data.portfolios || []);
      setEditForm(res.data.profile || {});
    }).catch(() => {});
    api.get(`/api/reviews/user/${user.id}`).then(res => setReviews(res.data)).catch(() => {});
  }, [user]);

  const saveProfile = async () => {
    const res = await api.put('/api/users/me/profile', editForm);
    setProfile(res.data); setEditing(false);
  };

  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '—';

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card" style={{ padding: 32, marginBottom: 24, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 90, background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))', borderRadius: '20px 20px 0 0', opacity: 0.15 }} />
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative' }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: user?.avatar_url ? `url(${user.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--primary-500), var(--primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white', border: '3px solid var(--bg-secondary)' }}>
            {!user?.avatar_url && user?.first_name?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>{user?.first_name} {user?.last_name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>@{user?.username}</p>
            {profile?.headline && <p style={{ fontWeight: 500, fontSize: 15, marginTop: 4 }}>{profile.headline}</p>}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
              {profile?.city && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {profile.city}</span>}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} fill="var(--accent-400)" color="var(--accent-400)" /> {avgRating}</span>
              {profile?.hourly_rate && <span><Briefcase size={14} /> ${profile.hourly_rate}/hr</span>}
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} className="btn btn-secondary btn-sm"><Edit3 size={14} /> Edit</button>
        </div>
        {profile?.bio && !editing && <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{profile.bio}</p>}
        {editing && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {['headline', 'city', 'country', 'phone', 'hourly_rate', 'website'].map(k => (
                <div key={k}><label className="input-label">{k.replace('_', ' ')}</label>
                <input className="input" value={editForm[k] || ''} onChange={e => setEditForm({...editForm, [k]: e.target.value})} /></div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}><label className="input-label">Bio</label>
            <textarea className="input" rows={3} value={editForm.bio || ''} onChange={e => setEditForm({...editForm, bio: e.target.value})} /></div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={saveProfile} className="btn btn-primary btn-sm">Save</button>
              <button onClick={() => setEditing(false)} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {['skills', 'portfolio', 'reviews'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className="btn-ghost btn-sm"
            style={{ textTransform: 'capitalize', fontWeight: 600, borderRadius: 10, background: activeTab === tab ? 'rgba(99,102,241,0.1)' : 'transparent', color: activeTab === tab ? 'var(--primary-500)' : 'var(--text-secondary)' }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'skills' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {skills.map(s => (
            <div key={s.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>{s.skill?.name}</span>
                <span className={`badge badge-${s.skill_type === 'offer' ? 'success' : 'primary'}`}>{s.skill_type}</span>
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({length: 5}).map((_, i) => <Star key={i} size={14} fill={i < s.proficiency_level ? 'var(--accent-400)' : 'transparent'} color={i < s.proficiency_level ? 'var(--accent-400)' : 'var(--text-muted)'} />)}
              </div>
              {s.hourly_rate && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>${s.hourly_rate}/hr</span>}
            </div>
          ))}
          {!skills.length && <div className="glass-card" style={{ padding: 40, textAlign: 'center', gridColumn: '1/-1' }}><p style={{ color: 'var(--text-muted)' }}>No skills added yet</p></div>}
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {portfolios.map(p => (
            <div key={p.id} className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 6 }}>{p.title}</h3>
              {p.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.description}</p>}
              {p.project_url && <a href={p.project_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--primary-500)', textDecoration: 'none' }}><ExternalLink size={12} /> View</a>}
            </div>
          ))}
          {!portfolios.length && <div className="glass-card" style={{ padding: 40, textAlign: 'center', gridColumn: '1/-1' }}><p style={{ color: 'var(--text-muted)' }}>No portfolio items</p></div>}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map(r => (
            <div key={r.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.author?.first_name} {r.author?.last_name}</div>
                <div style={{ display: 'flex', gap: 2 }}>{Array.from({length: r.rating}).map((_, i) => <Star key={i} size={14} fill="var(--accent-400)" color="var(--accent-400)" />)}</div>
              </div>
              {r.comment && <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{r.comment}</p>}
            </div>
          ))}
          {!reviews.length && <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>No reviews yet</p></div>}
        </div>
      )}
    </div>
  );
}
