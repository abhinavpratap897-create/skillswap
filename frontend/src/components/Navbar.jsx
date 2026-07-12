import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Sun, Moon, Menu, X, Home, Search, Calendar, MessageSquare,
  Bell, Settings, User, LogOut, LayoutDashboard, Shield
} from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = user ? [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/search', label: 'Explore', icon: Search },
    { to: '/bookings', label: 'Bookings', icon: Calendar },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
  ] : [
    { to: '/', label: 'Home', icon: Home },
    { to: '/search', label: 'Explore', icon: Search },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-strong" style={{
      position: 'sticky', top: 0, zIndex: 100,
      borderRadius: 0, borderBottom: '1px solid var(--border-color)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 900, color: 'white',
            }}>S</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
              Skill<span style={{ color: 'var(--primary-500)' }}>Swap</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden md:flex">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="btn-ghost btn-sm"
                style={{
                  color: isActive(link.to) ? 'var(--primary-500)' : 'var(--text-secondary)',
                  background: isActive(link.to) ? 'rgba(99,102,241,0.08)' : 'transparent',
                  borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', textDecoration: 'none', fontSize: 14, fontWeight: 500,
                  transition: 'all 0.2s',
                }}>
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggleTheme} className="btn-ghost" style={{
              width: 40, height: 40, borderRadius: 10, padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                <Link to="/notifications" className="btn-ghost" style={{
                  width: 40, height: 40, borderRadius: 10, padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', textDecoration: 'none', color: 'var(--text-secondary)',
                }}>
                  <Bell size={18} />
                </Link>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setProfileOpen(!profileOpen)} style={{
                    width: 36, height: 36, borderRadius: 10, border: '2px solid var(--border-color)',
                    background: user.avatar_url ? `url(${user.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--primary-500), var(--primary-400))',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 14,
                  }}>
                    {!user.avatar_url && user.first_name?.[0]}
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="glass-strong" style={{
                          position: 'absolute', right: 0, top: 48, width: 220, padding: 8,
                          borderRadius: 14, boxShadow: 'var(--shadow-lg)',
                        }}>
                        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: 4 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{user.first_name} {user.last_name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{user.username}</div>
                        </div>
                        {[
                          { to: '/profile', label: 'Profile', icon: User },
                          { to: '/settings', label: 'Settings', icon: Settings },
                          ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
                        ].map(item => (
                          <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                              borderRadius: 8, textDecoration: 'none', color: 'var(--text-secondary)',
                              fontSize: 14, transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => e.target.style.background = 'var(--bg-glass)'}
                            onMouseLeave={e => e.target.style.background = 'transparent'}>
                            <item.icon size={16} /> {item.label}
                          </Link>
                        ))}
                        <button onClick={() => { logout(); setProfileOpen(false); navigate('/'); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                            borderRadius: 8, width: '100%', border: 'none', background: 'transparent',
                            color: 'var(--error)', cursor: 'pointer', fontSize: 14,
                            marginTop: 4, borderTop: '1px solid var(--border-color)', paddingTop: 12,
                          }}>
                          <LogOut size={16} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex" style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Get Started</Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="btn-ghost md:hidden"
              style={{ width: 40, height: 40, borderRadius: 10, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                    borderRadius: 10, textDecoration: 'none', fontSize: 15, fontWeight: 500,
                    color: isActive(link.to) ? 'var(--primary-500)' : 'var(--text-secondary)',
                    background: isActive(link.to) ? 'rgba(99,102,241,0.08)' : 'transparent',
                  }}>
                  <link.icon size={18} /> {link.label}
                </Link>
              ))}
              {!user && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Link to="/login" className="btn btn-secondary" onClick={() => setMobileOpen(false)}
                    style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>Sign In</Link>
                  <Link to="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}
                    style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
