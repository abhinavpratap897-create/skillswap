import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Send, Search, ArrowLeft } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const bottom = useRef(null);

  useEffect(() => {
    api.get('/api/messages/conversations').then(res => setConversations(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openConversation = async (conv) => {
    setActiveConv(conv);
    const res = await api.get(`/api/messages/conversations/${conv.id}`);
    setMessages(res.data);
    setTimeout(() => bottom.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    await api.post(`/api/messages/conversations/${activeConv.id}`, { content: newMsg });
    setNewMsg('');
    const res = await api.get(`/api/messages/conversations/${activeConv.id}`);
    setMessages(res.data);
    setTimeout(() => bottom.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const getOther = (conv) => conv.participant_one?.id === user?.id ? conv.participant_two : conv.participant_one;

  return (
    <div className="page-container" style={{ maxWidth: 1000, height: 'calc(100vh - 96px)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: activeConv ? '1fr' : '1fr', gap: 16, height: '100%' }}
        className={activeConv ? 'md:grid-cols-[320px_1fr]' : 'md:grid-cols-[320px_1fr]'}>
        {/* Sidebar */}
        <div className="glass-card" style={{ display: activeConv ? 'none' : 'flex', flexDirection: 'column', overflow: 'hidden' }}
          id="conv-sidebar">
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Messages</h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.map(conv => {
              const other = getOther(conv);
              return (
                <div key={conv.id} onClick={() => openConversation(conv)}
                  style={{ display: 'flex', gap: 12, padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {other?.first_name?.[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{other?.first_name} {other?.last_name}</span>
                      {conv.unread_count > 0 && <span className="badge badge-primary" style={{ fontSize: 11 }}>{conv.unread_count}</span>}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.last_message || 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })}
            {!loading && conversations.length === 0 && <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>No conversations yet</p>}
          </div>
        </div>

        {/* Chat Area */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeConv ? (
            <>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setActiveConv(null)} className="btn-ghost md:hidden" style={{ width: 36, height: 36, borderRadius: 10, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowLeft size={18} />
                </button>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>
                  {getOther(activeConv)?.first_name?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{getOther(activeConv)?.first_name} {getOther(activeConv)?.last_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{getOther(activeConv)?.username}</div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.sender_id === user?.id ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%', padding: '10px 14px', borderRadius: 14,
                      background: m.sender_id === user?.id ? 'linear-gradient(135deg, var(--primary-500), var(--primary-600))' : 'var(--bg-glass)',
                      color: m.sender_id === user?.id ? 'white' : 'var(--text-primary)',
                      border: m.sender_id === user?.id ? 'none' : '1px solid var(--border-color)',
                    }}>
                      <p style={{ fontSize: 14 }}>{m.content}</p>
                      <p style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottom} />
              </div>
              <form onSubmit={sendMessage} style={{ padding: 16, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 10 }}>
                <input className="input" placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 12 }}><Send size={16} /></button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', fontSize: 15 }}>
              Select a conversation to start chatting
            </div>
          )}
        </div>

        <style>{`@media(min-width:768px){#conv-sidebar{display:flex!important}}`}</style>
      </div>
    </div>
  );
}
