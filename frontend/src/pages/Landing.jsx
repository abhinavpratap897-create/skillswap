import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Users, MapPin, Star, Shield, MessageSquare } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] } }),
};

const features = [
  { icon: Zap, title: 'Instant Skill Match', desc: 'AI-powered matching connects you with the right experts in seconds.' },
  { icon: Users, title: 'Community Driven', desc: 'Exchange skills with a vibrant community of local professionals.' },
  { icon: MapPin, title: 'Location Based', desc: 'Find experts near you with our interactive map-based search.' },
  { icon: Star, title: 'Verified Reviews', desc: 'Make informed decisions with authentic ratings and reviews.' },
  { icon: Shield, title: 'Secure Bookings', desc: 'Protected transactions and verified profiles for peace of mind.' },
  { icon: MessageSquare, title: 'Real-time Chat', desc: 'Communicate directly with skill providers before booking.' },
];

const categories = [
  { emoji: '💻', name: 'Programming', count: 234 },
  { emoji: '🎨', name: 'Design', count: 189 },
  { emoji: '🎵', name: 'Music', count: 142 },
  { emoji: '🌍', name: 'Languages', count: 198 },
  { emoji: '📷', name: 'Photography', count: 87 },
  { emoji: '✍️', name: 'Writing', count: 156 },
  { emoji: '📈', name: 'Marketing', count: 123 },
  { emoji: '💪', name: 'Fitness', count: 98 },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'UI/UX Designer', text: 'SkillSwap helped me find an amazing guitar teacher in my neighborhood. The booking process was seamless!', rating: 5 },
  { name: 'Marcus Rivera', role: 'Full-Stack Developer', text: 'I exchanged web development skills for photography lessons. Best platform for skill exchange!', rating: 5 },
  { name: 'Priya Patel', role: 'Language Tutor', text: 'As a tutor, SkillSwap has been incredible for growing my client base. The reviews system builds trust.', rating: 5 },
];

export default function Landing() {
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <section style={{
        minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center',
        position: 'relative', padding: '40px 16px',
      }}>
        {/* Background Effects */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-10%', width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 48, alignItems: 'center' }}
            className="md:grid-cols-2">
            <motion.div initial="hidden" animate="visible">
              <motion.div custom={0} variants={fadeUp}
                className="badge badge-primary" style={{ marginBottom: 16 }}>
                🚀 The future of skill exchange
              </motion.div>
              <motion.h1 custom={1} variants={fadeUp} style={{
                fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20,
              }}>
                Share Your Skills,<br />
                <span className="gradient-text">Learn Something New</span>
              </motion.h1>
              <motion.p custom={2} variants={fadeUp} style={{
                fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32,
                maxWidth: 520,
              }}>
                Connect with local experts, exchange skills, and grow together.
                Book sessions, leave reviews, and build your expertise — all in one platform.
              </motion.p>
              <motion.div custom={3} variants={fadeUp} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link to="/search" className="btn btn-secondary btn-lg">
                  Explore Skills
                </Link>
              </motion.div>
              <motion.div custom={4} variants={fadeUp} style={{
                display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap',
              }}>
                {[
                  { value: '10K+', label: 'Active Users' },
                  { value: '500+', label: 'Skills Offered' },
                  { value: '4.9', label: 'Average Rating' },
                ].map(stat => (
                  <div key={stat.label}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary-500)' }}>{stat.value}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden md:block">
              <div className="glass-card animate-float" style={{
                padding: 32, textAlign: 'center', maxWidth: 420, margin: '0 auto',
              }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🤝</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Skill Exchange</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                  Trade knowledge, build connections, grow together
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['React', 'Python', 'Design', 'Music'].map(skill => (
                    <span key={skill} className="badge badge-primary">{skill}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '80px 16px', maxWidth: 1280, margin: '0 auto' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          style={{ textAlign: 'center', marginBottom: 48 }}>
          <motion.h2 custom={0} variants={fadeUp} className="section-title">
            Popular Categories
          </motion.h2>
          <motion.p custom={1} variants={fadeUp} className="section-subtitle" style={{ margin: '8px auto' }}>
            Discover skills across a wide range of categories
          </motion.p>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
          {categories.map((cat, i) => (
            <motion.div key={cat.name} custom={i} variants={fadeUp}>
              <Link to={`/search?category=${cat.name.toLowerCase()}`} className="glass-card"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: 24, textDecoration: 'none', textAlign: 'center',
                }}>
                <span style={{ fontSize: 32, marginBottom: 8 }}>{cat.emoji}</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{cat.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{cat.count} experts</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 16px', background: 'var(--bg-glass)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 48 }}>
            <motion.h2 custom={0} variants={fadeUp} className="section-title">
              Why SkillSwap?
            </motion.h2>
            <motion.p custom={1} variants={fadeUp} className="section-subtitle" style={{ margin: '8px auto' }}>
              Everything you need to learn, teach, and grow
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} variants={fadeUp} className="glass-card" style={{ padding: 28 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'rgba(99,102,241,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>
                  <f.icon size={22} color="var(--primary-500)" />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 16px', maxWidth: 1280, margin: '0 auto' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 48 }}>
          <motion.h2 custom={0} variants={fadeUp} className="section-title">
            What People Say
          </motion.h2>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {testimonials.map((t, i) => (
            <motion.div key={t.name} custom={i} variants={fadeUp} className="glass-card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={16} fill="var(--accent-400)" color="var(--accent-400)" />
                ))}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                "{t.text}"
              </p>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 16px' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="glass-card" style={{
            maxWidth: 800, margin: '0 auto', padding: 48, textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(99,102,241,0.05))',
          }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            Ready to start swapping skills?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
            Join thousands of users already exchanging skills and expertise on SkillSwap.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)', padding: '32px 16px',
        textAlign: 'center', color: 'var(--text-muted)', fontSize: 13,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span>© 2026 SkillSwap. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
