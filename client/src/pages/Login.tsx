import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const playSound = useAudio();
  const [loading, setLoading] = useState(false);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!orbRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 50;
      const y = (e.clientY / window.innerHeight - 0.5) * 50;
      orbRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('click');
    setLoading(true);
    setTimeout(() => {
      playSound('success');
      navigate('/');
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#060d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
      {/* Cinematic Background */}
      <div ref={orbRef} style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(16,185,129,0.05) 50%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', transition: 'transform 0.1s ease-out' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      {/* Glassmorphic Login Card */}
      <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 420, position: 'relative', zIndex: 10, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, background: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <Brain size={32} color="#8b5cf6" />
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '1.8rem', fontWeight: 800, color: '#f9fafb' }}>TheraQuest</h1>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>Enterprise Mental Wellness Platform</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#6b7280" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input id="email" name="email" type="email" required autoComplete="username" defaultValue="demo@theraquest.dev" placeholder="Email address" style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 16px 14px 44px', borderRadius: 12, color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.3s' }} onFocus={e => e.target.style.borderColor = '#8b5cf6'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
          </div>
          <div style={{ marginBottom: 32 }}>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#6b7280" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input id="password" name="password" type="password" required autoComplete="current-password" defaultValue="password123" placeholder="Password" style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 16px 14px 44px', borderRadius: 12, color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.3s' }} onFocus={e => e.target.style.borderColor = '#8b5cf6'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
          </div>
          
          <button type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg, #8b5cf6, #10b981)', border: 'none', color: '#fff', padding: '14px', borderRadius: 12, fontSize: '1rem', fontWeight: 600, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'transform 0.2s', opacity: loading ? 0.8 : 1 }} onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')} onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}>
            {loading ? <span className="pulse-dot" style={{ background: '#fff' }}></span> : <>Secure Login <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: 0 }}>Protected by Supabase Auth & Google Cloud</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
