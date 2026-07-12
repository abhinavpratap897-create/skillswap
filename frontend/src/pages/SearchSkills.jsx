import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Search as SearchIcon, Filter, MapPin, Star, X, ChevronDown } from 'lucide-react';

const categories = ['All', 'Programming', 'Design', 'Music', 'Languages', 'Photography', 'Writing', 'Marketing', 'Fitness', 'Cooking', 'Business'];

export default function SearchSkills() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('All');
  const [filters, setFilters] = useState({ skill_type: '', max_rate: '', city: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { doSearch(); }, [category]);

  const doSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category !== 'All') params.append('category', category.toLowerCase());
      if (filters.skill_type) params.append('skill_type', filters.skill_type);
      if (filters.max_rate) params.append('max_rate', filters.max_rate);
      if (filters.city) params.append('city', filters.city);
      const res = await api.get(`/api/search?${params}`);
      setResults(res.data.users || []);
    } catch { setResults([]); }
    setLoading(false);
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Explore Skills</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Find experts and exchange skills</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <SearchIcon size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" style={{ paddingLeft: 42 }} placeholder="Search skills, names..."
              value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} />
          </div>
          <button onClick={doSearch} className="btn btn-primary">Search</button>
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-secondary">
            <Filter size={16} /> Filters
          </button>
        </div>

        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            <div>
              <label className="input-label">Type</label>
              <select className="input" value={filters.skill_type} onChange={e => setFilters({...filters, skill_type: e.target.value})}>
                <option value="">All Types</option><option value="offer">Offering</option><option value="request">Requesting</option>
              </select>
            </div>
            <div>
              <label className="input-label">Max Rate ($/hr)</label>
              <input className="input" type="number" placeholder="100" value={filters.max_rate} onChange={e => setFilters({...filters, max_rate: e.target.value})} />
            </div>
            <div>
              <label className="input-label">City</label>
              <input className="input" placeholder="San Francisco" value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)} className="btn-sm"
            style={{ borderRadius: 100, border: '1px solid var(--border-color)', background: category === c ? 'var(--primary-500)' : 'var(--bg-glass)', color: category === c ? 'white' : 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 500, padding: '6px 16px', fontSize: 13, transition: 'all 0.2s' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div className="animate-pulse-glow" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-500)', margin: '0 auto 16px', opacity: 0.3 }} />
          Searching...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {results.map((r, i) => (
            <motion.div key={r.user.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <Link to={`/user/${r.user.id}`} className="glass-card" style={{ display: 'block', padding: 24, textDecoration: 'none' }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: r.user.avatar_url ? `url(${r.user.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--primary-500), var(--primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                    {!r.user.avatar_url && r.user.first_name?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{r.user.first_name} {r.user.last_name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>@{r.user.username}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 600, color: 'var(--accent-500)' }}>
                    <Star size={14} fill="var(--accent-400)" color="var(--accent-400)" /> {r.avg_rating}
                  </div>
                </div>
                {r.profile?.headline && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10 }}>{r.profile.headline}</p>}
                {r.skills?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                    {r.skills.slice(0, 3).map(s => (
                      <span key={s.id} className={`badge badge-${s.skill_type === 'offer' ? 'success' : 'primary'}`}>{s.skill?.name}</span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                  {r.profile?.city && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {r.profile.city}</span>}
                  {r.profile?.hourly_rate && <span>${r.profile.hourly_rate}/hr</span>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
      {!loading && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <SearchIcon size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>No results found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
