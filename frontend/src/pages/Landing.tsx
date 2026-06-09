import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Shield, Globe, Database, Eye, Cpu, Trophy, Zap, ArrowRight } from 'lucide-react';

const agents = [
  { icon: Brain,    name: 'Agent 1',  role: 'CBT Therapist',       color: '#8b5cf6' },
  { icon: Trophy,   name: 'Agent 2',  role: 'Quest Generator',      color: '#fbbf24' },
  { icon: Shield,   name: 'Agent 3',  role: 'Safety Supervisor',    color: '#10b981' },
  { icon: Globe,    name: 'Agent 4',  role: 'Nimble Live Web',      color: '#3b82f6' },
  { icon: Eye,      name: 'Agent 5',  role: 'Biometric Vision',     color: '#f59e0b' },
  { icon: Database, name: 'Agent 6',  role: 'Deep Memory RAG',      color: '#ec4899' },
];

const features = [
  { icon: Brain,    title: 'Gamified CBT',        desc: 'Evidence-based therapy turned into immersive quests with XP and achievements.' },
  { icon: Globe,    title: 'Nimble Live Web',      desc: 'Agent 4 scrapes the live web for real-time clinical resources using Nimble API.' },
  { icon: Eye,      title: 'Biometric Vision',     desc: 'Agent 5 reads your facial micro-expressions via camera for empathetic responses.' },
  { icon: Database, title: 'Long-Term Memory',     desc: 'Agent 6 remembers every session — your AI therapist never forgets your journey.' },
  { icon: Cpu,      title: 'Real-Time Streaming',  desc: 'Watch all 6 agents work live via Server-Sent Events. Total transparency.' },
  { icon: Zap,      title: 'Groq Ultra-Speed',     desc: 'Llama 3.3 70B inference in under 2 seconds. Enterprise-grade performance.' },
];

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!orbRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      orbRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#060d1a', color: '#f9fafb', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
      
      {/* === HERO SECTION === */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px', overflow: 'hidden' }}>
        
        {/* Background Glow Orb */}
        <div ref={orbRef} style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(16,185,129,0.08) 50%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', transition: 'transform 0.1s ease-out' }} />
        
        {/* Animated Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />

        {/* Badge */}
        <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 30, padding: '6px 18px', fontSize: '0.78rem', color: '#a78bfa', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
          DeveloperWeek NY 2026 — Hackathon Submission
        </div>

        {/* Main Orb Avatar */}
        <div className="amaterasu-orb idle" style={{ width: 100, height: 100, marginBottom: 32 }}>
          <div className="orb-core" style={{ width: 50, height: 50 }}></div>
          <div className="orb-ring ring-1" style={{ width: 65, height: 65 }}></div>
          <div className="orb-ring ring-2" style={{ width: 80, height: 80 }}></div>
          <div className="orb-ring ring-3" style={{ width: 100, height: 100 }}></div>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.05, letterSpacing: '-2px' }}>
          <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TheraQuest</span>
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: '#9ca3af', maxWidth: 700, lineHeight: 1.6, margin: '0 0 48px' }}>
          The world's first <strong style={{ color: '#e2e8f0' }}>6-Agent AI Therapeutic System</strong>.<br/>
          Gamified CBT · Live Web Intelligence · Biometric Vision · Deep Memory.
        </p>

        {/* CTA */}
        <button onClick={() => navigate('/therapist')} style={{ background: 'linear-gradient(135deg, #8b5cf6, #10b981)', border: 'none', color: '#fff', padding: '16px 40px', borderRadius: 50, fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 0 40px rgba(139,92,246,0.4)', transition: 'all 0.3s', transform: 'scale(1)' }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
          Begin Your Journey <ArrowRight size={20} />
        </button>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 48, marginTop: 64, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['6', 'AI Agents'], ['<2s', 'Response Time'], ['100%', 'Safety Validated'], ['∞', 'Memory Depth']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#8b5cf6' }}>{val}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* === AGENTS SECTION === */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg, #8b5cf6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          The Amaterasu Pipeline
        </h2>
        <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: 48 }}>6 autonomous agents working in concert to understand you fully.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 }}>
          {agents.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${agent.color}30`, borderRadius: 16, padding: '24px 16px', textAlign: 'center', transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = `${agent.color}10`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: `${agent.color}20`, border: `1px solid ${agent.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Icon size={24} color={agent.color} />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 4 }}>{agent.name}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0' }}>{agent.role}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* === FEATURES SECTION === */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 800, marginBottom: 48, color: '#e2e8f0' }}>Built to Win</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, backdropFilter: 'blur(10px)', transition: 'all 0.3s' }} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139,92,246,0.3)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
                <Icon size={28} color="#8b5cf6" style={{ marginBottom: 14 }} />
                <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: '#e2e8f0' }}>{f.title}</h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#9ca3af', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* === CTA FOOTER === */}
      <section style={{ textAlign: 'center', padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>Ready to transform therapy?</h2>
        <p style={{ color: '#9ca3af', marginBottom: 32 }}>Experience the future of mental wellness — powered by 6 AI agents working for you.</p>
        <button onClick={() => navigate('/therapist')} style={{ background: 'linear-gradient(135deg, #8b5cf6, #10b981)', border: 'none', color: '#fff', padding: '16px 40px', borderRadius: 50, fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 0 40px rgba(139,92,246,0.3)', transition: 'all 0.3s' }}>
          Launch TheraQuest <ArrowRight size={20} />
        </button>
        <p style={{ marginTop: 40, color: '#4b5563', fontSize: '0.8rem' }}>Built with ❤️ for DeveloperWeek NY 2026 · Powered by Groq · Nimble · Supabase · Google Antigravity</p>
      </section>
    </div>
  );
};

export default Landing;
